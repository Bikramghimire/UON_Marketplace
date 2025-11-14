

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


export const getAllStudentEssentials = async (filters = {}) => {
  try {
        const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const queryString = params.toString();
    const url = `${API_URL}/student-essentials${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch student essentials');
    }

        const essentials = data.data.map(essential => {
            let images = [];
      if (essential.images && Array.isArray(essential.images)) {
        images = essential.images;
      } else if (essential.image) {
        images = [essential.image];
      }

            const primaryImage = images.find(img => img.isPrimary) || images[0] || essential.image || '🎁';
      const imageUrl = typeof primaryImage === 'string' ? primaryImage : primaryImage.url || primaryImage;

      return {
        ...essential,
        id: essential.id || essential._id,
        image: imageUrl,
        images: images,
        datePosted: formatDate(essential.datePosted),
        price: 0       };
    });

    return essentials;
  } catch (error) {
    throw error;
  }
};


export const getStudentEssentialById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/student-essentials/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch student essential');
    }

        const essentialData = {
      ...data.data,
      id: data.data.id || data.data._id,
      datePosted: formatDate(data.data.datePosted),
      price: 0     };

        if (essentialData.images && Array.isArray(essentialData.images)) {
      essentialData.images = essentialData.images.map(img => {
        if (typeof img === 'string') return img;
        if (img.url) return img;
        return { url: img.image || img, isPrimary: false };
      });
    } else if (essentialData.image) {
      essentialData.images = [essentialData.image];
    }

    return essentialData;
  } catch (error) {
    throw error;
  }
};


export const getUserStudentEssentials = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('You must be logged in to view your student essentials');
    }

    const response = await fetch(`${API_URL}/student-essentials/my`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch your student essentials');
    }

        const essentials = data.data.map(essential => {
            let images = [];
      if (essential.images && Array.isArray(essential.images)) {
        images = essential.images;
      } else if (essential.image) {
        images = [essential.image];
      }

            const primaryImage = images.find(img => img.isPrimary) || images[0] || essential.image || '🎁';
      const imageUrl = typeof primaryImage === 'string' ? primaryImage : primaryImage.url || primaryImage;

      return {
        ...essential,
        id: essential.id || essential._id,
        image: imageUrl,
        images: images,
        datePosted: formatDate(essential.datePosted),
        price: 0       };
    });

    return essentials;
  } catch (error) {
    throw error;
  }
};


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
        return [];
  }
};


export const createStudentEssential = async (essentialData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('You must be logged in to create a student essential');
    }

    const response = await fetch(`${API_URL}/student-essentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(essentialData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create student essential');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


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


export const updateStudentEssentialStatus = async (essentialId, status) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('You must be logged in to update student essential status');
    }

    const response = await fetch(`${API_URL}/student-essentials/${essentialId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update student essential status');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const deleteStudentEssential = async (essentialId) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('You must be logged in to delete student essentials');
    }

    const response = await fetch(`${API_URL}/student-essentials/${essentialId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete student essential');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export default {
  getAllStudentEssentials,
  getStudentEssentialById,
  getCategories,
  createStudentEssential,
  getUserStudentEssentials,
  updateStudentEssentialStatus,
  deleteStudentEssential
};

