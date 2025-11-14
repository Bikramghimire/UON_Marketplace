

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

            if (data.data && data.data.user) {
      localStorage.setItem('pendingVerificationEmail', data.data.user.email);
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
            if (data.requiresVerification) {
        const error = new Error(data.message || 'Please verify your email before logging in');
        error.requiresVerification = true;
        error.email = data.email;
        throw error;
      }
      throw new Error(data.message || 'Login failed');
    }

        if (data.data && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user profile');
    }

        if (data.data) {
      localStorage.setItem('user', JSON.stringify(data.data));
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};


export const getToken = () => {
  return localStorage.getItem('token');
};


export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};


export const isAuthenticated = () => {
  return !!getToken();
};


export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getToken,
  getUser,
  isAuthenticated,
  getAuthHeaders,
};
