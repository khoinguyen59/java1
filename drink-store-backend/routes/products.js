// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products with PAGINATION and SEARCH
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4; // Mặc định 4 sản phẩm/trang
    const searchQuery = req.query.search || "";
    const skipIndex = (page - 1) * limit;

    try {
        let query = {};
        if (searchQuery) {
            query = {
                $or: [
                    { tenSanPham: { $regex: searchQuery, $options: 'i' } },
                    { maSP: { $regex: searchQuery, $options: 'i' } }
                ]
            };
        }
        const products = await Product.find(query).sort({ createdAt: -1 }).limit(limit).skip(skipIndex).exec();
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);
        res.json({ products, currentPage: page, totalPages, totalProducts });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server: " + err.message });
    }
});

// POST a new product (CREATE)
router.post('/', async (req, res) => {
    const { maSP, tenSanPham, danhMuc, giaBan, trangThai } = req.body;
    if (!maSP || !tenSanPham || !danhMuc || giaBan === undefined || !trangThai) {
        return res.status(400).json({ message: "Vui lòng cung cấp đủ thông tin sản phẩm." });
    }
    const existingProduct = await Product.findOne({ maSP: maSP });
    if (existingProduct) {
        return res.status(400).json({ message: `Mã SP "${maSP}" đã tồn tại.` });
    }
    const product = new Product({ maSP, tenSanPham, danhMuc, giaBan, trangThai });
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: "Lỗi khi tạo sản phẩm: " + err.message });
    }
});

async function getProduct(req, res, next) {
    let product;
    try {
        product = await Product.findById(req.params.id);
        if (product == null) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    } catch (err) { return res.status(500).json({ message: err.message }); }
    res.product = product;
    next();
}

router.get('/:id', getProduct, (req, res) => { res.json(res.product); });

router.put('/:id', getProduct, async (req, res) => {
    const { maSP, tenSanPham, danhMuc, giaBan, trangThai } = req.body;
    if (maSP != null) res.product.maSP = maSP; // Cẩn thận nếu cho sửa Mã SP
    if (tenSanPham != null) res.product.tenSanPham = tenSanPham;
    if (danhMuc != null) res.product.danhMuc = danhMuc;
    if (giaBan != null) res.product.giaBan = giaBan;
    if (trangThai != null) res.product.trangThai = trangThai;
    try {
        const updatedProduct = await res.product.save();
        res.json(updatedProduct);
    } catch (err) { res.status(400).json({ message: "Lỗi khi cập nhật: " + err.message }); }
});

// DELETE a product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa với ID này.' });
        }
        res.json({ message: 'Đã xóa sản phẩm thành công.' }); // Thông báo thành công rõ ràng hơn
    } catch (err) {
        console.error("Backend - Lỗi khi xóa sản phẩm:", err); // Log lỗi chi tiết ở backend
        if (err.name === 'CastError') { // Xử lý lỗi ID không hợp lệ
            return res.status(400).json({ message: 'ID sản phẩm không hợp lệ.' });
        }
        res.status(500).json({ message: "Lỗi server khi cố gắng xóa sản phẩm: " + err.message });
    }
});

module.exports = router;