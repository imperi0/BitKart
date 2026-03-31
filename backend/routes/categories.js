const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const [categories] = await pool.query(
            'SELECT * FROM categories ORDER BY cat_name'
        );
        res.json({ success: true, categories });
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ success: false, message: 'Failed to get categories' });
    }
});

router.get('/tree', async (req, res) => {
    try {
        const [categories] = await pool.query(
            'SELECT * FROM categories ORDER BY parent_cat_id, cat_name'
        );
        
        const buildTree = (parentId = null) => {
            return categories
                .filter(c => c.parent_cat_id === parentId)
                .map(c => ({
                    ...c,
                    children: buildTree(c.cat_id)
                }));
        };
        
        res.json({ success: true, categories: buildTree() });
    } catch (err) {
        console.error('Get category tree error:', err);
        res.status(500).json({ success: false, message: 'Failed to get category tree' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [categories] = await pool.query(
            'SELECT * FROM categories WHERE cat_id = ?',
            [req.params.id]
        );
        
        if (categories.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        
        res.json({ success: true, category: categories[0] });
    } catch (err) {
        console.error('Get category error:', err);
        res.status(500).json({ success: false, message: 'Failed to get category' });
    }
});

router.post('/', adminOnly, async (req, res) => {
    try {
        const { cat_name, parent_cat_id, description } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO categories (cat_name, parent_cat_id, description) VALUES (?, ?, ?)',
            [cat_name, parent_cat_id || null, description || '']
        );
        
        res.status(201).json({ success: true, message: 'Category created', cat_id: result.insertId });
    } catch (err) {
        console.error('Create category error:', err);
        res.status(500).json({ success: false, message: 'Failed to create category' });
    }
});

router.put('/:id', adminOnly, async (req, res) => {
    try {
        const { cat_name, description } = req.body;
        await pool.query(
            'UPDATE categories SET cat_name = ?, description = ? WHERE cat_id = ?',
            [cat_name, description, req.params.id]
        );
        res.json({ success: true, message: 'Category updated' });
    } catch (err) {
        console.error('Update category error:', err);
        res.status(500).json({ success: false, message: 'Failed to update category' });
    }
});

router.delete('/:id', adminOnly, async (req, res) => {
    try {
        await pool.query('DELETE FROM categories WHERE cat_id = ?', [req.params.id]);
        res.json({ success: true, message: 'Category deleted' });
    } catch (err) {
        console.error('Delete category error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete category' });
    }
});

module.exports = router;
