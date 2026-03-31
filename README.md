# BidKart - Electronic Marketplace

A database-driven online auction platform built with Node.js, Express, React, and MySQL.

## Features

- **User Authentication**: Register, login with JWT tokens
- **Item Listings**: Create auctions with categories, base prices, and duration
- **Bidding System**: 
  - Real-time bid placement
  - Auto-refund to outbid users
  - Bid validation (higher than current price, wallet balance)
  - Prevention of self-bidding
- **Category Hierarchy**: Nested categories (e.g., Electronics > Smartphones)
- **Alert System**: Register interests and get notified of new items
- **Wallet System**: Add funds, track transactions, automatic deductions
- **Shipment Tracking**: Track deliveries for sold items
- **Reviews**: Rate and review purchased items

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MySQL with constraints, triggers, and stored procedures
- **Authentication**: JWT with bcrypt password hashing

## Database Features

### Tables
- `users` - User accounts with email/phone validation
- `categories` - Hierarchical category structure
- `items` - Auction items with status tracking
- `bids` - Bid history with winning status
- `wallets` - User balance management
- `wallet_transactions` - Transaction history
- `shipments` - Order delivery tracking
- `reviews` - Item ratings and comments
- `alerts` - Interest-based notifications
- `alert_notifications` - Triggered notifications

### Constraints
- Email format validation: `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`
- Phone validation: `^[0-9]{10,15}$`
- Bid amount > current highest bid
- Wallet balance check before bidding
- Auction time validation

### Triggers
- Auto-create wallet for new users
- Prevent self-bidding
- Prevent bidding after auction ends
- Update current price on new bid
- Mark previous winning bid as losing
- Auto-refund outbid users
- Deduct balance on bid placement
- Prevent duplicate reviews

## Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### 1. Database Setup

```bash
# Create MySQL database
mysql -u root -p < backend/sql/schema.sql
```

Or manually:
1. Create a database named `bidkart`
2. Run the SQL commands from `backend/sql/schema.sql`

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` with your MySQL credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=bidkart
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Demo Accounts

The seed data includes test users:

| Email | Password | Role |
|-------|----------|------|
| admin@bidkart.com | (set during init) | Admin |
| john@example.com | (set during init) | User |
| jane@example.com | (set during init) | User |

**Note**: Update the password hash in `schema.sql` or register new users through the UI.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - List items (with filters)
- `GET /api/items/featured` - Featured items
- `GET /api/items/:id` - Get item details
- `POST /api/items` - Create listing (auth required)
- `GET /api/items/my/items` - My listings (auth required)
- `GET /api/items/my/bids` - My bids (auth required)

### Bids
- `POST /api/bids/:itemId` - Place bid (auth required)
- `GET /api/bids/item/:itemId` - Get bid history

### Wallet
- `GET /api/wallet` - Get balance and transactions
- `POST /api/wallet/add-funds` - Add funds

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/tree` - Category hierarchy

### Alerts
- `GET /api/alerts` - My alerts
- `POST /api/alerts` - Create alert
- `DELETE /api/alerts/:id` - Delete alert
- `GET /api/alerts/notifications` - Get notifications

### Shipments
- `GET /api/shipments` - My shipments
- `POST /api/shipments` - Create shipment

### Reviews
- `GET /api/reviews/item/:itemId` - Item reviews
- `POST /api/reviews` - Submit review

### Dashboard
- `GET /api/dashboard` - Dashboard statistics

## Project Structure

```
bidkart/
├── backend/
│   ├── config/
│   │   ├── db.js          # Database connection
│   │   └── initDb.js      # Database initialization
│   ├── middleware/
│   │   ├── auth.js        # JWT authentication
│   │   └── validate.js    # Input validation
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bids.js
│   │   ├── categories.js
│   │   ├── dashboard.js
│   │   ├── items.js
│   │   ├── reviews.js
│   │   ├── shipments.js
│   │   ├── users.js
│   │   └── wallet.js
│   ├── sql/
│   │   └── schema.sql     # Database schema
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ItemCard.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Alerts.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── CreateListing.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── ItemDetail.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Shipments.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## License

MIT
