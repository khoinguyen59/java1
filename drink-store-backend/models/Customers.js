// drink-store-backend/models/Customers.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    registrationDate: { type: Date, default: Date.now },
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);

const invoiceItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true },
    subtotal: { type: Number, required: true }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    invoiceCode: { type: String, required: true, unique: true },
    orderDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        required: true,
        enum: ['Đang Xử Lý', 'Đã Xác Nhận', 'Đang Giao', 'Đã Giao', 'Hoàn Thành', 'Đã Hủy'],
        default: 'Đang Xử Lý'
    },
    items: [invoiceItemSchema]
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);

// Giả sử bạn có Product model, nếu không thì bỏ comment hoặc xóa
// const productSchema = new mongoose.Schema({ name: String, price: Number /* ... other fields ... */ });
// const Product = mongoose.model('Product', productSchema);

module.exports = { Customer, Invoice /*, Product */ };