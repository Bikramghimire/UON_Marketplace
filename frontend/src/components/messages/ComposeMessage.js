import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../../context/AuthContext';
import { sendMessage } from '../../services/messageService';
import MapPicker from './MapPicker';
import './ComposeMessage.css';

const ComposeMessage = ({ recipient, product, onClose, onSent }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [meetingDate, setMeetingDate] = useState(null);
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState(null);

    React.useEffect(() => {
    if (product && !subject) {
      setSubject(`Inquiry about: ${product.title}`);
    }
  }, [product, subject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Message content is required');
      return;
    }

    try {
      setSending(true);
      setError(null);

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

            let recipientId = null;
      if (typeof recipient === 'string') {
        recipientId = recipient;
      } else if (recipient && typeof recipient === 'object') {
        recipientId = recipient.id || recipient._id || null;
      }

      if (!recipientId) {
        setError('Invalid recipient. Please try again.');
        return;
      }

            let productId = null;
      if (product) {
        if (typeof product === 'string') {
          productId = product;
        } else if (typeof product === 'object') {
          productId = product.id || product._id || null;
        }
      }

      const messageData = {
        recipient: recipientId,
        content: content.trim(),
        product: productId,
        subject: subject.trim() || `Inquiry about: ${product?.title || 'Product'}`,
        ...meetingDetails
      };

      await sendMessage(messageData);
      
      if (onSent) {
        onSent();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      setError(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="compose-message-overlay" onClick={onClose}>
      <div className="compose-message-modal" onClick={(e) => e.stopPropagation()}>
        <div className="compose-header">
          <h2>Send Message</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="compose-info">
          <div className="info-item">
            <strong>To:</strong> {recipient?.firstName && recipient?.lastName
              ? `${recipient.firstName} ${recipient.lastName}`
              : recipient?.username || 'User'}
          </div>
          {product && (
            <div className="info-item">
              <strong>About:</strong> {product.title}
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="compose-form">
          {product && (
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Message subject"
                disabled={sending}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="content">Message *</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message here..."
              rows="6"
              required
              disabled={sending}
              className="form-textarea"
            />
          </div>

          {}
          <div className="form-group">
            <div className="meeting-details-toggle">
              <label htmlFor="showMeetingDetails" className="checkbox-label">
                <input
                  type="checkbox"
                  id="showMeetingDetails"
                  checked={showMeetingDetails}
                  onChange={(e) => setShowMeetingDetails(e.target.checked)}
                  disabled={sending}
                  className="checkbox-input"
                />
                <span>Schedule a meeting for product inspection</span>
              </label>
            </div>

            {showMeetingDetails && (
              <div className="meeting-details-section">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="meetingDate">Meeting Date *</label>
                    <DatePicker
                      id="meetingDate"
                      selected={meetingDate}
                      onChange={(date) => setMeetingDate(date)}
                      minDate={new Date()}
                      dateFormat="MMMM d, yyyy"
                      placeholderText="Select date"
                      disabled={sending}
                      className="form-input date-picker"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="meetingTime">Meeting Time *</label>
                    <input
                      type="time"
                      id="meetingTime"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      required={showMeetingDetails}
                      disabled={sending}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <MapPicker
                    onLocationSelect={setMeetingLocation}
                    initialLocation={meetingLocation}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!content.trim() || sending}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeMessage;

