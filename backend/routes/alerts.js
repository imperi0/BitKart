const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const { alertValidation } = require('../middleware/validate');

router.get('/', auth, async (req, res) => {
    try {
        const [alerts] = await pool.query(`
            SELECT a.*, c.cat_name
            FROM alerts a
            JOIN categories c ON a.cat_id = c.cat_id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC
        `, [req.user.id]);
        
        res.json({ success: true, alerts });
    } catch (err) {
        console.error('Get alerts error:', err);
        res.status(500).json({ success: false, message: 'Failed to get alerts' });
    }
});

router.post('/', auth, alertValidation, async (req, res) => {
    try {
        const { cat_id, keyword, min_price, max_price } = req.body;
        
        if (max_price && min_price && parseFloat(max_price) < parseFloat(min_price)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Maximum price must be greater than minimum price' 
            });
        }
        
        const [result] = await pool.query(
            'INSERT INTO alerts (user_id, cat_id, keyword, min_price, max_price) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, cat_id, keyword || null, min_price || null, max_price || null]
        );
        
        res.status(201).json({
            success: true,
            message: 'Alert created successfully',
            alert_id: result.insertId
        });
    } catch (err) {
        console.error('Create alert error:', err);
        res.status(500).json({ success: false, message: 'Failed to create alert' });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const { is_active, keyword, min_price, max_price } = req.body;
        
        const [alerts] = await pool.query(
            'SELECT * FROM alerts WHERE alert_id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        
        if (alerts.length === 0) {
            return res.status(404).json({ success: false, message: 'Alert not found' });
        }
        
        await pool.query(
            'UPDATE alerts SET is_active = ?, keyword = ?, min_price = ?, max_price = ? WHERE alert_id = ?',
            [
                is_active !== undefined ? is_active : alerts[0].is_active,
                keyword !== undefined ? keyword : alerts[0].keyword,
                min_price !== undefined ? min_price : alerts[0].min_price,
                max_price !== undefined ? max_price : alerts[0].max_price,
                req.params.id
            ]
        );
        
        res.json({ success: true, message: 'Alert updated' });
    } catch (err) {
        console.error('Update alert error:', err);
        res.status(500).json({ success: false, message: 'Failed to update alert' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM alerts WHERE alert_id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Alert not found' });
        }
        
        res.json({ success: true, message: 'Alert deleted' });
    } catch (err) {
        console.error('Delete alert error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete alert' });
    }
});

router.get('/notifications', auth, async (req, res) => {
    try {
        const [notifications] = await pool.query(`
            SELECT an.*, i.title as item_title, i.current_price, i.image_url, c.cat_name
            FROM alert_notifications an
            JOIN alerts a ON an.alert_id = a.alert_id
            JOIN items i ON an.item_id = i.item_id
            JOIN categories c ON i.cat_id = c.cat_id
            WHERE a.user_id = ?
            ORDER BY an.created_at DESC
            LIMIT 50
        `, [req.user.id]);
        
        res.json({ success: true, notifications });
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ success: false, message: 'Failed to get notifications' });
    }
});

router.put('/notifications/:id/read', auth, async (req, res) => {
    try {
        await pool.query(`
            UPDATE alert_notifications an
            JOIN alerts a ON an.alert_id = a.alert_id
            SET an.is_read = TRUE
            WHERE an.notification_id = ? AND a.user_id = ?
        `, [req.params.id, req.user.id]);
        
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
        console.error('Mark notification read error:', err);
        res.status(500).json({ success: false, message: 'Failed to mark notification' });
    }
});

module.exports = router;
