const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { registerValidation, loginValidation } = require('../middleware/validate');
const { auth } = require('../middleware/auth');

router.post('/register', registerValidation, async (req, res) => {
    try {
        const { name, email, phone, password, address } = req.body;
        
        const [existing] = await pool.query(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const [result] = await pool.query(
            'INSERT INTO users (name, email, phone, password_hash, address) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, passwordHash, address || '']
        );
        
        const token = jwt.sign(
            { id: result.insertId, email, is_admin: false },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: { id: result.insertId, name, email, phone, is_admin: false }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

router.post('/login', loginValidation, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.user_id, email: user.email, is_admin: user.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                is_admin: user.is_admin
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT user_id, name, email, phone, address, is_admin, created_at FROM users WHERE user_id = ?',
            [req.user.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const [wallet] = await pool.query(
            'SELECT balance FROM wallets WHERE user_id = ?',
            [req.user.id]
        );
        
        res.json({
            success: true,
            user: { 
                id: users[0].user_id,
                name: users[0].name,
                email: users[0].email,
                phone: users[0].phone,
                address: users[0].address,
                is_admin: users[0].is_admin,
                balance: wallet[0]?.balance || 0
            }
        });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ success: false, message: 'Failed to get user data' });
    }
});

module.exports = router;
