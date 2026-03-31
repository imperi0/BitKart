const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
};

const adminOnly = (req, res, next) => {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

const optionalAuth = (req, res, next) => {
    const token = req.header('x-auth-token');
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            delete req.user;
        }
    }
    next();
};

module.exports = { auth, adminOnly, optionalAuth };
