/**
 * Product Service
 * Handles all product API calls
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get all products with optional filters
 */
export const getAllProducts = async (filters = {}) => {
  try {
    // Build query string
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const queryString = params.toString();
    const url = `${API_URL}/products${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch products');
    }

    // Transform products to match frontend format
    const products = data.data.map(product => {
      // Ensure images array is properly formatted
      let images = [];
      if (product.images && Array.isArray(product.images)) {
        images = product.images;
      } else if (product.image) {
        images = [product.image];
      }

      // Get primary image for card display
      const primaryImage = images.find(img => img.isPrimary) || images[0] || product.image || '📦';
      const imageUrl = typeof primaryImage === 'string' ? primaryImage : primaryImage.url || primaryImage;

      return {
        ...product,
        id: product.id || product._id,
        image: imageUrl,
        images: images,
        datePosted: formatDate(product.datePosted)
      };
    });

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch product');
    }

    // Transform product data
    const productData = {
      ...data.data,
      datePosted: formatDate(data.data.datePosted)
    };

    // Ensure images array is properly formatted
    if (productData.images && Array.isArray(productData.images)) {
      productData.images = productData.images.map(img => {
        if (typeof img === 'string') return img;
        if (img.url) return img;
        return { url: img.image || img, isPrimary: false };
      });
    } else if (productData.image) {
      productData.images = [productData.image];
    }

    return productData;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Get user's own products
 */
export const getUserProducts = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('You must be logged in to view your products');
    }

    const response = await fetch(`${API_URL}/products/my`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch your products');
    }

    // Transform products to match frontend format
    const products = data.data.map(product => {
      // Ensure images array is properly formatted
      let images = [];
      if (product.images && Array.isArray(product.images)) {
        images = product.images;
      } else if (product.image) {
        images = [product.image];
      }

      // Get primary image for card display
      const primaryImage = images.find(img => img.isPrimary) || images[0] || product.image || '📦';
      const imageUrl = typeof primaryImage === 'string' ? primaryImage : primaryImage.url || primaryImage;

      return {
        ...product,
        id: product.id || product._id,
        image: imageUrl,
        images: images,
        datePosted: formatDate(product.datePosted)
      };
    });

    return products;
  } catch (error) {
    console.error('Error fetching user products:', error);
    throw error;
  }
};

/**
 * Get all categories
 */
export const getCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch categories');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array on error instead of throwing
    return [];
  }
};

/**
 * Create a new product
 */
export const createProduct = async (productData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('You must be logged in to create a product');
    }

    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create product');
    }

    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Format date to relative time string
 */
const formatDate = (dateString) => {
  if (!dateString) return 'Recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

/**
 * Update product status (mark as sold, etc.)
 */
export const updateProductStatus = async (productId, status) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('You must be logged in to update product status');
    }

    const response = await fetch(`${API_URL}/products/${productId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update product status');
    }

    return data;
  } catch (error) {
    console.error('Error updating product status:', error);
    throw error;
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (productId) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('You must be logged in to delete products');
    }

    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete product');
    }

    return data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export default {
  getAllProducts,
  getProductById,
  getCategories,
  createProduct,
  getUserProducts,
  updateProductStatus,
  deleteProduct
};
