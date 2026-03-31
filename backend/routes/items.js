const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, optionalAuth } = require('../middleware/auth');
const { itemValidation } = require('../middleware/validate');

router.get('/', optionalAuth, async (req, res) => {
    try {
        const { cat_id, status, search, seller_id, sort = 'created_at', order = 'DESC', page = 1, limit = 12 } = req.query;
        
        let query = `
            SELECT i.*, u.name as seller_name, c.cat_name,
                   (SELECT COUNT(*) FROM bids WHERE item_id = i.item_id) as bid_count
            FROM items i
            JOIN users u ON i.seller_id = u.user_id
            JOIN categories c ON i.cat_id = c.cat_id
            WHERE 1=1
        `;
        const params = [];
        
        if (cat_id) {
            query += ' AND (i.cat_id = ? OR i.cat_id IN (SELECT cat_id FROM categories WHERE parent_cat_id = ?))';
            params.push(cat_id, cat_id);
        }
        
        if (status) {
            query += ' AND i.status = ?';
            params.push(status);
        } else {
            query += ' AND i.status = "active"';
        }
        
        if (search) {
            query += ' AND (i.title LIKE ? OR i.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        if (seller_id) {
            query += ' AND i.seller_id = ?';
            params.push(seller_id);
        }
        
        const sortColumns = ['created_at', 'current_price', 'auction_end_time', 'title'];
        const sortCol = sortColumns.includes(sort) ? sort : 'created_at';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        query += ` ORDER BY i.${sortCol} ${sortOrder}`;
        
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const [items] = await pool.query(query, params);
        
        let countQuery = 'SELECT COUNT(*) as total FROM items WHERE 1=1';
        const countParams = [];
        
        if (cat_id) {
            countQuery += ' AND (cat_id = ? OR cat_id IN (SELECT cat_id FROM categories WHERE parent_cat_id = ?))';
            countParams.push(cat_id, cat_id);
        }
        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        } else {
            countQuery += ' AND status = "active"';
        }
        if (search) {
            countQuery += ' AND (title LIKE ? OR description LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }
        
        const [countResult] = await pool.query(countQuery, countParams);
        
        res.json({
            success: true,
            items,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (err) {
        console.error('Get items error:', err);
        res.status(500).json({ success: false, message: 'Failed to get items' });
    }
});

router.get('/featured', async (req, res) => {
    try {
        const [items] = await pool.query(`
            SELECT i.*, u.name as seller_name, c.cat_name,
                   (SELECT COUNT(*) FROM bids WHERE item_id = i.item_id) as bid_count
            FROM items i
            JOIN users u ON i.seller_id = u.user_id
            JOIN categories c ON i.cat_id = c.cat_id
            WHERE i.status = 'active' AND i.auction_end_time > NOW()
            ORDER BY bid_count DESC, i.auction_end_time ASC
            LIMIT 8
        `);
        res.json({ success: true, items });
    } catch (err) {
        console.error('Get featured items error:', err);
        res.status(500).json({ success: false, message: 'Failed to get featured items' });
    }
});

router.get('/ending-soon', async (req, res) => {
    try {
        const [items] = await pool.query(`
            SELECT i.*, u.name as seller_name, c.cat_name,
                   (SELECT COUNT(*) FROM bids WHERE item_id = i.item_id) as bid_count
            FROM items i
            JOIN users u ON i.seller_id = u.user_id
            JOIN categories c ON i.cat_id = c.cat_id
            WHERE i.status = 'active' AND i.auction_end_time > NOW() AND i.auction_end_time <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
            ORDER BY i.auction_end_time ASC
            LIMIT 6
        `);
        res.json({ success: true, items });
    } catch (err) {
        console.error('Get ending soon items error:', err);
        res.status(500).json({ success: false, message: 'Failed to get items' });
    }
});

router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const [items] = await pool.query(`
            SELECT i.*, u.name as seller_name, u.phone as seller_phone, u.address as seller_address, c.cat_name,
                   w.balance as seller_balance
            FROM items i
            JOIN users u ON i.seller_id = u.user_id
            JOIN categories c ON i.cat_id = c.cat_id
            LEFT JOIN wallets w ON u.user_id = w.user_id
            WHERE i.item_id = ?
        `, [req.params.id]);
        
        if (items.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        
        const [bids] = await pool.query(`
            SELECT b.*, u.name as bidder_name
            FROM bids b
            JOIN users u ON b.user_id = u.user_id
            WHERE b.item_id = ?
            ORDER BY b.bid_amount DESC
            LIMIT 10
        `, [req.params.id]);
        
        const [reviews] = await pool.query(`
            SELECT r.*, u.name as reviewer_name
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.item_id = ?
            ORDER BY r.review_date DESC
        `, [req.params.id]);
        
        res.json({
            success: true,
            item: { ...items[0], bids, reviews }
        });
    } catch (err) {
        console.error('Get item error:', err);
        res.status(500).json({ success: false, message: 'Failed to get item' });
    }
});

router.post('/', auth, itemValidation, async (req, res) => {
    try {
        const { title, description, image_url, base_price, auction_start_time, auction_end_time, cat_id } = req.body;
        
        const startTime = new Date(auction_start_time);
        const endTime = new Date(auction_end_time);
        
        if (endTime <= startTime) {
            return res.status(400).json({ success: false, message: 'End time must be after start time' });
        }
        
        const [result] = await pool.query(
            `INSERT INTO items (title, description, image_url, base_price, current_price, 
              auction_start_time, auction_end_time, seller_id, cat_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description || '', image_url || '', base_price, base_price, 
             auction_start_time, auction_end_time, req.user.id, cat_id]
        );
        
        res.status(201).json({ 
            success: true, 
            message: 'Item listed successfully',
            item_id: result.insertId 
        });
    } catch (err) {
        console.error('Create item error:', err);
        res.status(500).json({ success: false, message: 'Failed to create item' });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const [items] = await pool.query(
            'SELECT * FROM items WHERE item_id = ? AND seller_id = ?',
            [req.params.id, req.user.id]
        );
        
        if (items.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found or not authorized' });
        }
        
        if (items[0].status !== 'active') {
            return res.status(400).json({ success: false, message: 'Cannot modify inactive item' });
        }
        
        const { title, description, image_url, auction_end_time } = req.body;
        await pool.query(
            `UPDATE items SET title = ?, description = ?, image_url = ?, auction_end_time = ?
             WHERE item_id = ?`,
            [title, description, image_url, auction_end_time, req.params.id]
        );
        
        res.json({ success: true, message: 'Item updated' });
    } catch (err) {
        console.error('Update item error:', err);
        res.status(500).json({ success: false, message: 'Failed to update item' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const [items] = await pool.query(
            'SELECT * FROM items WHERE item_id = ? AND seller_id = ?',
            [req.params.id, req.user.id]
        );
        
        if (items.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found or not authorized' });
        }
        
        if (items[0].status === 'sold') {
            return res.status(400).json({ success: false, message: 'Cannot delete sold items' });
        }
        
        await pool.query('UPDATE items SET status = "cancelled" WHERE item_id = ?', [req.params.id]);
        res.json({ success: true, message: 'Item cancelled' });
    } catch (err) {
        console.error('Delete item error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete item' });
    }
});

router.get('/my/items', auth, async (req, res) => {
    try {
        const [items] = await pool.query(`
            SELECT i.*, c.cat_name,
                   (SELECT COUNT(*) FROM bids WHERE item_id = i.item_id) as bid_count
            FROM items i
            JOIN categories c ON i.cat_id = c.cat_id
            WHERE i.seller_id = ?
            ORDER BY i.created_at DESC
        `, [req.user.id]);
        
        res.json({ success: true, items });
    } catch (err) {
        console.error('Get my items error:', err);
        res.status(500).json({ success: false, message: 'Failed to get items' });
    }
});

router.get('/my/bids', auth, async (req, res) => {
    try {
        const [items] = await pool.query(`
            SELECT DISTINCT i.*, c.cat_name,
                   (SELECT MAX(bid_amount) FROM bids WHERE item_id = i.item_id) as my_highest_bid,
                   (SELECT is_winning FROM bids WHERE item_id = i.item_id AND user_id = ? ORDER BY bid_amount DESC LIMIT 1) as is_winning,
                   (SELECT COUNT(*) FROM bids WHERE item_id = i.item_id) as bid_count
            FROM items i
            JOIN categories c ON i.cat_id = c.cat_id
            JOIN bids b ON i.item_id = b.item_id
            WHERE b.user_id = ?
            ORDER BY i.auction_end_time ASC
        `, [req.user.id, req.user.id]);
        
        res.json({ success: true, items });
    } catch (err) {
        console.error('Get my bids error:', err);
        res.status(500).json({ success: false, message: 'Failed to get bids' });
    }
});

router.post('/end-expired', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const [expiredItems] = await connection.query(`
            SELECT i.item_id, i.seller_id, i.title,
                   (SELECT user_id FROM bids WHERE item_id = i.item_id AND is_winning = TRUE ORDER BY bid_amount DESC LIMIT 1) as winner_id,
                   (SELECT MAX(bid_amount) FROM bids WHERE item_id = i.item_id) as winning_bid
            FROM items i
            WHERE i.status = 'active' AND i.auction_end_time <= NOW()
        `);
        
        let endedCount = 0;
        let paidCount = 0;
        let shipmentCount = 0;
        
        for (const item of expiredItems) {
            endedCount++;
            
            if (item.winner_id && item.winning_bid) {
                await connection.query(
                    'UPDATE items SET status = ?, winner_id = ? WHERE item_id = ?',
                    ['sold', item.winner_id, item.item_id]
                );
                
                await connection.query(
                    'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
                    [item.winning_bid, item.seller_id]
                );
                
                await connection.query(
                    'INSERT INTO wallet_transactions (amount, txn_type, description, user_id, item_id, reference_id) VALUES (?, ?, ?, ?, ?, ?)',
                    [item.winning_bid, 'credit', `Item sold: ${item.title}`, item.seller_id, item.item_id, `SALE-${item.item_id}`]
                );
                
                const [buyerInfo] = await connection.query(
                    'SELECT address FROM users WHERE user_id = ?',
                    [item.winner_id]
                );
                
                const buyerAddress = buyerInfo[0]?.address || 'Address not provided';
                
                await connection.query(
                    `INSERT INTO shipments (shipping_address, buyer_address, item_id, seller_id, buyer_id, status)
                     VALUES (?, ?, ?, ?, ?, 'pending')`,
                    [buyerAddress, buyerAddress, item.item_id, item.seller_id, item.winner_id]
                );
                
                shipmentCount++;
                paidCount++;
            } else {
                await connection.query(
                    'UPDATE items SET status = ? WHERE item_id = ?',
                    ['expired', item.item_id]
                );
            }
        }
        
        await connection.commit();
        
        res.json({
            success: true,
            message: `Processed ${endedCount} auctions, ${paidCount} paid to sellers, ${shipmentCount} shipments created`
        });
    } catch (err) {
        await connection.rollback();
        console.error('End expired auctions error:', err);
        res.status(500).json({ success: false, message: 'Failed to end expired auctions' });
    } finally {
        connection.release();
    }
});

module.exports = router;
