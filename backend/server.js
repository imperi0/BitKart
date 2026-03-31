const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const itemRoutes = require('./routes/items');
const bidRoutes = require('./routes/bids');
const walletRoutes = require('./routes/wallet');
const alertRoutes = require('./routes/alerts');
const shipmentRoutes = require('./routes/shipments');
const reviewRoutes = require('./routes/reviews');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

function endExpiredAuctions() {
    axios.post(`${BASE_URL}/api/items/end-expired`)
        .then(res => {
            if (res.data.success && res.data.message.includes('1')) {
                console.log(`🏁 Auction ended: ${res.data.message}`);
            }
        })
        .catch(err => console.error('Failed to end expired auctions:', err.message));
}

setInterval(endExpiredAuctions, 60000);

endExpiredAuctions();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'BidKart API is running' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🏪 BidKart server running on port ${PORT}`);
});
