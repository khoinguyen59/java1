// drink-store-backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const customerApiRoutes = require('./routes/customers');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err.message));

app.use('/api/customers', customerApiRoutes);
// Ví dụ: app.use('/api/products', require('./routes/products'));
// Ví dụ: app.use('/api/auth', require('./routes/auth'));


app.use('/login-assets', express.static(path.join(__dirname, '..', 'login', 'src')));
app.use(express.static(path.join(__dirname, '..', 'drink-store-admin', 'src')));
app.use(express.static(path.join(__dirname, '..', 'drink-store-nhanvien')));

app.get('/auth', (req, res) => res.sendFile(path.join(__dirname, '..', 'login', 'html', 'auth_page.html')));
app.get('/login', (req, res) => res.redirect('/auth'));
app.get('/register', (req, res) => res.redirect('/auth'));

app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '..', 'drink-store-admin', 'src', 'dashboard.html')));
app.get('/products', (req, res) => res.sendFile(path.join(__dirname, '..', 'drink-store-admin', 'src', 'products.html')));
app.get('/customers', (req, res) => res.sendFile(path.join(__dirname, '..', 'drink-store-admin', 'src', 'customers.html')));
// Thêm các route HTML khác cho admin nếu có

app.get('/staff_dashboard', (req, res) => res.sendFile(path.join(__dirname, '..', 'drink-store-nhanvien', 'staff_dashboard.html')));
app.get('/order', (req, res) => res.sendFile(path.join(__dirname, '..', 'drink-store-nhanvien', 'staff_order.html')));
app.get('/schedule', (req, res) => res.sendFile(path.join(__dirname, '..', 'drink-store-nhanvien', 'staff_schedule.html')));
// Thêm các route HTML khác cho nhân viên nếu có

app.get('/', (req, res) => res.redirect('/auth'));

app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ message: `API endpoint không tìm thấy: ${req.originalUrl}` });
    }
    res.status(404).send(`Trang không tìm thấy: ${req.originalUrl}.`);
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack || err.message || err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Đã có lỗi xảy ra trên server!';
    if (process.env.NODE_ENV === 'development') {
        return res.status(statusCode).json({ message, error: { name: err.name, details: err.message }, stack: err.stack });
    }
    res.status(statusCode).json({ message });
});

app.listen(port, () => {
    console.log(`Server đang chạy trên port ${port}`);
    console.log(`Auth Page: http://localhost:${port}/auth`);
    console.log(`Admin Dashboard: http://localhost:${port}/dashboard`);
    console.log(`Admin Customers: http://localhost:${port}/customers (HTML)`);
    console.log(`API Customers: http://localhost:${port}/api/customers (API)`);
    console.log(`Staff Dashboard: http://localhost:${port}/staff_dashboard`);
});