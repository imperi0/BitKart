const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT user_id, name, email, phone, address, is_admin, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, users });
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ success: false, message: 'Failed to get users' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT user_id, name, email, phone, address, is_admin, created_at FROM users WHERE user_id = ?',
            [req.params.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, user: users[0] });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ success: false, message: 'Failed to get user' });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.id !== parseInt(req.params.id) && !req.user.is_admin) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        
        const { name, phone, address } = req.body;
        await pool.query(
            'UPDATE users SET name = ?, phone = ?, address = ? WHERE user_id = ?',
            [name, phone, address, req.params.id]
        );
        
        res.json({ success: true, message: 'Profile updated' });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
});

router.delete('/:id', adminOnly, async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});

module.exports = router;
