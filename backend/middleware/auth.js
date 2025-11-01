/**
 * Authentication Middleware
 * Middleware to verify JWT tokens and protect routes
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Verify JWT token middleware
 */
export const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization header required.'
      });
    }

    // Extract token (format: "Bearer <token>")
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Use: Bearer <token>'
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Attach user info to request object
      req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email
      };

      next();
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];

      if (token) {
        try {
          const decoded = jwt.verify(token, config.jwtSecret);
          req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email
          };
        } catch (error) {
          // Token invalid, but continue without user
          req.user = null;
        }
      }
    }

    next();
  } catch (error) {
    // Continue without user if there's an error
    req.user = null;
    next();
  }
};

/**
 * Admin only middleware
 * Must be used after authenticate middleware
 */
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // This would check if user is admin
  // For now, we'll check if user role is admin
  // You'll need to fetch user from database to check role
  // This is a placeholder - implement based on your needs
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

export default { authenticate, optionalAuth, adminOnly };
