#!/bin/bash

echo "🏪 BidKart Setup Script"
echo "======================"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check for MySQL
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

echo "✅ Prerequisites checked"

# Setup backend
echo ""
echo "📦 Setting up backend..."
cd backend
npm install
cd ..

# Setup frontend
echo ""
echo "📦 Setting up frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create the database: mysql -u root -p < backend/sql/schema.sql"
echo "2. Update backend/.env with your MySQL password"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm run dev"
echo "5. Open http://localhost:3000"
