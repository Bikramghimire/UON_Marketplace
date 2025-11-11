import express from 'express';
import { Op } from 'sequelize';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { generateToken } from '../middleware/auth.js';
import { sendVerificationEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    let { username, email, password, firstName, lastName, phone, location } = req.body;

    // Trim inputs
    if (username) username = username.trim();
    if (email) email = email.trim().toLowerCase();
    if (firstName) firstName = firstName.trim();
    if (lastName) lastName = lastName.trim();
    if (phone) phone = phone.trim();
    if (location) location = location.trim();

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password'
      });
    }

    // Username validation
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters'
      });
    }
    if (username.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username must be less than 30 characters'
      });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username can only contain letters, numbers, and underscores'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    if (email.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Email must be less than 255 characters'
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }
    if (password.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Password must be less than 255 characters'
      });
    }
    // Check for spaces
    if (/\s/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password should not contain spaces'
      });
    }
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must include at least one uppercase letter (A-Z)'
      });
    }
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must include at least one lowercase letter (a-z)'
      });
    }
    // Check for at least one digit
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must include at least one digit (0-9)'
      });
    }
    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must include at least one special character (e.g., !@#$%^&*() etc.)'
      });
    }

    // First name validation (if provided)
    if (firstName && firstName.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'First name must be less than 255 characters'
      });
    }

    // Last name validation (if provided)
    if (lastName && lastName.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Last name must be less than 255 characters'
      });
    }

    // Phone validation (if provided)
    if (phone) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid phone number'
        });
      }
      if (phone.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be less than 255 characters'
        });
      }
    }

    // Location validation (if provided)
    if (location && location.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Location must be less than 255 characters'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      location,
      verificationCode,
      verificationCodeExpiry
    });

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationCode);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    // Don't generate token - user must verify email first, then login
    // Token will be generated only after successful login

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          location: user.location,
          role: user.role,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    let { email, username, password } = req.body;

    // Trim whitespace from email and username
    if (email) email = email.trim();
    if (username) username = username.trim();
    if (password) password = password.trim();

    console.log('Login attempt:', { email, username, hasPassword: !!password });

    // Validation - accept either email or username
    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or username, and password'
      });
    }

    // Validate email format if email is provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
    }

    // Validate username format if username is provided
    if (username) {
      if (username.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Username must be at least 3 characters'
        });
      }
      if (username.length > 30) {
        return res.status(400).json({
          success: false,
          message: 'Username must be less than 30 characters'
        });
      }
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
    if (password.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Password must be less than 255 characters'
      });
    }

    // Build where clause to search by email or username
    const whereClause = {};
    if (email) {
      whereClause.email = email;
    } else if (username) {
      whereClause.username = username;
    }

    console.log('Searching for user with:', whereClause);

    // Check if user exists and get password
    const user = await User.findOne({ 
      where: whereClause,
      attributes: { include: ['password'] }
    });

    if (!user) {
      console.log('User not found for:', whereClause);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('User found:', { id: user.id, username: user.username, email: user.email });
    console.log('Stored password hash:', user.password ? user.password.substring(0, 20) + '...' : 'null');
    console.log('Password length:', user.password ? user.password.length : 0);

    // Check password
    const isMatch = await user.matchPassword(password);

    console.log('Password match:', isMatch);
    if (!isMatch) {
      console.log('Password comparison failed');
      // For debugging: check if password is plain text
      if (user.password === password) {
        console.log('WARNING: Password stored as plain text! It should be hashed.');
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified (skip for admin users)
    if (!user.emailVerified && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your email for the verification code.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          location: user.location,
          role: user.role,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', async (req, res) => {
  try {
    // Check token manually since we're not using protect middleware here
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const jwt = (await import('jsonwebtoken')).default;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        location: user.location,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email with code
 * @access  Public
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    // Find user by email
    const user = await User.findOne({
      where: {
        email: email.trim()
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified'
      });
    }

    // Check if verification code matches
    if (!user.verificationCode || user.verificationCode !== code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Check if code has expired
    if (user.verificationCodeExpiry && new Date() > new Date(user.verificationCodeExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Verify email
    user.emailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during email verification'
    });
  }
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Private
 */
router.post('/resend-verification', async (req, res) => {
  try {
    // Check token manually
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const jwt = (await import('jsonwebtoken')).default;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = verificationCodeExpiry;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationCode);
      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

export default router;
