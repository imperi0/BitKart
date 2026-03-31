const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation failed',
            errors: errors.array() 
        });
    }
    next();
};

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const phoneRegex = /^[0-9]{10,15}$/;

const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').trim().notEmpty().withMessage('Email is required')
        .matches(emailRegex).withMessage('Invalid email format'),
    body('phone').trim().notEmpty().withMessage('Phone is required')
        .matches(phoneRegex).withMessage('Phone must be 10-15 digits'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('address').optional().trim(),
    validate
];

const loginValidation = [
    body('email').trim().notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

const itemValidation = [
    body('title').trim().notEmpty().withMessage('Title is required')
        .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
    body('description').optional().trim(),
    body('base_price').isFloat({ min: 0.01 }).withMessage('Base price must be greater than 0'),
    body('auction_start_time').isISO8601().withMessage('Invalid start time format'),
    body('auction_end_time').isISO8601().withMessage('Invalid end time format'),
    body('cat_id').isInt({ min: 1 }).withMessage('Valid category is required'),
    validate
];

const bidValidation = [
    body('amount').isFloat({ min: 0.01 }).withMessage('Bid amount must be greater than 0'),
    validate
];

const reviewValidation = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim(),
    validate
];

const alertValidation = [
    body('cat_id').isInt({ min: 1 }).withMessage('Valid category is required'),
    body('keyword').optional().trim().isLength({ max: 100 }),
    body('min_price').optional().isFloat({ min: 0 }),
    body('max_price').optional().isFloat({ min: 0 }),
    validate
];

const walletValidation = [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    validate
];

const shipmentValidation = [
    body('courier_name').optional().trim(),
    body('tracking_number').optional().trim(),
    body('estimated_delivery').optional().isISO8601(),
    body('shipping_address').notEmpty().withMessage('Shipping address is required'),
    validate
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    itemValidation,
    bidValidation,
    reviewValidation,
    alertValidation,
    walletValidation,
    shipmentValidation
};
