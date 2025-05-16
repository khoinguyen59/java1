// drink-store-backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }
    if (!['staff', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
    }

    try {
        let user = await User.findOne({ username: username.toLowerCase() });
        if (user) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại.' });
        }
        user = new User({ username: username.toLowerCase(), password, role });
        await user.save();
        res.status(201).json({ message: 'Đăng ký thành công! Vui lòng đăng nhập.' });
    } catch (err) {
        console.error("Lỗi đăng ký:", err.message);
        const messages = err.errors ? Object.values(err.errors).map(val => val.message) : [err.message];
        res.status(500).json({ message: messages.join(', ') || 'Lỗi Server' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp tên đăng nhập và mật khẩu.' });
    }
    try {
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        }
        const payload = { user: { id: user.id, role: user.role, username: user.username } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, role: user.role, username: user.username, message: 'Đăng nhập thành công!' });
        });
    } catch (err) {
        console.error("Lỗi đăng nhập:", err.message);
        res.status(500).send('Lỗi Server');
    }
});

module.exports = router;