import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
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
              <li>
                <Link 
                  to="/my-products" 
                  className={`nav-link ${location.pathname === '/my-products' ? 'active' : ''}`}
                >
                  My Products
                </Link>
              </li>
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
