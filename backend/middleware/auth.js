import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

// JWT Secret (should be in .env file)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Create users table if it doesn't exist
const createUsersTable = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                student_id VARCHAR(50) UNIQUE,
                department VARCHAR(100),
                year_of_study INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await pool.query(query);
        console.log('✅ Users table created/verified');
    } catch (error) {
        console.error('❌ Error creating users table:', error);
    }
};

// Initialize table on startup
createUsersTable();

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            phone,
            studentId,
            department,
            yearOfStudy
        } = req.body;

        // Validation
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                error: 'Email, password, first name, and last name are required'
            });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1 OR student_id = $2',
            [email, studentId]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: 'User with this email or student ID already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await pool.query(
            `INSERT INTO users (email, password, first_name, last_name, phone, student_id, department, year_of_study)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, email, first_name, last_name, phone, student_id, department, year_of_study, created_at`,
            [email, hashedPassword, firstName, lastName, phone, studentId, department, yearOfStudy]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                studentId: user.student_id 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                studentId: user.student_id,
                department: user.department,
                yearOfStudy: user.year_of_study,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error during signup' });
    }
});

// Signin route
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Find user by email
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                studentId: user.student_id 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Signin successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                studentId: user.student_id,
                department: user.department,
                yearOfStudy: user.year_of_study,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ error: 'Internal server error during signin' });
    }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, first_name, last_name, phone, student_id, department, year_of_study, created_at FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                studentId: user.student_id,
                department: user.department,
                yearOfStudy: user.year_of_study,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            phone,
            department,
            yearOfStudy
        } = req.body;

        const result = await pool.query(
            `UPDATE users 
             SET first_name = COALESCE($1, first_name),
                 last_name = COALESCE($2, last_name),
                 phone = COALESCE($3, phone),
                 department = COALESCE($4, department),
                 year_of_study = COALESCE($5, year_of_study),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING id, email, first_name, last_name, phone, student_id, department, year_of_study, updated_at`,
            [firstName, lastName, phone, department, yearOfStudy, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                studentId: user.student_id,
                department: user.department,
                yearOfStudy: user.year_of_study,
                updatedAt: user.updated_at
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Current password and new password are required'
            });
        }

        // Get current user
        const userResult = await pool.query(
            'SELECT password FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await pool.query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedNewPassword, req.user.userId]
        );

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;