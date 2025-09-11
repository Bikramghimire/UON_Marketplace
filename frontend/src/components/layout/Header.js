import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>UON Marketplace</h1>
        </div>
        
        <nav className="navigation">
          <ul className="nav-list">
            <li><a href="#home" className="nav-link active">Home</a></li>
            <li><a href="#products" className="nav-link">Products</a></li>
            <li><a href="#categories" className="nav-link">Categories</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
          </ul>
        </nav>
        
        <div className="header-actions">
          <button className="btn btn-outline">Login</button>
          <button className="btn btn-primary">Sign Up</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
