import React, { useState, useEffect } from 'react';
import { getUnreadCount } from '../../services/messageService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faComments, faUser } from '@fortawesome/free-solid-svg-icons';
import './ConversationList.css';

const ConversationList = ({ conversations, onSelectConversation, onRefresh }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [conversations]);

  const loadUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getOtherUser = (conversation) => {
    return conversation.otherUser?.[0] || conversation.otherUser;
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    const content = conversation.lastMessage.content || '';
    return content.length > 60 ? content.substring(0, 60) + '...' : content;
  };

  return (
    <div className="conversation-list-container">
      <div className="conversation-list-header">
        <h2>Conversations</h2>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="no-conversations">
          <div className="no-conversations-icon"><FontAwesomeIcon icon={faComments} /></div>
          <h3>No conversations yet</h3>
          <p>Start a conversation by contacting a seller from a product page</p>
        </div>
      ) : (
        <div className="conversations">
          {conversations.map((conversation, index) => {
            const otherUser = getOtherUser(conversation);
            const lastMessage = conversation.lastMessage;
            const isUnread = conversation.unreadCount > 0;

            return (
              <div
                key={conversation._id || index}
                className={`conversation-item ${isUnread ? 'unread' : ''}`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="conversation-avatar">
                  <span className="avatar-emoji">
                    {otherUser?.firstName?.[0] || otherUser?.username?.[0] ? (
                      otherUser?.firstName?.[0] || otherUser?.username?.[0]
                    ) : (
                      <FontAwesomeIcon icon={faUser} />
                    )}
                  </span>
                </div>
                <div className="conversation-content">
                  <div className="conversation-header">
                    <h3 className="conversation-name">
                      {otherUser?.firstName && otherUser?.lastName
                        ? `${otherUser.firstName} ${otherUser.lastName}`
                        : otherUser?.username || 'Unknown User'}
                    </h3>
                    {lastMessage && (
                      <span className="conversation-time">
                        {formatDate(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {lastMessage?.product && (
                    <div className="conversation-product">
                      <FontAwesomeIcon icon={faBox} /> {lastMessage.product.title}
                    </div>
                  )}
                  <p className="conversation-preview">
                    {getLastMessagePreview(conversation)}
                  </p>
                </div>
                {isUnread && (
                  <div className="unread-indicator">
                    <span className="unread-dot"></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationList;

