import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faGift } from '@fortawesome/free-solid-svg-icons';
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
      if (primaryImage) {
        if (typeof primaryImage === 'string') return primaryImage;
        return primaryImage.url || '';
      }
      if (essential.images.length > 0) {
        const firstImage = essential.images[0];
        if (typeof firstImage === 'string') return firstImage;
        return firstImage.url || '';
      }
    }
    return essential.image || '';
  };

  const displayImage = getPrimaryImage();
  const isUrl = displayImage && typeof displayImage === 'string' && (displayImage.startsWith('http://') || displayImage.startsWith('https://') || displayImage.startsWith('//'));

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
            <FontAwesomeIcon icon={faGift} />
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
            <span className="location-icon"><FontAwesomeIcon icon={faMapMarkerAlt} /></span>
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

