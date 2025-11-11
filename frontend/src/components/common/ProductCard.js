import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/products/${product.id || product._id}`);
  };

  // Get primary image or first image
  const getPrimaryImage = () => {
    if (product.images && Array.isArray(product.images)) {
      const primaryImage = product.images.find(img => img.isPrimary);
      if (primaryImage) return primaryImage.url || primaryImage;
      if (product.images.length > 0) {
        return typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url || product.images[0];
      }
    }
    return product.image || '📦';
  };

  const displayImage = getPrimaryImage();
  const isUrl = displayImage && (displayImage.startsWith('http://') || displayImage.startsWith('https://') || displayImage.startsWith('//'));

  return (
    <div className="product-card" onClick={handleViewDetails}>
      <div className="product-image">
        {isUrl ? (
          <img 
            src={displayImage} 
            alt={product.title}
            className="product-image-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <span className="product-emoji" style={{ display: isUrl ? 'none' : 'flex' }}>
          {displayImage}
        </span>
        {isUrl && (
          <span className="product-emoji-fallback" style={{ display: 'none' }}>
            📦
          </span>
        )}
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
          <div className="product-price">${parseFloat(product.price || 0).toFixed(2)}</div>
          <div className="product-date">{product.datePosted}</div>
        </div>
        <button className="btn-view-details">View Details</button>
      </div>
    </div>
  );
};

export default ProductCard;
