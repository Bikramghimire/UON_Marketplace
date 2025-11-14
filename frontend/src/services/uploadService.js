

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('You must be logged in to upload images');
  }
  return {
    'Authorization': `Bearer ${token}`
  };
};


export const uploadImages = async (files) => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No files selected');
    }

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.name}. Only images are allowed.`);
      }
            if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File too large: ${file.name}. Maximum size is 5MB.`);
      }
    }

        const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

        const response = await fetch(`${API_URL}/upload/images`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload images');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const uploadImage = async (file) => {
  try {
    const result = await uploadImages([file]);
    return {
      success: true,
      data: {
        url: result.data.images[0].url,
        public_id: result.data.images[0].public_id
      }
    };
  } catch (error) {
    throw error;
  }
};

export default {
  uploadImages,
  uploadImage
};

