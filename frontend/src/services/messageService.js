/**
 * Message Service
 * Handles all messaging API calls
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Get all conversations
 */
export const getConversations = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('You must be logged in to view messages');
    }

    const response = await fetch(`${API_URL}/messages`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch conversations');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get conversation with a specific user
 */
export const getConversation = async (userId, productId = null) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('You must be logged in to view messages');
    }

    const url = productId 
      ? `${API_URL}/messages/conversation/${userId}?productId=${productId}`
      : `${API_URL}/messages/conversation/${userId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch conversation');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

/**
 * Send a message
 */
export const sendMessage = async (messageData) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('You must be logged in to send messages');
    }

    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send message');
    }

    return data.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (messageId) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('You must be logged in');
    }

    const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark message as read');
    }

    return data.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

/**
 * Get unread message count
 */
export const getUnreadCount = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      return { count: 0 };
    }

    const response = await fetch(`${API_URL}/messages/unread-count`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      return { count: 0 };
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { count: 0 };
  }
};

export default {
  getConversations,
  getConversation,
  sendMessage,
  markMessageAsRead,
  getUnreadCount
};

