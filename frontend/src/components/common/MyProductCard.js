import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faBox, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './MyProductCard.css';

const MyProductCard = ({ product, onStatusUpdate, onDelete, isActionLoading }) => {
  const navigate = useNavigate();
  
  const isStudentEssential = product.isStudentEssential || product.price === 0;

  const handleViewDetails = () => {
    if (isStudentEssential) {
      navigate(`/student-essentials/${product.id || product._id}`);
    } else {
      navigate(`/products/${product.id || product._id}`);
    }
  };

  // Get primary image or first image
  const getPrimaryImage = () => {
    if (product.images && Array.isArray(product.images)) {
      const primaryImage = product.images.find(img => img.isPrimary);
      if (primaryImage) {
        if (typeof primaryImage === 'string') return primaryImage;
        return primaryImage.url || '';
      }
      if (product.images.length > 0) {
        const firstImage = product.images[0];
        if (typeof firstImage === 'string') return firstImage;
        return firstImage.url || '';
      }
    }
    return product.image || '';
  };

  const displayImage = getPrimaryImage();
  const isUrl = displayImage && typeof displayImage === 'string' && (displayImage.startsWith('http://') || displayImage.startsWith('https://') || displayImage.startsWith('//'));

  const handleMarkAsSold = (e) => {
    e.stopPropagation();
    const status = isStudentEssential ? 'claimed' : 'sold';
    const message = isStudentEssential ? 'Mark this item as claimed?' : 'Mark this product as sold?';
    if (window.confirm(message)) {
      onStatusUpdate(product.id || product._id, status);
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

  // Helper function to get status display
  const getStatusDisplay = (status) => {
    if (!status) return { text: 'Active', class: 'status-active' };
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'active':
        return { text: 'Active', class: 'status-active' };
      case 'sold':
        return { text: 'Sold', class: 'status-sold' };
      case 'claimed':
        return { text: 'Claimed', class: 'status-claimed' };
      case 'inactive':
        return { text: 'Inactive', class: 'status-inactive' };
      default:
        return { text: 'Active', class: 'status-active' };
    }
  };

  const getStatusBadge = () => {
    const statusInfo = getStatusDisplay(product.status);
    return (
      <span 
        className={`status-badge ${statusInfo.class}`} 
        title={`Product status: ${statusInfo.text}`}
      >
        {statusInfo.text}
      </span>
    );
  };
  
  const getFreeBadge = () => {
    if (isStudentEssential) {
      return <span className="free-badge">FREE</span>;
    }
    return null;
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
            <FontAwesomeIcon icon={faBox} />
          </span>
        )}
        {getStatusBadge()}
        {getFreeBadge()}
      </div>
      <div className="product-info">
        <div className="product-header-row">
          <div className="product-category">{product.category}</div>
        </div>
        <h3 className="product-title" onClick={handleViewDetails}>{product.title}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-meta">
          <div className="product-location">
            <span className="location-icon"><FontAwesomeIcon icon={faMapMarkerAlt} /></span>
            {product.location}
          </div>
          <div className="product-condition">
            <span className="condition-badge">{product.condition}</span>
          </div>
        </div>
        <div className="product-footer">
          <div className={isStudentEssential ? "product-price free" : "product-price"}>
            {isStudentEssential ? 'FREE' : `$${parseFloat(product.price || 0).toFixed(2)}`}
          </div>
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
                  {isActionLoading ? 'Updating...' : isStudentEssential ? 'Mark as Claimed' : 'Mark as Sold'}
                </button>
              ) : (product.status === 'sold' || product.status === 'claimed') ? (
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
                <small><FontAwesomeIcon icon={faExclamationTriangle} /> This product was deactivated by admin and cannot be modified.</small>
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

