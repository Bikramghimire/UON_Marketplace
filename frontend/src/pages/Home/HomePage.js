import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to UON Marketplace</h1>
            <p className="hero-subtitle">
              Discover amazing products from students and local vendors. 
              Buy, sell, and trade with your university community.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">Browse Products</button>
              <button className="btn btn-secondary">Sell Something</button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Why Choose UON Marketplace?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🛍️</div>
                <h3>Easy Buying</h3>
                <p>Find great deals on textbooks, electronics, and more from fellow students.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3>Quick Selling</h3>
                <p>Turn your unused items into cash with our simple selling process.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏫</div>
                <h3>Campus Community</h3>
                <p>Connect with your university community in a safe, trusted environment.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories-section">
          <div className="container">
            <h2 className="section-title">Popular Categories</h2>
            <div className="categories-grid">
              <div className="category-card">
                <h3>📚 Textbooks</h3>
                <p>Buy and sell course materials</p>
              </div>
              <div className="category-card">
                <h3>💻 Electronics</h3>
                <p>Laptops, phones, and gadgets</p>
              </div>
              <div className="category-card">
                <h3>👕 Clothing</h3>
                <p>Fashion and accessories</p>
              </div>
              <div className="category-card">
                <h3>🏠 Furniture</h3>
                <p>Dorm and apartment essentials</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
