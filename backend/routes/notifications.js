const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const [notifications] = await pool.query(`
            SELECT n.*, i.title as item_title, i.image_url as item_image
            FROM notifications n
            LEFT JOIN items i ON n.item_id = i.item_id
            WHERE n.user_id = ?
            ORDER BY n.created_at DESC
            LIMIT 50
        `, [req.user.id]);
        
        res.json({ success: true, notifications });
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ success: false, message: 'Failed to get notifications' });
    }
});

router.get('/unread-count', auth, async (req, res) => {
    try {
        const [result] = await pool.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [req.user.id]
        );
        
        res.json({ success: true, count: result[0].count });
    } catch (err) {
        console.error('Get unread count error:', err);
        res.status(500).json({ success: false, message: 'Failed to get count' });
    }
});

router.put('/:id/read', auth, async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
        console.error('Mark read error:', err);
        res.status(500).json({ success: false, message: 'Failed to mark as read' });
    }
});

router.put('/read-all', auth, async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
            [req.user.id]
        );
        
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Mark all read error:', err);
        res.status(500).json({ success: false, message: 'Failed to mark all as read' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM notifications WHERE notification_id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        
        res.json({ success: true, message: 'Notification deleted' });
    } catch (err) {
        console.error('Delete notification error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
});

router.delete('/clear-all', auth, async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM notifications WHERE user_id = ?',
            [req.user.id]
        );
        
        res.json({ success: true, message: 'All notifications cleared' });
    } catch (err) {
        console.error('Clear all error:', err);
        res.status(500).json({ success: false, message: 'Failed to clear notifications' });
    }
});

module.exports = router;
