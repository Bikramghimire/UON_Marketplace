import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MyProductCard.css';

const MyProductCard = ({ product, onStatusUpdate, onDelete, isActionLoading }) => {
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

  const handleMarkAsSold = (e) => {
    e.stopPropagation();
    if (window.confirm('Mark this product as sold?')) {
      onStatusUpdate(product.id || product._id, 'sold');
    }
  };

  const handleMarkAsActive = (e) => {
    e.stopPropagation();
    onStatusUpdate(product.id || product._id, 'active');
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      onDelete(product.id || product._id);
    }
  };

  const getStatusBadge = () => {
    switch (product.status) {
      case 'sold':
        return <span className="status-badge status-sold">Sold</span>;
      case 'inactive':
        return <span className="status-badge status-inactive">Inactive</span>;
      default:
        return <span className="status-badge status-active">Active</span>;
    }
  };

  return (
    <div className="my-product-card">
      <div className="product-image" onClick={handleViewDetails}>
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
        {getStatusBadge()}
      </div>
      <div className="product-info">
        <div className="product-header-row">
          <div className="product-category">{product.category}</div>
        </div>
        <h3 className="product-title" onClick={handleViewDetails}>{product.title}</h3>
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
          <div className="product-price">${product.price?.toFixed(2) || '0.00'}</div>
          <div className="product-date">{product.datePosted}</div>
        </div>
        <div className="product-actions">
          {product.status !== 'inactive' && (
            <div className="action-buttons-row">
              {product.status === 'active' ? (
                <button
                  className="btn-action btn-mark-sold"
                  onClick={handleMarkAsSold}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? 'Updating...' : 'Mark as Sold'}
                </button>
              ) : product.status === 'sold' ? (
                // Only show "Mark as Active" for sold products (not inactive ones set by admin)
                <button
                  className="btn-action btn-mark-active"
                  onClick={handleMarkAsActive}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? 'Updating...' : 'Mark as Active'}
                </button>
              ) : null}
              <button
                className="btn-action btn-delete"
                onClick={handleDelete}
                disabled={isActionLoading}
              >
                {isActionLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                className="btn-action btn-view"
                onClick={handleViewDetails}
                disabled={isActionLoading}
              >
                View Details
              </button>
            </div>
          )}
          {product.status === 'inactive' && (
            <>
              <div className="inactive-notice">
                <small>⚠️ This product was deactivated by admin and cannot be modified.</small>
              </div>
              <button
                className="btn-action btn-view"
                onClick={handleViewDetails}
                disabled={isActionLoading}
              >
                View Details
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProductCard;

