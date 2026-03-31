-- =============================================
-- BidKart Database Schema
-- Electronic Marketplace with Auction System
-- =============================================

DROP DATABASE IF EXISTS bidkart;
CREATE DATABASE bidkart;
USE bidkart;

-- =============================================
-- USER TABLE
-- =============================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_phone_format CHECK (phone REGEXP '^[0-9]{10,15}$'),
    CONSTRAINT chk_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- =============================================
-- CATEGORY TABLE (Hierarchical)
-- =============================================
CREATE TABLE categories (
    cat_id INT AUTO_INCREMENT PRIMARY KEY,
    cat_name VARCHAR(100) NOT NULL,
    parent_cat_id INT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Self-referencing foreign key for hierarchy
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_cat_id) 
        REFERENCES categories(cat_id) ON DELETE SET NULL,
    CONSTRAINT chk_cat_name_not_empty CHECK (LENGTH(TRIM(cat_name)) > 0)
);

-- =============================================
-- ITEM TABLE
-- =============================================
CREATE TABLE items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    base_price DECIMAL(12,2) NOT NULL,
    current_price DECIMAL(12,2) NOT NULL,
    auction_start_time DATETIME NOT NULL,
    auction_end_time DATETIME NOT NULL,
    status ENUM('active', 'sold', 'expired', 'cancelled') DEFAULT 'active',
    seller_id INT NOT NULL,
    cat_id INT NOT NULL,
    winner_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_item_seller FOREIGN KEY (seller_id) REFERENCES users(user_id),
    CONSTRAINT fk_item_category FOREIGN KEY (cat_id) REFERENCES categories(cat_id),
    CONSTRAINT fk_item_winner FOREIGN KEY (winner_id) REFERENCES users(user_id),
    
    -- Constraints
    CONSTRAINT chk_base_price_positive CHECK (base_price > 0),
    CONSTRAINT chk_current_price_positive CHECK (current_price >= 0),
    CONSTRAINT chk_auction_times CHECK (auction_end_time > auction_start_time),
    CONSTRAINT chk_title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

-- =============================================
-- BID TABLE
-- =============================================
CREATE TABLE bids (
    bid_id INT AUTO_INCREMENT PRIMARY KEY,
    bid_amount DECIMAL(12,2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    item_id INT NOT NULL,
    user_id INT NOT NULL,
    is_winning BOOLEAN DEFAULT FALSE,
    
    -- Foreign keys
    CONSTRAINT fk_bid_item FOREIGN KEY (item_id) REFERENCES items(item_id),
    CONSTRAINT fk_bid_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    
    -- Constraints
    CONSTRAINT chk_bid_amount_positive CHECK (bid_amount > 0)
);

-- =============================================
-- WALLET TABLE
-- =============================================
CREATE TABLE wallets (
    wallet_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    balance DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    
    -- Constraint
    CONSTRAINT chk_balance_non_negative CHECK (balance >= 0)
);

-- =============================================
-- WALLET TRANSACTION TABLE
-- =============================================
CREATE TABLE wallet_transactions (
    txn_id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(12,2) NOT NULL,
    txn_type ENUM('credit', 'debit') NOT NULL,
    txn_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255),
    user_id INT NOT NULL,
    item_id INT NULL,
    reference_id VARCHAR(100),
    
    -- Foreign keys
    CONSTRAINT fk_txn_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_txn_item FOREIGN KEY (item_id) REFERENCES items(item_id),
    
    -- Constraints
    CONSTRAINT chk_amount_positive CHECK (amount > 0)
);

-- =============================================
-- SHIPMENT TABLE
-- =============================================
CREATE TABLE shipments (
    shipment_id INT AUTO_INCREMENT PRIMARY KEY,
    courier_name VARCHAR(100),
    tracking_number VARCHAR(100),
    status ENUM('pending', 'shipped', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
    estimated_delivery DATE,
    actual_delivery DATE,
    shipping_address TEXT NOT NULL,
    buyer_address TEXT,
    item_id INT NOT NULL,
    seller_id INT NOT NULL,
    buyer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_shipment_item FOREIGN KEY (item_id) REFERENCES items(item_id),
    CONSTRAINT fk_shipment_seller FOREIGN KEY (seller_id) REFERENCES users(user_id),
    CONSTRAINT fk_shipment_buyer FOREIGN KEY (buyer_id) REFERENCES users(user_id)
);

-- =============================================
-- REVIEW TABLE
-- =============================================
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    rating INT NOT NULL,
    comment TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    
    -- Foreign keys
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_review_item FOREIGN KEY (item_id) REFERENCES items(item_id),
    
    -- Constraints
    CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5),
    
    -- One review per user per item
    CONSTRAINT uk_user_item_review UNIQUE (user_id, item_id)
);

-- =============================================
-- ALERT TABLE (Interest Registration)
-- =============================================
CREATE TABLE alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cat_id INT NOT NULL,
    keyword VARCHAR(100),
    min_price DECIMAL(12,2),
    max_price DECIMAL(12,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_alert_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_alert_category FOREIGN KEY (cat_id) REFERENCES categories(cat_id),
    
    -- Constraints
    CONSTRAINT chk_price_range CHECK (max_price IS NULL OR min_price IS NULL OR max_price >= min_price)
);

-- =============================================
-- ALERT NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE alert_notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id INT NOT NULL,
    item_id INT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_notification_alert FOREIGN KEY (alert_id) REFERENCES alerts(alert_id),
    CONSTRAINT fk_notification_item FOREIGN KEY (item_id) REFERENCES items(item_id)
);

-- =============================================
-- CREATING INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_cat_id ON items(cat_id);
CREATE INDEX idx_items_seller ON items(seller_id);
CREATE INDEX idx_items_end_time ON items(auction_end_time);
CREATE INDEX idx_bids_item ON bids(item_id);
CREATE INDEX idx_bids_user ON bids(user_id);
CREATE INDEX idx_bids_amount ON bids(bid_amount DESC);
CREATE INDEX idx_wallet_txn_user ON wallet_transactions(user_id);
CREATE INDEX idx_reviews_item ON reviews(item_id);
CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_category ON alerts(cat_id);

-- =============================================
-- TRIGGER: Prevent Seller from Bidding on Own Item
-- =============================================
DELIMITER //
CREATE TRIGGER prevent_self_bid
BEFORE INSERT ON bids
FOR EACH ROW
BEGIN
    DECLARE seller INT;
    SELECT seller_id INTO seller FROM items WHERE item_id = NEW.item_id;
    
    IF seller = NEW.user_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sellers cannot bid on their own items';
    END IF;
END//
DELIMITER ;

-- =============================================
-- TRIGGER: Prevent Bidding After Auction Ends
-- =============================================
DELIMITER //
CREATE TRIGGER prevent_late_bid
BEFORE INSERT ON bids
FOR EACH ROW
BEGIN
    DECLARE end_time DATETIME;
    DECLARE start_time DATETIME;
    SELECT auction_end_time, auction_start_time INTO end_time, start_time 
    FROM items WHERE item_id = NEW.item_id;
    
    IF NEW.bid_time > end_time THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Auction has ended';
    END IF;
    
    IF NEW.bid_time < start_time THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Auction has not started yet';
    END IF;
END//
DELIMITER ;

-- =============================================
-- TRIGGER: Update Current Price on New Bid
-- =============================================
DELIMITER //
CREATE TRIGGER update_current_price
AFTER INSERT ON bids
FOR EACH ROW
BEGIN
    UPDATE items SET current_price = NEW.bid_amount WHERE item_id = NEW.item_id;
END//
DELIMITER ;

-- =============================================
-- NOTE: Previous winning bid logic is handled in the backend
-- to avoid MySQL trigger limitations on self-updating tables
-- =============================================

-- =============================================
-- NOTE: refund_outbid_user trigger removed
-- Refund logic is handled by application logic in bids.js
-- =============================================

-- =============================================
-- NOTE: deduct_bid_amount trigger removed
-- Balance deduction and validation is handled by application logic in bids.js
-- =============================================

-- =============================================
-- TRIGGER: Create Wallet for New User
-- =============================================
DELIMITER //
CREATE TRIGGER create_wallet_on_user_create
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO wallets (user_id, balance) VALUES (NEW.user_id, 0.00);
END//
DELIMITER ;

-- =============================================
-- TRIGGER: Expire Items After Auction End
-- =============================================
DELIMITER //
CREATE TRIGGER expire_auction
BEFORE INSERT ON bids
FOR EACH ROW
BEGIN
    DECLARE item_status VARCHAR(20);
    SELECT status INTO item_status FROM items WHERE item_id = NEW.item_id;
    
    IF item_status != 'active' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Auction is not active';
    END IF;
END//
DELIMITER ;

-- =============================================
-- TRIGGER: Prevent Duplicate Reviews
-- =============================================
DELIMITER //
CREATE TRIGGER prevent_duplicate_review
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
    DECLARE review_exists INT DEFAULT 0;
    SELECT COUNT(*) INTO review_exists FROM reviews 
    WHERE user_id = NEW.user_id AND item_id = NEW.item_id;
    
    IF review_exists > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You have already reviewed this item';
    END IF;
END//
DELIMITER ;

-- =============================================
-- PROCEDURE: Place a Bid (Complete Logic)
-- =============================================
DELIMITER //
CREATE PROCEDURE place_bid(
    IN p_item_id INT,
    IN p_user_id INT,
    IN p_bid_amount DECIMAL(12,2),
    IN p_ip_address VARCHAR(45),
    OUT p_result VARCHAR(255)
)
BEGIN
    DECLARE v_item_status VARCHAR(20);
    DECLARE v_seller_id INT;
    DECLARE v_auction_start DATETIME;
    DECLARE v_auction_end DATETIME;
    DECLARE v_current_price DECIMAL(12,2);
    DECLARE v_balance DECIMAL(12,2);
    
    SELECT status, seller_id, auction_start_time, auction_end_time, current_price
    INTO v_item_status, v_seller_id, v_auction_start, v_auction_end, v_current_price
    FROM items WHERE item_id = p_item_id;
    
    IF v_item_status != 'active' THEN
        SET p_result = 'Auction is not active';
    ELSEIF v_seller_id = p_user_id THEN
        SET p_result = 'Cannot bid on your own item';
    ELSEIF NOW() < v_auction_start THEN
        SET p_result = 'Auction has not started yet';
    ELSEIF NOW() > v_auction_end THEN
        SET p_result = 'Auction has ended';
    ELSEIF p_bid_amount <= v_current_price THEN
        SET p_result = CONCAT('Bid must be higher than current price: ', v_current_price);
    ELSE
        SELECT balance INTO v_balance FROM wallets WHERE user_id = p_user_id;
        IF v_balance < p_bid_amount THEN
            SET p_result = 'Insufficient wallet balance';
        ELSE
            INSERT INTO bids (bid_amount, ip_address, item_id, user_id) 
            VALUES (p_bid_amount, p_ip_address, p_item_id, p_user_id);
            SET p_result = 'Bid placed successfully';
        END IF;
    END IF;
END//
DELIMITER ;

-- =============================================
-- PROCEDURE: End Auction
-- =============================================
DELIMITER //
CREATE PROCEDURE end_auction(IN p_item_id INT, OUT p_result VARCHAR(255))
BEGIN
    DECLARE v_winner_id INT;
    DECLARE v_final_price DECIMAL(12,2);
    DECLARE v_high_bid DECIMAL(12,2);
    DECLARE v_item_title VARCHAR(255);
    
    SELECT MAX(bid_amount), user_id INTO v_high_bid, v_winner_id 
    FROM bids WHERE item_id = p_item_id;
    
    SELECT title INTO v_item_title FROM items WHERE item_id = p_item_id;
    
    IF v_winner_id IS NULL THEN
        UPDATE items SET status = 'expired' WHERE item_id = p_item_id;
        SET p_result = 'No bids received, auction expired';
    ELSE
        UPDATE items 
        SET status = 'sold', winner_id = v_winner_id, current_price = v_high_bid
        WHERE item_id = p_item_id;
        
        INSERT INTO wallet_transactions (amount, txn_type, description, user_id, item_id, reference_id)
        VALUES (v_high_bid, 'credit', CONCAT('Item sold: ', v_item_title), 
                (SELECT seller_id FROM items WHERE item_id = p_item_id), p_item_id, 
                CONCAT('SALE-', p_item_id));
        
        SET p_result = CONCAT('Auction ended. Winner: User #', v_winner_id, ' with bid: ', v_high_bid);
    END IF;
END//
DELIMITER ;

-- =============================================
-- PROCEDURE: Add Funds to Wallet
-- =============================================
DELIMITER //
CREATE PROCEDURE add_funds(
    IN p_user_id INT,
    IN p_amount DECIMAL(12,2),
    OUT p_result VARCHAR(255)
)
BEGIN
    IF p_amount <= 0 THEN
        SET p_result = 'Amount must be positive';
    ELSE
        UPDATE wallets SET balance = balance + p_amount WHERE user_id = p_user_id;
        INSERT INTO wallet_transactions (amount, txn_type, description, user_id, reference_id)
        VALUES (p_amount, 'credit', 'Funds added', p_user_id, CONCAT('DEP-', UNIX_TIMESTAMP()));
        SET p_result = 'Funds added successfully';
    END IF;
END//
DELIMITER ;

-- =============================================
-- PROCEDURE: Create Alert
-- =============================================
DELIMITER //
CREATE PROCEDURE create_alert(
    IN p_user_id INT,
    IN p_cat_id INT,
    IN p_keyword VARCHAR(100),
    IN p_min_price DECIMAL(12,2),
    IN p_max_price DECIMAL(12,2),
    OUT p_result VARCHAR(255)
)
BEGIN
    IF p_max_price IS NOT NULL AND p_min_price IS NOT NULL AND p_max_price < p_min_price THEN
        SET p_result = 'Maximum price must be greater than minimum price';
    ELSE
        INSERT INTO alerts (user_id, cat_id, keyword, min_price, max_price)
        VALUES (p_user_id, p_cat_id, p_keyword, p_min_price, p_max_price);
        SET p_result = 'Alert created successfully';
    END IF;
END//
DELIMITER ;

-- =============================================
-- PROCEDURE: Notify Alert Subscribers
-- =============================================
DELIMITER //
CREATE PROCEDURE notify_alert_subscribers(IN p_item_id INT)
BEGIN
    DECLARE v_cat_id INT;
    DECLARE v_price DECIMAL(12,2);
    DECLARE v_title VARCHAR(255);
    DECLARE v_seller_id INT;
    
    SELECT cat_id, current_price, title, seller_id 
    INTO v_cat_id, v_price, v_title, v_seller_id
    FROM items WHERE item_id = p_item_id;
    
    INSERT INTO alert_notifications (alert_id, item_id)
    SELECT alert_id, p_item_id
    FROM alerts a
    WHERE a.cat_id = v_cat_id
      AND a.is_active = TRUE
      AND a.user_id != v_seller_id
      AND (a.keyword IS NULL OR v_title LIKE CONCAT('%', a.keyword, '%'))
      AND (a.min_price IS NULL OR v_price >= a.min_price)
      AND (a.max_price IS NULL OR v_price <= a.max_price);
END//
DELIMITER ;

-- =============================================
-- PROCEDURE: Create Shipment
-- =============================================
DELIMITER //
CREATE PROCEDURE create_shipment(
    IN p_item_id INT,
    IN p_courier_name VARCHAR(100),
    IN p_tracking_number VARCHAR(100),
    IN p_est_delivery DATE,
    IN p_shipping_address TEXT,
    OUT p_result VARCHAR(255)
)
BEGIN
    DECLARE v_seller_id INT;
    DECLARE v_buyer_id INT;
    DECLARE v_status VARCHAR(20);
    
    SELECT seller_id, winner_id, status INTO v_seller_id, v_buyer_id, v_status
    FROM items WHERE item_id = p_item_id;
    
    IF v_status != 'sold' THEN
        SET p_result = 'Item must be sold before creating shipment';
    ELSE
        INSERT INTO shipments (courier_name, tracking_number, estimated_delivery, 
                              shipping_address, item_id, seller_id, buyer_id)
        VALUES (p_courier_name, p_tracking_number, p_est_delivery, 
                p_shipping_address, p_item_id, v_seller_id, v_buyer_id);
        SET p_result = 'Shipment created successfully';
    END IF;
END//
DELIMITER ;

-- =============================================
-- PROCEDURE: Get User Dashboard Stats
-- =============================================
DELIMITER //
CREATE PROCEDURE get_user_dashboard(IN p_user_id INT)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM items WHERE seller_id = p_user_id) as total_listings,
        (SELECT COUNT(*) FROM items WHERE seller_id = p_user_id AND status = 'sold') as items_sold,
        (SELECT COUNT(*) FROM bids WHERE user_id = p_user_id) as total_bids,
        (SELECT COUNT(*) FROM bids WHERE user_id = p_user_id AND is_winning = TRUE) as winning_bids,
        (SELECT COUNT(*) FROM reviews WHERE user_id = p_user_id) as reviews_given,
        (SELECT COUNT(*) FROM reviews r JOIN items i ON r.item_id = i.item_id WHERE i.seller_id = p_user_id) as reviews_received,
        (SELECT COUNT(*) FROM alert_notifications an 
         JOIN alerts a ON an.alert_id = a.alert_id 
         WHERE a.user_id = p_user_id AND an.is_read = FALSE) as unread_notifications,
        (SELECT balance FROM wallets WHERE user_id = p_user_id) as wallet_balance;
END//
DELIMITER ;

-- =============================================
-- PROCEDURE: End Expired Auctions (called by scheduler)
-- =============================================
DELIMITER //
CREATE PROCEDURE end_expired_auctions()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_item_id INT;
    DECLARE v_seller_id INT;
    DECLARE v_winner_id INT;
    DECLARE v_winning_bid DECIMAL(12,2);
    DECLARE v_item_title VARCHAR(255);
    
    DECLARE expired_cur CURSOR FOR
        SELECT i.item_id, i.seller_id, 
               (SELECT user_id FROM bids WHERE item_id = i.item_id AND is_winning = TRUE LIMIT 1) as winner_id,
               (SELECT MAX(bid_amount) FROM bids WHERE item_id = i.item_id) as winning_bid,
               i.title
        FROM items i
        WHERE i.status = 'active' AND i.auction_end_time <= NOW();
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN expired_cur;
    
    read_loop: LOOP
        FETCH expired_cur INTO v_item_id, v_seller_id, v_winner_id, v_winning_bid, v_item_title;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        UPDATE items SET status = 'sold', winner_id = v_winner_id WHERE item_id = v_item_id;
        
        IF v_winner_id IS NOT NULL AND v_winning_bid IS NOT NULL THEN
            UPDATE wallets SET balance = balance + v_winning_bid WHERE user_id = v_seller_id;
            
            INSERT INTO wallet_transactions (amount, txn_type, description, user_id, item_id, reference_id)
            VALUES (v_winning_bid, 'credit', CONCAT('Item sold: ', v_item_title), v_seller_id, v_item_id, CONCAT('SALE-', v_item_id));
        END IF;
    END LOOP;
    
    CLOSE expired_cur;
END//
DELIMITER ;

-- =============================================
-- PROCEDURE: Place Seed Bid (bypasses balance check for demo data)
-- =============================================
DELIMITER //
CREATE PROCEDURE place_seed_bid(
    IN p_item_id INT,
    IN p_user_id INT,
    IN p_bid_amount DECIMAL(12,2),
    IN p_ip_address VARCHAR(45)
)
BEGIN
    INSERT INTO bids (bid_amount, ip_address, item_id, user_id, is_winning)
    VALUES (p_bid_amount, p_ip_address, p_item_id, p_user_id, TRUE);
    
    UPDATE items SET current_price = p_bid_amount WHERE item_id = p_item_id;
END//
DELIMITER ;

-- =============================================
-- SEED DATA: Categories (Hierarchical)
-- =============================================
INSERT INTO categories (cat_name, parent_cat_id, description) VALUES
('Electronics', NULL, 'Electronic devices and gadgets'),
('Fashion', NULL, 'Clothing, shoes, and accessories'),
('Home & Garden', NULL, 'Home decor and garden supplies'),
('Sports', NULL, 'Sports equipment and gear'),
('Books', NULL, 'Books, magazines, and media'),
('Vehicles', NULL, 'Cars, bikes, and vehicles');

INSERT INTO categories (cat_name, parent_cat_id, description) VALUES
('Smartphones', 1, 'Mobile phones and accessories'),
('Laptops', 1, 'Laptops and computers'),
('Cameras', 1, 'Digital cameras and photography gear'),
('Audio', 1, 'Headphones, speakers, and audio equipment'),
('Men\'s Clothing', 2, 'Clothing for men'),
('Women\'s Clothing', 2, 'Clothing for women'),
('Shoes', 2, 'Footwear for all occasions'),
('Jewelry', 2, 'Jewelry and watches'),
('Living Room', 3, 'Furniture and decor for living room'),
('Kitchen', 3, 'Kitchen appliances and utensils'),
('Garden Tools', 3, 'Gardening equipment'),
('Team Sports', 4, 'Sports equipment for teams'),
('Fitness', 4, 'Gym and workout equipment'),
('Fiction', 5, 'Fiction books'),
('Non-Fiction', 5, 'Non-fiction books'),
('Cars', 6, 'Cars and sedans'),
('Motorcycles', 6, 'Motorcycles and scooters');

-- =============================================
-- SEED DATA: Admin User
-- =============================================
INSERT INTO users (name, email, password_hash, phone, address, is_admin) VALUES
('Admin User', 'admin@bidkart.com', '$2b$10$YourHashedPasswordHere', '9876543210', '123 Admin Street, Admin City', TRUE);

-- =============================================
-- SEED DATA: Test Users
-- =============================================
INSERT INTO users (name, email, password_hash, phone, address, is_admin) VALUES
('John Doe', 'john@example.com', '$2b$10$YourHashedPasswordHere', '9876543211', '456 User Street, User City', FALSE),
('Jane Smith', 'jane@example.com', '$2b$10$YourHashedPasswordHere', '9876543212', '789 Buyer Street, Buyer City', FALSE);

-- =============================================
-- SEED DATA: Test Items (using subqueries for category IDs)
-- =============================================
INSERT INTO items (title, description, base_price, current_price, auction_start_time, auction_end_time, status, seller_id, cat_id) 
SELECT 'iPhone 14 Pro Max', 'Apple iPhone 14 Pro Max 256GB - Excellent condition', 800.00, 850.00, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'active', 2, cat_id
FROM categories WHERE cat_name = 'Smartphones';

INSERT INTO items (title, description, base_price, current_price, auction_start_time, auction_end_time, status, seller_id, cat_id) 
SELECT 'MacBook Air M2', 'MacBook Air with M2 chip, 8GB RAM, 256GB SSD', 900.00, 950.00, NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), 'active', 2, cat_id
FROM categories WHERE cat_name = 'Laptops';

INSERT INTO items (title, description, base_price, current_price, auction_start_time, auction_end_time, status, seller_id, cat_id) 
SELECT 'Sony WH-1000XM5', 'Sony wireless noise-cancelling headphones', 250.00, 250.00, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), 'active', 3, cat_id
FROM categories WHERE cat_name = 'Audio';

INSERT INTO items (title, description, base_price, current_price, auction_start_time, auction_end_time, status, seller_id, cat_id) 
SELECT 'Vintage Leather Jacket', 'Genuine leather jacket, size M, excellent condition', 150.00, 150.00, NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), 'active', 3, cat_id
FROM categories WHERE cat_name = "Men's Clothing";

INSERT INTO items (title, description, base_price, current_price, auction_start_time, auction_end_time, status, seller_id, cat_id) 
SELECT 'Fitness Dumbbell Set', 'Adjustable dumbbells 5-25kg, perfect for home gym', 80.00, 80.00, NOW(), DATE_ADD(NOW(), INTERVAL 4 DAY), 'active', 2, cat_id
FROM categories WHERE cat_name = 'Fitness';

-- =============================================
-- Add wallet balance to test users BEFORE inserting bids
-- =============================================
UPDATE wallets SET balance = 5000.00 WHERE user_id = 2;
UPDATE wallets SET balance = 3000.00 WHERE user_id = 3;

-- =============================================
-- SEED DATA: Test Bids
-- Note: These bypass the deduct_bid_amount trigger by using stored procedure
-- =============================================
CALL place_seed_bid(1, 3, 850.00, '192.168.1.1');
CALL place_seed_bid(2, 3, 950.00, '192.168.1.2');
