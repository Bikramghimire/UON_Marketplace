-- UON Marketplace Seed Data
-- Sample data for testing database functionality
-- Note: All passwords are hashed from "password123" using bcrypt
-- You can login with any user using email/password combination

-- Insert Sample Users (password for all test users: "password123")
INSERT INTO users (username, email, password, first_name, last_name, phone, location, role) VALUES
('johndoe', 'john.doe@uon.edu', '$2a$10$rOzJ1qYyJLzJyOY.UmOqkOgq.3qVYhGqJYV5qJYV5qJYV5qJYV5qJYu', 'John', 'Doe', '555-0101', 'Campus Dorm', 'user'),
('sarahm', 'sarah.miller@uon.edu', '$2a$10$rOzJ1qYyJLzJyOY.UmOqkOgq.3qVYhGqJYV5qJYV5qJYV5qJYV5qJYu', 'Sarah', 'Miller', '555-0102', 'Off-Campus', 'user'),
('miket', 'mike.taylor@uon.edu', '$2a$10$rOzJ1qYyJLzJyOY.UmOqkOgq.3qVYhGqJYV5qJYV5qJYV5qJYV5qJYu', 'Mike', 'Taylor', '555-0103', 'Student Union', 'user'),
('emilyr', 'emily.rodriguez@uon.edu', '$2a$10$rOzJ1qYyJLzJyOY.UmOqkOgq.3qVYhGqJYV5qJYV5qJYV5qJYV5qJYu', 'Emily', 'Rodriguez', '555-0104', 'Campus Dorm', 'user'),
('davidl', 'david.lee@uon.edu', '$2a$10$rOzJ1qYyJLzJyOY.UmOqkOgq.3qVYhGqJYV5qJYV5qJYV5qJYV5qJYu', 'David', 'Lee', '555-0105', 'Off-Campus', 'user'),
('lisak', 'lisa.kim@uon.edu', '$2a$10$rOzJ1qYyJLzJyOY.UmOqkOgq.3qVYhGqJYV5qJYV5qJYV5qJYV5qJYu', 'Lisa', 'Kim', '555-0106', 'Library', 'user'),
('tomw', 'tom.wilson@uon.edu', '$2a$10$rOzJ1qYyJLzJyOY.UmOqkOgq.3qVYhGqJYV5qJYV5qJYV5qJYV5qJYu', 'Tom', 'Wilson', '555-0107', 'Campus Dorm', 'user'),
('annab', 'anna.brown@uon.edu', '$2a$10$rOzJ1qYyJLzJyOY.UmOqkOgq.3qVYhGqJYV5qJYV5qJYV5qJYV5qJYu', 'Anna', 'Brown', '555-0108', 'Off-Campus', 'user'),
('chrisp', 'chris.park@uon.edu', '$2a$10$rOzJ1qYyJLzJyOY.UmOqkOgq.3qVYhGqJYV5qJYV5qJYV5qJYV5qJYu', 'Chris', 'Park', '555-0109', 'Student Union', 'user'),
('rachels', 'rachel.smith@uon.edu', '$2a$10$rOzJ1qYyJLzJyOY.UmOqkOgq.3qVYhGqJYV5qJYV5qJYV5qJYV5qJYu', 'Rachel', 'Smith', '555-0110', 'Library', 'user'),
('kevinh', 'kevin.harris@uon.edu', '$2a$10$rOzJ1qYyJLzJyOY.UmOqkOgq.3qVYhGqJYV5qJYV5qJYV5qJYV5qJYu', 'Kevin', 'Harris', '555-0111', 'Campus Dorm', 'user'),
('jessican', 'jessica.nelson@uon.edu', '$2a$10$rOzJ1qYyJLzJyOY.UmOqkOgq.3qVYhGqJYV5qJYV5qJYV5qJYV5qJYu', 'Jessica', 'Nelson', '555-0112', 'Off-Campus', 'user'),
('admin', 'admin@uon.edu', '$2a$10$rOzJ1qYyJLzJyOY.UmOqkOgq.3qVYhGqJYV5qJYV5qJYV5qJYV5qJYu', 'Admin', 'User', '555-0001', 'Admin Office', 'admin');

-- Insert Categories
INSERT INTO categories (name, description, icon) VALUES
('Textbooks', 'Academic textbooks and course materials', '📚'),
('Electronics', 'Laptops, phones, calculators, and gadgets', '💻'),
('Clothing', 'Apparel, shoes, and fashion accessories', '👕'),
('Furniture', 'Desks, chairs, and dorm essentials', '🏠'),
('Sports', 'Sports equipment and athletic gear', '⚽'),
('Services', 'Tutoring, services, and other offerings', '🛠️');

-- Insert Sample Products
INSERT INTO products (user_id, category_id, title, description, price, condition, location, status, views) VALUES
(1, 1, 'Calculus Textbook - 3rd Edition', 'Used but in excellent condition. No highlighting or notes. Perfect for Math 101.', 45.99, 'Excellent', 'Campus Dorm', 'active', 15),
(2, 2, 'MacBook Pro 13 inch 2020', 'M1 chip, 256GB SSD, 8GB RAM. Great condition, barely used. Comes with charger.', 899.99, 'Like New', 'Off-Campus', 'active', 42),
(3, 3, 'Nike Air Max Sneakers Size 10', 'Gently worn, still in great shape. Original box included. Barely used.', 65.00, 'Good', 'Student Union', 'active', 8),
(4, 4, 'Desk Chair - Office Style', 'Comfortable office chair. Adjustable height, good condition. Perfect for dorm room.', 35.00, 'Good', 'Campus Dorm', 'active', 12),
(5, 2, 'iPhone 12 - 128GB', 'Unlocked, works perfectly. Minor scratches on screen. Includes charger and original box.', 450.00, 'Fair', 'Off-Campus', 'active', 28),
(6, 1, 'Organic Chemistry Textbook Set', 'Complete set with study guide. Barely used, like new condition. Includes lab manual.', 85.00, 'Excellent', 'Library', 'active', 19),
(7, 3, 'Winter Jacket - Medium', 'North Face jacket, warm and waterproof. Perfect for winter. Excellent condition.', 40.00, 'Good', 'Campus Dorm', 'active', 7),
(8, 4, 'Study Desk with Drawers', 'Wooden desk with storage drawers. Easy to assemble. Great condition.', 55.00, 'Good', 'Off-Campus', 'active', 14),
(9, 2, 'iPad Air 4th Gen', '64GB, WiFi only. Great for taking notes in class. Includes case and charger.', 350.00, 'Excellent', 'Student Union', 'active', 33),
(10, 1, 'Physics Lab Manual', 'Required for Physics 101. Some pages filled but still usable. Good condition.', 20.00, 'Fair', 'Library', 'active', 5),
(11, 2, 'Graphing Calculator TI-84', 'Works perfectly. Batteries included. Great for math courses. Like new.', 60.00, 'Excellent', 'Campus Dorm', 'active', 11),
(12, 3, 'Backpack - Laptop Compatible', 'Spacious backpack with laptop compartment. Water resistant. Excellent condition.', 30.00, 'Good', 'Off-Campus', 'active', 9),
(1, 2, 'Dell Laptop - 15 inch', 'Intel i5, 512GB SSD, 16GB RAM. Great for programming. Good condition.', 450.00, 'Good', 'Campus Dorm', 'active', 22),
(2, 1, 'Psychology Textbook', 'Introduction to Psychology 5th edition. Excellent condition, no marks.', 55.00, 'Excellent', 'Off-Campus', 'active', 16),
(3, 4, 'Bookshelf - 5 Shelf', 'Wooden bookshelf, perfect for dorm. Easy assembly. Good condition.', 25.00, 'Good', 'Student Union', 'sold', 45),
(4, 3, 'University Hoodie - Large', 'Official UON hoodie. Brand new, never worn. Perfect gift.', 45.00, 'New', 'Campus Dorm', 'active', 13),
(5, 2, 'Samsung Galaxy S21', 'Unlocked, excellent condition. Includes charger and protective case.', 400.00, 'Excellent', 'Off-Campus', 'active', 31),
(6, 1, 'Biology Lab Manual', 'Used but in good condition. All pages intact. Perfect for Bio 101.', 18.00, 'Good', 'Library', 'active', 6),
(7, 4, 'Bedside Table', 'Compact bedside table. Perfect for small spaces. Good condition.', 20.00, 'Good', 'Campus Dorm', 'pending', 4),
(8, 3, 'Running Shoes Size 9', 'Adidas running shoes. Lightly used. Excellent for jogging.', 50.00, 'Good', 'Off-Campus', 'active', 10),
(9, 2, 'Wireless Mouse', 'Logitech wireless mouse. Like new. Includes USB receiver.', 15.00, 'Like New', 'Student Union', 'active', 8);

-- Insert Sample Product Images (placeholder URLs)
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(1, 'https://via.placeholder.com/400x300?text=Calculus+Textbook', TRUE),
(2, 'https://via.placeholder.com/400x300?text=MacBook+Pro', TRUE),
(3, 'https://via.placeholder.com/400x300?text=Nike+Sneakers', TRUE),
(4, 'https://via.placeholder.com/400x300?text=Desk+Chair', TRUE),
(5, 'https://via.placeholder.com/400x300?text=iPhone+12', TRUE),
(6, 'https://via.placeholder.com/400x300?text=Chemistry+Textbook', TRUE),
(7, 'https://via.placeholder.com/400x300?text=Winter+Jacket', TRUE),
(8, 'https://via.placeholder.com/400x300?text=Study+Desk', TRUE),
(9, 'https://via.placeholder.com/400x300?text=iPad+Air', TRUE),
(10, 'https://via.placeholder.com/400x300?text=Physics+Manual', TRUE),
(11, 'https://via.placeholder.com/400x300?text=TI-84+Calculator', TRUE),
(12, 'https://via.placeholder.com/400x300?text=Backpack', TRUE);
