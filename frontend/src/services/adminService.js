

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};


export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch dashboard stats');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getAllUsers = async (filters = {}) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = filters;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role && { role })
    });

    const response = await fetch(`${API_URL}/admin/users?${params}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch users');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getUserById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const updateUser = async (id, userData) => {
  try {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const deleteUser = async (id) => {
  try {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete user');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getAllProductsAdmin = async (filters = {}) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = filters;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(search && { search })
    });

    const response = await fetch(`${API_URL}/admin/products?${params}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch products');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getProductByIdAdmin = async (id) => {
  try {
    const response = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch product');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const updateProductAdmin = async (id, productData) => {
  try {
    const response = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update product');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const deleteProductAdmin = async (id) => {
  try {
    const response = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete product');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getAllCategoriesAdmin = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/categories`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch categories');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getCategoryById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/admin/categories/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch category');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const createCategory = async (categoryData) => {
  try {
    const response = await fetch(`${API_URL}/admin/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create category');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const updateCategory = async (id, categoryData) => {
  try {
    const response = await fetch(`${API_URL}/admin/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update category');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const deleteCategory = async (id) => {
  try {
    const response = await fetch(`${API_URL}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete category');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export default {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllProductsAdmin,
  getProductByIdAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  getAllCategoriesAdmin,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
