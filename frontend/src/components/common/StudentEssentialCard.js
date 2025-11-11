import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentEssentialCard.css';

const StudentEssentialCard = ({ essential }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/student-essentials/${essential.id || essential._id}`);
  };

  // Get primary image or first image
  const getPrimaryImage = () => {
    if (essential.images && Array.isArray(essential.images)) {
      const primaryImage = essential.images.find(img => img.isPrimary);
      if (primaryImage) return primaryImage.url || primaryImage;
      if (essential.images.length > 0) {
        return typeof essential.images[0] === 'string' ? essential.images[0] : essential.images[0].url || essential.images[0];
      }
    }
    return essential.image || '🎁';
  };

  const displayImage = getPrimaryImage();
  const isUrl = displayImage && (displayImage.startsWith('http://') || displayImage.startsWith('https://') || displayImage.startsWith('//'));

  return (
    <div className="essential-card" onClick={handleViewDetails}>
      <div className="essential-image">
        {isUrl ? (
          <img 
            src={displayImage} 
            alt={essential.title}
            className="essential-image-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <span className="essential-emoji" style={{ display: isUrl ? 'none' : 'flex' }}>
          {displayImage}
        </span>
        {isUrl && (
          <span className="essential-emoji-fallback" style={{ display: 'none' }}>
            🎁
          </span>
        )}
        <div className="free-badge">FREE</div>
      </div>
      <div className="essential-info">
        <div className="essential-category">{essential.category}</div>
        <h3 className="essential-title">{essential.title}</h3>
        <p className="essential-description">{essential.description}</p>
        <div className="essential-meta">
          <div className="essential-location">
            <span className="location-icon">📍</span>
            {essential.location}
          </div>
          <div className="essential-condition">
            <span className="condition-badge">{essential.condition}</span>
          </div>
        </div>
        <div className="essential-footer">
          <div className="essential-price">FREE</div>
          <div className="essential-date">{essential.datePosted}</div>
        </div>
        <button className="btn-view-details">View Details</button>
      </div>
    </div>
  );
};

export default StudentEssentialCard;

