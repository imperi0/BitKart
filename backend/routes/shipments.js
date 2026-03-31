const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const { shipmentValidation } = require('../middleware/validate');

router.get('/', auth, async (req, res) => {
    try {
        const { role } = req.query;
        
        let query = `
            SELECT s.*, i.title as item_title, i.image_url,
                   seller.name as seller_name, buyer.name as buyer_name
            FROM shipments s
            JOIN items i ON s.item_id = i.item_id
            JOIN users seller ON s.seller_id = seller.user_id
            JOIN users buyer ON s.buyer_id = buyer.user_id
        `;
        
        const conditions = [];
        const params = [];
        
        if (role === 'seller') {
            conditions.push('s.seller_id = ?');
            params.push(req.user.id);
        } else if (role === 'buyer') {
            conditions.push('s.buyer_id = ?');
            params.push(req.user.id);
        } else {
            conditions.push('(s.seller_id = ? OR s.buyer_id = ?)');
            params.push(req.user.id, req.user.id);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY s.created_at DESC';
        
        const [shipments] = await pool.query(query, params);
        
        res.json({ success: true, shipments });
    } catch (err) {
        console.error('Get shipments error:', err);
        res.status(500).json({ success: false, message: 'Failed to get shipments' });
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const [shipments] = await pool.query(`
            SELECT s.*, i.title as item_title, i.image_url,
                   seller.name as seller_name, seller.address as seller_address,
                   buyer.name as buyer_name, buyer.address as buyer_address
            FROM shipments s
            JOIN items i ON s.item_id = i.item_id
            JOIN users seller ON s.seller_id = seller.user_id
            JOIN users buyer ON s.buyer_id = buyer.user_id
            WHERE s.shipment_id = ? AND (s.seller_id = ? OR s.buyer_id = ?)
        `, [req.params.id, req.user.id, req.user.id]);
        
        if (shipments.length === 0) {
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        }
        
        res.json({ success: true, shipment: shipments[0] });
    } catch (err) {
        console.error('Get shipment error:', err);
        res.status(500).json({ success: false, message: 'Failed to get shipment' });
    }
});

router.post('/', auth, shipmentValidation, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const { item_id, courier_name, tracking_number, estimated_delivery, shipping_address } = req.body;
        
        const [items] = await connection.query(
            'SELECT * FROM items WHERE item_id = ? FOR UPDATE',
            [item_id]
        );
        
        if (items.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        
        const item = items[0];
        
        if (item.status !== 'sold') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Item must be sold before creating shipment' });
        }
        
        if (item.seller_id !== req.user.id) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Only the seller can create shipment' });
        }
        
        const [existingShipment] = await connection.query(
            'SELECT * FROM shipments WHERE item_id = ?',
            [item_id]
        );
        
        if (existingShipment.length > 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Shipment already exists for this item' });
        }
        
        const [result] = await connection.query(
            `INSERT INTO shipments (courier_name, tracking_number, estimated_delivery, 
              shipping_address, item_id, seller_id, buyer_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [courier_name || '', tracking_number || '', estimated_delivery || null, 
             shipping_address, item_id, item.seller_id, item.winner_id]
        );
        
        await connection.commit();
        
        res.status(201).json({
            success: true,
            message: 'Shipment created successfully',
            shipment_id: result.insertId
        });
    } catch (err) {
        await connection.rollback();
        console.error('Create shipment error:', err);
        res.status(500).json({ success: false, message: 'Failed to create shipment' });
    } finally {
        connection.release();
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const { courier_name, tracking_number, status, estimated_delivery } = req.body;
        
        const [shipments] = await pool.query(
            'SELECT * FROM shipments WHERE shipment_id = ? AND seller_id = ?',
            [req.params.id, req.user.id]
        );
        
        if (shipments.length === 0) {
            return res.status(404).json({ success: false, message: 'Shipment not found' });
        }
        
        await pool.query(
            `UPDATE shipments SET courier_name = ?, tracking_number = ?, status = ?, 
              estimated_delivery = ? WHERE shipment_id = ?`,
            [courier_name, tracking_number, status, estimated_delivery, req.params.id]
        );
        
        res.json({ success: true, message: 'Shipment updated' });
    } catch (err) {
        console.error('Update shipment error:', err);
        res.status(500).json({ success: false, message: 'Failed to update shipment' });
    }
});

module.exports = router;
