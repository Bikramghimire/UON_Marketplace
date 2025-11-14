import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import MessageThread from '../../components/messages/MessageThread';
import ConversationList from '../../components/messages/ConversationList';
import { getConversations } from '../../services/messageService';
import './Messages.css';

const Messages = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadConversations();
  }, [isAuthenticated, navigate]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      setError(error.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    loadConversations();   };

  const handleMessageSent = () => {
    loadConversations();   };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="messages-page">
      <Header />
      <main className="messages-main">
        {}
        <section className="messages-header">
          <div className="container">
            <h1 className="page-title">Messages</h1>
            <p className="page-subtitle">Communicate with buyers and sellers</p>
          </div>
        </section>

        {}
        <section className="messages-section">
          <div className="messages-container">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading messages...</p>
              </div>
            ) : selectedConversation ? (
              <MessageThread
                conversation={selectedConversation}
                onBack={handleBackToList}
                onMessageSent={handleMessageSent}
              />
            ) : (
              <ConversationList
                conversations={conversations}
                onSelectConversation={handleSelectConversation}
                onRefresh={loadConversations}
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;

