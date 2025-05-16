// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    maSP: { type: String, required: true, unique: true },
    tenSanPham: { type: String, required: true },
    danhMuc: { type: String, required: true },
    giaBan: { type: Number, required: true },
    hinhAnh: { type: String },
    trangThai: { type: String, required: true, enum: ['Đang bán', 'Ngừng bán', 'Hết hàng'] }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

