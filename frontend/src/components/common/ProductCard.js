import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const handleViewDetails = () => {
    // Navigate to product details page (to be implemented)
    console.log('View details for product:', product.id);
  };

  return (
    <div className="product-card" onClick={handleViewDetails}>
      <div className="product-image">
        <span className="product-emoji">{product.image}</span>
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-title">{product.title}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-meta">
          <div className="product-location">
            <span className="location-icon">📍</span>
            {product.location}
          </div>
          <div className="product-condition">
            <span className="condition-badge">{product.condition}</span>
          </div>
        </div>
        <div className="product-footer">
          <div className="product-price">${product.price.toFixed(2)}</div>
          <div className="product-date">{product.datePosted}</div>
        </div>
        <button className="btn-view-details">View Details</button>
      </div>
    </div>
  );
};

export default ProductCard;
