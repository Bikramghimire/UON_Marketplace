import express from 'express';
import { Op } from 'sequelize';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { generateToken } from '../middleware/auth.js';
import { sendVerificationEmail } from '../services/emailService.js';

const router = express.Router();


router.post('/register', async (req, res) => {
  try {
    let { username, email, password, firstName, lastName, phone, location } = req.body;

        if (username) username = username.trim();
    if (email) email = email.trim().toLowerCase();
    if (firstName) firstName = firstName.trim();
    if (lastName) lastName = lastName.trim();
    if (phone) phone = phone.trim();
    if (location) location = location.trim();

        if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password'
      });
    }

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
        if (/\s/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password should not contain spaces'
      });
    }
        if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must include at least one uppercase letter (A-Z)'
      });
    }
        if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must include at least one lowercase letter (a-z)'
      });
    }
        if (!/[0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must include at least one digit (0-9)'
      });
    }
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
      // Don't fail registration if email fails, but log it
    }

        
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
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
});


router.post('/login', async (req, res) => {
  try {
    let { email, username, password } = req.body;

        if (email) email = email.trim();
    if (username) username = username.trim();
    if (password) password = password.trim();
        if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or username, and password'
      });
    }

        if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
    }

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

        const whereClause = {};
    if (email) {
      whereClause.email = email;
    } else if (username) {
      whereClause.username = username;
    }
        const user = await User.findOne({ 
      where: whereClause,
      attributes: { include: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
        const isMatch = await user.matchPassword(password);
    if (!isMatch) {
            if (user.password === password) {
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

        if (!user.emailVerified && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your email for the verification code.',
        requiresVerification: true,
        email: user.email
      });
    }

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
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
});


router.get('/me', async (req, res) => {
  try {
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
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});


router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

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

        if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified'
      });
    }

        if (!user.verificationCode || user.verificationCode !== code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

        if (user.verificationCodeExpiry && new Date() > new Date(user.verificationCodeExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

        user.emailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during email verification'
    });
  }
});


router.post('/resend-verification', async (req, res) => {
  try {
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

        if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); 
    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = verificationCodeExpiry;
    await user.save();

        try {
      await sendVerificationEmail(user, verificationCode);
      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (emailError) {
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

export default router;
