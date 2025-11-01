/**
 * User Model
 * Represents a user in the marketplace
 */

import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  /**
   * Get all users (for admin purposes)
   */
  static async findAll(limit = 100, offset = 0) {
    const query = `
      SELECT id, username, email, first_name, last_name, phone, location, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    try {
      const result = await pool.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async findById(id) {
    const query = `
      SELECT id, username, email, first_name, last_name, phone, location, role, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  static async findByEmail(email) {
    const query = `
      SELECT * FROM users WHERE email = $1
    `;

    try {
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  /**
   * Get user by username
   */
  static async findByUsername(username) {
    const query = `
      SELECT * FROM users WHERE username = $1
    `;

    try {
      const result = await pool.query(query, [username]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  static async create(userData) {
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const query = `
      INSERT INTO users (username, email, password, first_name, last_name, phone, location, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, email, first_name, last_name, phone, location, role, created_at
    `;

    const values = [
      userData.username,
      userData.email,
      hashedPassword,
      userData.first_name || null,
      userData.last_name || null,
      userData.phone || null,
      userData.location || null,
      userData.role || 'user'
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  static async update(id, userData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Don't allow password update through this method
    const allowedFields = ['first_name', 'last_name', 'phone', 'location'];
    
    Object.keys(userData).forEach(key => {
      if (allowedFields.includes(key) && userData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(userData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, username, email, first_name, last_name, phone, location, role, created_at, updated_at
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Update password
   */
  static async updatePassword(id, newPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const query = `
      UPDATE users
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `;

    try {
      const result = await pool.query(query, [hashedPassword, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  /**
   * Verify password
   */
  static async verifyPassword(email, password) {
    const user = await this.findByEmail(email);
    
    if (!user) {
      return false;
    }

    return await bcrypt.compare(password, user.password);
  }

  /**
   * Delete user (soft delete by changing status)
   */
  static async delete(id) {
    const query = `
      UPDATE users
      SET email = CONCAT(email, '_deleted_', NOW()::text), updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId) {
    const query = `
      SELECT 
        COUNT(p.id) FILTER (WHERE p.status = 'active') as active_products,
        COUNT(p.id) FILTER (WHERE p.status = 'sold') as sold_products,
        COALESCE(SUM(p.price) FILTER (WHERE p.status = 'sold'), 0) as total_sales
      FROM users u
      LEFT JOIN products p ON u.id = p.user_id
      WHERE u.id = $1
      GROUP BY u.id
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0] || { active_products: 0, sold_products: 0, total_sales: 0 };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}

export default User;