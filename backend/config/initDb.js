const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
    console.log('Initializing BidKart Database...');
    
    try {
        const schema = fs.readFileSync(
            path.join(__dirname, '../sql/schema.sql'),
            'utf8'
        );
        
        const statements = schema.split(';').filter(s => s.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await pool.query(statement);
                    console.log('✓ Executed:', statement.substring(0, 50) + '...');
                } catch (err) {
                    if (!err.message.includes('Duplicate')) {
                        console.error('Error:', err.message);
                    }
                }
            }
        }
        
        console.log('\n✅ Database initialized successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    }
}

initDatabase();
