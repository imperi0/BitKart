const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM items WHERE seller_id = ?) as total_listings,
                (SELECT COUNT(*) FROM items WHERE seller_id = ? AND status = 'sold') as items_sold,
                (SELECT COUNT(*) FROM items WHERE seller_id = ? AND status = 'active') as active_listings,
                (SELECT COUNT(*) FROM bids WHERE user_id = ?) as total_bids,
                (SELECT COUNT(*) FROM items i JOIN bids b ON i.item_id = b.item_id WHERE b.user_id = ? AND i.status = 'sold' AND i.winner_id = ?) as items_won,
                (SELECT COUNT(*) FROM reviews WHERE user_id = ?) as reviews_given,
                (SELECT COUNT(*) FROM reviews r JOIN items i ON r.item_id = i.item_id WHERE i.seller_id = ?) as reviews_received,
                (SELECT COUNT(*) FROM alert_notifications an JOIN alerts a ON an.alert_id = a.alert_id WHERE a.user_id = ? AND an.is_read = FALSE) as unread_notifications,
                (SELECT COUNT(*) FROM alerts WHERE user_id = ?) as total_alerts
        `, [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]);
        
        const [wallet] = await pool.query(
            'SELECT balance FROM wallets WHERE user_id = ?',
            [req.user.id]
        );
        
        const [recentBids] = await pool.query(`
            SELECT b.*, i.title as item_title, i.image_url, i.current_price, i.status
            FROM bids b
            JOIN items i ON b.item_id = i.item_id
            WHERE b.user_id = ?
            ORDER BY b.bid_time DESC
            LIMIT 5
        `, [req.user.id]);
        
        const [recentActivity] = await pool.query(`
            SELECT * FROM (
                SELECT 'bid_placed' as type, bid_id as id, bid_time as time, item_id, bid_amount as amount, user_id
                FROM bids WHERE user_id = ?
                UNION ALL
                SELECT 'item_listed' as type, item_id as id, created_at as time, item_id, current_price as amount, seller_id as user_id
                FROM items WHERE seller_id = ?
                UNION ALL
                SELECT 'item_sold' as type, item_id as id, updated_at as time, item_id, current_price as amount, seller_id as user_id
                FROM items WHERE seller_id = ? AND status = 'sold'
            ) activity
            ORDER BY time DESC
            LIMIT 10
        `, [req.user.id, req.user.id, req.user.id]);
        
        res.json({
            success: true,
            stats: {
                ...stats[0],
                wallet_balance: wallet[0]?.balance || 0
            },
            recentBids,
            recentActivity
        });
    } catch (err) {
        console.error('Get dashboard error:', err);
        res.status(500).json({ success: false, message: 'Failed to get dashboard' });
    }
});

module.exports = router;
