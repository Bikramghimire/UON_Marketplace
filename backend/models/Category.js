/**
 * Category Model
 * Represents product categories in the marketplace
 */

import pool from '../config/database.js';

class Category {
  /**
   * Get all categories
   */
  static async findAll() {
    const query = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id
      ORDER BY c.name ASC
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  static async findById(id) {
    const query = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE c.id = $1
      GROUP BY c.id
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  /**
   * Get category by name
   */
  static async findByName(name) {
    const query = 'SELECT * FROM categories WHERE name = $1';

    try {
      const result = await pool.query(query, [name]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  /**
   * Create a new category
   */
  static async create(categoryData) {
    const query = `
      INSERT INTO categories (name, description, icon)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [
      categoryData.name,
      categoryData.description || null,
      categoryData.icon || null
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update category
   */
  static async update(id, categoryData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(categoryData).forEach(key => {
      if (categoryData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(categoryData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE categories
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }
}

export default Category;
