const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const { reviewValidation } = require('../middleware/validate');

router.get('/item/:itemId', async (req, res) => {
    try {
        const [reviews] = await pool.query(`
            SELECT r.*, u.name as reviewer_name
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.item_id = ?
            ORDER BY r.review_date DESC
        `, [req.params.itemId]);
        
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
            FROM reviews WHERE item_id = ?
        `, [req.params.itemId]);
        
        res.json({
            success: true,
            reviews,
            stats: {
                total: stats[0].total_reviews,
                average: stats[0].average_rating ? parseFloat(stats[0].average_rating.toFixed(1)) : 0,
                distribution: {
                    5: stats[0].five_star,
                    4: stats[0].four_star,
                    3: stats[0].three_star,
                    2: stats[0].two_star,
                    1: stats[0].one_star
                }
            }
        });
    } catch (err) {
        console.error('Get reviews error:', err);
        res.status(500).json({ success: false, message: 'Failed to get reviews' });
    }
});

router.post('/', auth, reviewValidation, async (req, res) => {
    try {
        const { item_id, rating, comment } = req.body;
        
        const [items] = await pool.query(
            'SELECT * FROM items WHERE item_id = ?',
            [item_id]
        );
        
        if (items.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        
        if (items[0].status !== 'sold') {
            return res.status(400).json({ success: false, message: 'Can only review sold items' });
        }
        
        if (items[0].winner_id !== req.user.id && items[0].seller_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You can only review items you bought or sold' });
        }
        
        const [existingReview] = await pool.query(
            'SELECT * FROM reviews WHERE item_id = ? AND user_id = ?',
            [item_id, req.user.id]
        );
        
        if (existingReview.length > 0) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this item' });
        }
        
        const [result] = await pool.query(
            'INSERT INTO reviews (rating, comment, user_id, item_id) VALUES (?, ?, ?, ?)',
            [rating, comment || '', req.user.id, item_id]
        );
        
        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review_id: result.insertId
        });
    } catch (err) {
        console.error('Create review error:', err);
        res.status(500).json({ success: false, message: 'Failed to create review' });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const [reviews] = await pool.query(`
            SELECT r.*, i.title as item_title, i.image_url, u.name as reviewer_name
            FROM reviews r
            JOIN items i ON r.item_id = i.item_id
            JOIN users u ON r.user_id = u.user_id
            WHERE i.seller_id = ?
            ORDER BY r.review_date DESC
        `, [req.params.userId]);
        
        res.json({ success: true, reviews });
    } catch (err) {
        console.error('Get user reviews error:', err);
        res.status(500).json({ success: false, message: 'Failed to get reviews' });
    }
});

module.exports = router;
