const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const { bidValidation } = require('../middleware/validate');

router.post('/:itemId', auth, bidValidation, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const { itemId } = req.params;
        const { amount } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        
        const [items] = await connection.query(
            'SELECT * FROM items WHERE item_id = ? FOR UPDATE',
            [itemId]
        );
        
        if (items.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        
        const item = items[0];
        
        if (item.status !== 'active') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Auction is not active' });
        }
        
        if (item.seller_id === req.user.id) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Cannot bid on your own item' });
        }
        
        const now = new Date();
        const startTime = new Date(item.auction_start_time);
        const endTime = new Date(item.auction_end_time);
        
        if (now < startTime) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Auction has not started yet' });
        }
        
        if (now > endTime) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Auction has ended' });
        }
        
        if (parseFloat(amount) <= parseFloat(item.current_price)) {
            await connection.rollback();
            return res.status(400).json({ 
                success: false, 
                message: `Bid must be higher than current price: $${item.current_price}` 
            });
        }
        
        const [wallets] = await connection.query(
            'SELECT * FROM wallets WHERE user_id = ? FOR UPDATE',
            [req.user.id]
        );
        
        const userBalance = parseFloat(wallets[0]?.balance || 0);
        
        const [currentHighBid] = await connection.query(
            'SELECT * FROM bids WHERE item_id = ? AND is_winning = TRUE',
            [itemId]
        );
        
        let isSameBidder = false;
        let requiredAmount = parseFloat(amount);
        
        if (currentHighBid.length > 0) {
            isSameBidder = currentHighBid[0].user_id === req.user.id;
            
            if (isSameBidder) {
                const difference = parseFloat(amount) - parseFloat(currentHighBid[0].bid_amount);
                requiredAmount = difference > 0 ? difference : 0;
            }
        }
        
        if (requiredAmount > 0 && userBalance < requiredAmount) {
            await connection.rollback();
            return res.status(400).json({ 
                success: false, 
                message: `Insufficient wallet balance. Required: $${requiredAmount.toFixed(2)}, Available: $${userBalance.toFixed(2)}` 
            });
        }
        
        if (currentHighBid.length > 0) {
            if (!isSameBidder) {
                // Different person bidding: refund previous bidder fully
                await connection.query(
                    'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
                    [currentHighBid[0].bid_amount, currentHighBid[0].user_id]
                );
                
                await connection.query(
                    'INSERT INTO wallet_transactions (amount, txn_type, description, user_id, item_id, reference_id) VALUES (?, ?, ?, ?, ?, ?)',
                    [currentHighBid[0].bid_amount, 'credit', 'Bid refund - outbid', 
                     currentHighBid[0].user_id, itemId, `BID-REF-${currentHighBid[0].bid_id}`]
                );
                
                // Deduct full bid amount from new bidder
                await connection.query(
                    'UPDATE wallets SET balance = balance - ? WHERE user_id = ?',
                    [amount, req.user.id]
                );
                
                await connection.query(
                    'INSERT INTO wallet_transactions (amount, txn_type, description, user_id, item_id, reference_id) VALUES (?, ?, ?, ?, ?, ?)',
                    [amount, 'debit', 'Bid placed', req.user.id, itemId, `BID-${itemId}-${req.user.id}`]
                );
                
                // Mark previous bid as losing
                await connection.query(
                    'UPDATE bids SET is_winning = FALSE WHERE bid_id = ?',
                    [currentHighBid[0].bid_id]
                );
            } else {
                // Same person bidding: only deduct the difference
                const difference = parseFloat(amount) - parseFloat(currentHighBid[0].bid_amount);
                if (difference > 0) {
                    await connection.query(
                        'UPDATE wallets SET balance = balance - ? WHERE user_id = ?',
                        [difference, req.user.id]
                    );
                    
                    await connection.query(
                        'INSERT INTO wallet_transactions (amount, txn_type, description, user_id, item_id, reference_id) VALUES (?, ?, ?, ?, ?, ?)',
                        [difference, 'debit', 'Bid increased', req.user.id, itemId, `BID-INCR-${itemId}-${req.user.id}`]
                    );
                }
                
                // Mark previous bid as losing
                await connection.query(
                    'UPDATE bids SET is_winning = FALSE WHERE bid_id = ?',
                    [currentHighBid[0].bid_id]
                );
            }
        } else {
            // First bid on this item - deduct full amount
            await connection.query(
                'UPDATE wallets SET balance = balance - ? WHERE user_id = ?',
                [amount, req.user.id]
            );
            
            await connection.query(
                'INSERT INTO wallet_transactions (amount, txn_type, description, user_id, item_id, reference_id) VALUES (?, ?, ?, ?, ?, ?)',
                [amount, 'debit', 'Bid placed', req.user.id, itemId, `BID-${itemId}-${req.user.id}`]
            );
        }
        
        const [bidResult] = await connection.query(
            'INSERT INTO bids (bid_amount, ip_address, item_id, user_id, is_winning) VALUES (?, ?, ?, ?, TRUE)',
            [amount, ipAddress, itemId, req.user.id]
        );
        
        await connection.query(
            'UPDATE items SET current_price = ? WHERE item_id = ?',
            [amount, itemId]
        );
        
        await connection.commit();
        
        res.status(201).json({
            success: true,
            message: 'Bid placed successfully',
            bid: {
                id: bidResult.insertId,
                amount,
                item_id: parseInt(itemId),
                is_winning: true
            }
        });
    } catch (err) {
        await connection.rollback();
        console.error('Place bid error:', err);
        res.status(500).json({ success: false, message: 'Failed to place bid' });
    } finally {
        connection.release();
    }
});

router.get('/item/:itemId', async (req, res) => {
    try {
        const [bids] = await pool.query(`
            SELECT b.bid_id, b.bid_amount, b.bid_time, b.is_winning, u.name as bidder_name
            FROM bids b
            JOIN users u ON b.user_id = u.user_id
            WHERE b.item_id = ?
            ORDER BY b.bid_amount DESC
        `, [req.params.itemId]);
        
        res.json({ success: true, bids });
    } catch (err) {
        console.error('Get bids error:', err);
        res.status(500).json({ success: false, message: 'Failed to get bids' });
    }
});

module.exports = router;
