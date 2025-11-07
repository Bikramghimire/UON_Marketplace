import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getConversation, sendMessage } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';
import MapPicker from './MapPicker';
import './MessageThread.css';

const MessageThread = ({ conversation, onBack, onMessageSent }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [meetingDate, setMeetingDate] = useState(null);
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Extract product ID properly - handle both object and string
  const getProductId = () => {
    const product = conversation.lastMessage?.product;
    if (!product) return null;
    if (typeof product === 'string') return product;
    if (typeof product === 'object') {
      return product.id || product._id || null;
    }
    return null;
  };
  const productId = getProductId();

  const otherUser = conversation.otherUser?.[0] || conversation.otherUser;

  useEffect(() => {
    loadMessages();
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
    // Trigger a custom event to refresh unread count in Header
    window.dispatchEvent(new CustomEvent('messagesRead'));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Extract other user ID properly - handle both object and string
      let otherUserId = null;
      if (typeof otherUser === 'string') {
        otherUserId = otherUser;
      } else if (otherUser && typeof otherUser === 'object') {
        otherUserId = otherUser.id || otherUser._id || null;
      }
      
      if (!otherUserId) {
        setError('Invalid user ID. Please try again.');
        return;
      }
      
      const data = await getConversation(otherUserId, productId);
      setMessages(data);
    } catch (error) {
      setError(error.message || 'Failed to load messages');
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      setError(null);

      // Extract product ID properly
      let productIdValue = null;
      if (productId) {
        if (typeof productId === 'object') {
          productIdValue = productId.id || productId._id || null;
        } else {
          productIdValue = productId;
        }
      }

      // Prepare meeting details if provided
      let meetingDetails = null;
      if (showMeetingDetails && meetingDate && meetingTime && meetingLocation) {
        const [hours, minutes] = meetingTime.split(':');
        const meetingDateTime = new Date(meetingDate);
        meetingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        meetingDetails = {
          meetingDate: meetingDateTime,
          meetingTime: meetingTime,
          meetingLocation: meetingLocation
        };
      }

      const messageData = {
        recipient: otherUser.id || otherUser._id || otherUser,
        content: newMessage.trim(),
        product: productIdValue,
        subject: conversation.lastMessage?.product?.title 
          ? `Inquiry about: ${conversation.lastMessage.product.title}`
          : 'New Message',
        ...meetingDetails
      };

      const sentMessage = await sendMessage(messageData);
      setMessages([...messages, sentMessage]);
      setNewMessage('');
      setShowMeetingDetails(false);
      setMeetingDate(null);
      setMeetingTime('');
      setMeetingLocation(null);
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      setError(error.message || 'Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="message-thread-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-thread-container">
      {/* Thread Header */}
      <div className="thread-header">
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
        <div className="thread-user-info">
          <div className="thread-avatar">
            <span className="avatar-emoji">
              {otherUser?.firstName?.[0] || otherUser?.username?.[0] || '👤'}
            </span>
          </div>
          <div>
            <h3>
              {otherUser?.firstName && otherUser?.lastName
                ? `${otherUser.firstName} ${otherUser.lastName}`
                : otherUser?.username || 'Unknown User'}
            </h3>
            {otherUser?.email && (
              <span className="thread-email">{otherUser.email}</span>
            )}
          </div>
        </div>
        {conversation.lastMessage?.product && (
          <div className="thread-product">
            <span className="product-link">📦 {conversation.lastMessage.product.title}</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => {
              const senderId = message.sender?.id || message.sender?._id || message.sender;
              const currentUserId = user?.id || user?._id;
              const isSender = senderId === currentUserId || 
                              (typeof senderId === 'string' && senderId === currentUserId);
              
              return (
                <div
                  key={message._id || message.id}
                  className={`message-item ${isSender ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    <div className="message-text">{message.content}</div>
                    {message.product && (
                      <div className="message-product-ref">
                        <span>About: {message.product.title || 'Product'}</span>
                      </div>
                    )}
                    {message.meetingDate && message.meetingLocation && (
                      <div className="message-meeting-details">
                        <div className="meeting-info">
                          <strong>📅 Meeting Scheduled</strong>
                          <div className="meeting-date-time">
                            <span className="meeting-date">
                              {new Date(message.meetingDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            {message.meetingTime && (
                              <span className="meeting-time">
                                {' '}at {message.meetingTime}
                              </span>
                            )}
                          </div>
                          {message.meetingLocation?.name && (
                            <div className="meeting-location">
                              📍 {message.meetingLocation.name}
                            </div>
                          )}
                          {message.meetingLocation?.coordinates && (
                            <div className="meeting-map-link">
                              <a
                                href={`https://www.openstreetmap.org/?mlat=${message.meetingLocation.coordinates.lat}&mlon=${message.meetingLocation.coordinates.lng}&zoom=15`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="map-link"
                              >
                                View on Map →
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="message-time">
                      {formatDateTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="message-input-form">
        <div className="message-input-wrapper">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            rows="2"
            disabled={sending}
            className="message-input"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="send-btn"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>

        {/* Meeting Details Section */}
        <div className="meeting-details-toggle-thread">
          <label htmlFor="showMeetingDetailsThread" className="checkbox-label">
            <input
              type="checkbox"
              id="showMeetingDetailsThread"
              checked={showMeetingDetails}
              onChange={(e) => setShowMeetingDetails(e.target.checked)}
              disabled={sending}
              className="checkbox-input"
            />
            <span>Schedule a meeting</span>
          </label>
        </div>

        {showMeetingDetails && (
          <div className="meeting-details-section-thread">
            <div className="meeting-details-row">
              <div className="meeting-detail-item">
                <label htmlFor="meetingDateThread">Date *</label>
                <DatePicker
                  id="meetingDateThread"
                  selected={meetingDate}
                  onChange={(date) => setMeetingDate(date)}
                  minDate={new Date()}
                  dateFormat="MMM d, yyyy"
                  placeholderText="Select date"
                  disabled={sending}
                  className="date-picker-small"
                />
              </div>

              <div className="meeting-detail-item">
                <label htmlFor="meetingTimeThread">Time *</label>
                <input
                  type="time"
                  id="meetingTimeThread"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  required={showMeetingDetails}
                  disabled={sending}
                  className="time-input-small"
                />
              </div>
            </div>

            <div className="map-picker-thread">
              <MapPicker
                onLocationSelect={setMeetingLocation}
                initialLocation={meetingLocation}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default MessageThread;

