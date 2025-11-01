/**
 * Product Model
 * Represents a product listing in the marketplace
 */

import pool from '../config/database.js';

class Product {
  /**
   * Get all products with optional filters
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        p.*,
        u.username,
        u.first_name,
        u.last_name,
        u.location as seller_location,
        c.name as category_name,
        c.icon as category_icon,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
      FROM products p
      INNER JOIN users u ON p.user_id = u.id
      INNER JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    // Apply filters
    if (filters.category_id) {
      query += ` AND p.category_id = $${paramCount}`;
      values.push(filters.category_id);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND p.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.min_price) {
      query += ` AND p.price >= $${paramCount}`;
      values.push(filters.min_price);
      paramCount++;
    }

    if (filters.max_price) {
      query += ` AND p.price <= $${paramCount}`;
      values.push(filters.max_price);
      paramCount++;
    }

    // Sorting
    const sortOptions = {
      'newest': 'p.created_at DESC',
      'oldest': 'p.created_at ASC',
      'price-low': 'p.price ASC',
      'price-high': 'p.price DESC',
      'views': 'p.views DESC'
    };

    const sortOrder = sortOptions[filters.sortBy] || 'p.created_at DESC';
    query += ` ORDER BY ${sortOrder}`;

    // Pagination
    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
      paramCount++;
    }

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  static async findById(id) {
    const query = `
      SELECT 
        p.*,
        u.username,
        u.first_name,
        u.last_name,
        u.email as seller_email,
        u.phone as seller_phone,
        u.location as seller_location,
        c.name as category_name,
        c.description as category_description,
        c.icon as category_icon
      FROM products p
      INNER JOIN users u ON p.user_id = u.id
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      // Get product images
      const imagesQuery = `
        SELECT id, image_url, is_primary
        FROM product_images
        WHERE product_id = $1
        ORDER BY is_primary DESC, created_at ASC
      `;
      const imagesResult = await pool.query(imagesQuery, [id]);
      
      return {
        ...result.rows[0],
        images: imagesResult.rows
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Create a new product
   */
  static async create(productData) {
    const query = `
      INSERT INTO products (
        user_id, category_id, title, description, price, condition, location, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      productData.user_id,
      productData.category_id,
      productData.title,
      productData.description,
      productData.price,
      productData.condition,
      productData.location || null,
      productData.status || 'active'
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update product
   */
  static async update(id, productData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(productData).forEach(key => {
      if (productData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(productData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE products
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product (soft delete by setting status to deleted)
   */
  static async delete(id) {
    const query = `
      UPDATE products
      SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Increment product views
   */
  static async incrementViews(id) {
    const query = `
      UPDATE products
      SET views = views + 1
      WHERE id = $1
      RETURNING views
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0].views;
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }
}

export default Product;
