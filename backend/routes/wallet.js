const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const { walletValidation } = require('../middleware/validate');

router.get('/', auth, async (req, res) => {
    try {
        const [wallet] = await pool.query(
            'SELECT * FROM wallets WHERE user_id = ?',
            [req.user.id]
        );
        
        if (wallet.length === 0) {
            await pool.query('INSERT INTO wallets (user_id, balance) VALUES (?, 0)', [req.user.id]);
            return res.json({ success: true, wallet: { balance: 0, transactions: [] } });
        }
        
        const [transactions] = await pool.query(`
            SELECT wt.*, i.title as item_title
            FROM wallet_transactions wt
            LEFT JOIN items i ON wt.item_id = i.item_id
            WHERE wt.user_id = ?
            ORDER BY wt.txn_date DESC
            LIMIT 100
        `, [req.user.id]);
        
        const currentBalance = parseFloat(wallet[0].balance);
        
        const transactionsWithBalance = transactions.map((txn, index) => {
            const isCredit = txn.txn_type === 'credit';
            const txnAmount = parseFloat(txn.amount);
            
            if (index === 0) {
                return { ...txn, running_balance: currentBalance };
            }
            
            let runningBalance = currentBalance;
            for (let i = 0; i <= index; i++) {
                const t = transactions[i];
                if (t.txn_type === 'credit') {
                    runningBalance -= parseFloat(t.amount);
                } else {
                    runningBalance += parseFloat(t.amount);
                }
            }
            return { ...txn, running_balance: runningBalance };
        });
        
        const stats = {
            total_earned: transactions
                .filter(t => t.txn_type === 'credit')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0),
            total_spent: transactions
                .filter(t => t.txn_type === 'debit')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0),
            bid_refunds: transactions
                .filter(t => t.description.includes('refund'))
                .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        };
        
        res.json({
            success: true,
            wallet: {
                ...wallet[0],
                transactions: transactionsWithBalance,
                stats
            }
        });
    } catch (err) {
        console.error('Get wallet error:', err);
        res.status(500).json({ success: false, message: 'Failed to get wallet' });
    }
});

router.post('/add-funds', auth, walletValidation, async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be positive' });
        }
        
        await pool.query(
            'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
            [amount, req.user.id]
        );
        
        await pool.query(
            'INSERT INTO wallet_transactions (amount, txn_type, description, user_id, reference_id) VALUES (?, ?, ?, ?, ?)',
            [amount, 'credit', 'Funds added', req.user.id, `DEP-${Date.now()}`]
        );
        
        const [wallet] = await pool.query(
            'SELECT balance FROM wallets WHERE user_id = ?',
            [req.user.id]
        );
        
        res.json({
            success: true,
            message: 'Funds added successfully',
            new_balance: wallet[0].balance
        });
    } catch (err) {
        console.error('Add funds error:', err);
        res.status(500).json({ success: false, message: 'Failed to add funds' });
    }
});

router.get('/transactions', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        const [transactions] = await pool.query(`
            SELECT wt.*, i.title as item_title
            FROM wallet_transactions wt
            LEFT JOIN items i ON wt.item_id = i.item_id
            WHERE wt.user_id = ?
            ORDER BY wt.txn_date DESC
            LIMIT ? OFFSET ?
        `, [req.user.id, parseInt(limit), parseInt(offset)]);
        
        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM wallet_transactions WHERE user_id = ?',
            [req.user.id]
        );
        
        res.json({
            success: true,
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total
            }
        });
    } catch (err) {
        console.error('Get transactions error:', err);
        res.status(500).json({ success: false, message: 'Failed to get transactions' });
    }
});

module.exports = router;
