// drink-store-backend/routes/customers.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Customer, Invoice } = require('../models/Customers');

// GET /api/customers/
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchTerm = req.query.search || '';
        const fieldsToSelect = 'name email phone avatarUrl registrationDate';
        const query = searchTerm ? {
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
                { phone: { $regex: searchTerm, $options: 'i' } }
            ]
        } : {};

        const customers = await Customer.find(query)
            .select(fieldsToSelect)
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });
        const totalItems = await Customer.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);
        res.json({ customers, totalPages, currentPage: page, totalItems });
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách khách hàng." });
    }
});

// GET /api/customers/:id/details-for-modal
router.get('/:id/details-for-modal', async (req, res) => {
    try {
        const customerId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ message: "ID khách hàng không hợp lệ." });
        }
        const customerInfo = await Customer.findById(customerId).lean();
        if (!customerInfo) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng." });
        }

        const invoicePage = parseInt(req.query.invoicePage) || 1;
        const invoiceLimit = parseInt(req.query.invoiceLimit) || 5;
        const customerInvoices = await Invoice.find({ customerId: customerId })
            .sort({ orderDate: -1 })
            .limit(invoiceLimit)
            .skip((invoicePage - 1) * invoiceLimit)
            .lean();
        const totalCustomerInvoicesCount = await Invoice.countDocuments({ customerId: customerId });
        const totalInvoicesPages = Math.ceil(totalCustomerInvoicesCount / invoiceLimit);

        const aggregationResult = await Invoice.aggregate([
            { $match: { customerId: new mongoose.Types.ObjectId(customerId) } },
            { $group: { _id: null, totalSpent: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } }
        ]);
        const summary = aggregationResult[0] || { totalSpent: 0, totalOrders: 0 };

        const allInvoicesForFrequency = await Invoice.find({ customerId: customerId }).select('orderDate').lean();
        const monthlyVisits = {};
        allInvoicesForFrequency.forEach(invoice => {
            const monthYear = new Date(invoice.orderDate).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
            monthlyVisits[monthYear] = (monthlyVisits[monthYear] || 0) + 1;
        });
        const sortedMonths = Object.keys(monthlyVisits).sort((a, b) => {
            const [monthA, yearA] = a.split('/'); const [monthB, yearB] = b.split('/');
            return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
        });
        const frequencyData = {
            labels: sortedMonths.map(my => `T${my.replace('/', '-')}`),
            visits: sortedMonths.map(month => monthlyVisits[month])
        };

        res.json({
            customerInfo,
            invoices: customerInvoices,
            totalInvoicesPages,
            currentInvoicePage: invoicePage,
            totalSpent: summary.totalSpent,
            totalOrders: summary.totalOrders,
            frequencyData
        });
    } catch (error) {
        console.error(`Error fetching details for customer ${req.params.id}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết khách hàng." });
    }
});

// POST /api/customers/
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, address, avatarUrl } = req.body;
        if (!name || !email) return res.status(400).json({ message: "Tên và email là bắt buộc." });
        if (await Customer.findOne({ email })) return res.status(400).json({ message: "Email đã tồn tại." });
        const newCustomer = new Customer({ name, email, phone, address, avatarUrl });
        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (error) {
        console.error("Error creating customer:", error);
        if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
        res.status(500).json({ message: "Lỗi máy chủ khi tạo khách hàng." });
    }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(customerId)) return res.status(400).json({ message: "ID khách hàng không hợp lệ." });
        const updatedData = req.body;
        if (updatedData.email) delete updatedData.email;
        const updatedCustomer = await Customer.findByIdAndUpdate(customerId, updatedData, { new: true, runValidators: true });
        if (!updatedCustomer) return res.status(404).json({ message: "Không tìm thấy khách hàng để cập nhật." });
        res.json(updatedCustomer);
    } catch (error) {
        console.error(`Error updating customer ${req.params.id}:`, error);
        if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật khách hàng." });
    }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(customerId)) return res.status(400).json({ message: "ID khách hàng không hợp lệ." });
        const customerToDelete = await Customer.findById(customerId);
        if (!customerToDelete) return res.status(404).json({ message: "Không tìm thấy khách hàng để xóa." });
        // await Invoice.deleteMany({ customerId: customerId }); // Cân nhắc việc xóa hóa đơn liên quan
        await Customer.findByIdAndDelete(customerId);
        res.json({ message: `Khách hàng ${customerToDelete.name} đã được xóa thành công.` });
    } catch (error) {
        console.error(`Error deleting customer ${req.params.id}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi xóa khách hàng." });
    }
});

// GET /api/invoices/:invoiceId (Ví dụ, nếu bạn cần API riêng cho invoice chi tiết)
// Hiện tại, thông tin item của hóa đơn được trả về trong /details-for-modal
// Nếu không cần, có thể bỏ route này.
router.get('/invoices/:invoiceId', async (req, res) => {
    try {
        const { invoiceId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
            return res.status(400).json({ message: "ID hóa đơn không hợp lệ." });
        }
        const invoice = await Invoice.findById(invoiceId).lean();
        if (!invoice) {
            return res.status(404).json({ message: "Không tìm thấy hóa đơn." });
        }
        res.json(invoice);
    } catch (error) {
        console.error(`Error fetching invoice ${req.params.invoiceId}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết hóa đơn." });
    }
});


module.exports = router;