import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUnreadCount } from '../../services/messageService';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      // Refresh unread count every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      
      // Listen for custom event when messages are read
      const handleMessagesRead = () => {
        loadUnreadCount();
      };
      window.addEventListener('messagesRead', handleMessagesRead);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('messagesRead', handleMessagesRead);
      };
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated, location.pathname]); // Refresh when route changes

  const loadUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    logout();
    setUnreadCount(0);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>UON Marketplace</h1>
        </Link>
        
        <nav className="navigation">
          <ul className="nav-list">
            <li>
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/products" 
                className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
              >
                Products
              </Link>
            </li>
            {isAuthenticated && user?.role === 'admin' && (
              <li>
                <Link 
                  to="/admin" 
                  className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                >
                  Admin
                </Link>
              </li>
            )}
            {isAuthenticated && (
              <>
                <li>
                  <Link 
                    to="/my-products" 
                    className={`nav-link ${location.pathname === '/my-products' ? 'active' : ''}`}
                  >
                    My Products
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/messages" 
                    className={`nav-link ${location.pathname === '/messages' ? 'active' : ''}`}
                  >
                    Messages
                    {unreadCount > 0 && (
                      <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <span className="user-greeting">
                Hi, {user?.firstName || user?.username || 'User'}!
              </span>
              <button 
                className="btn btn-outline"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
