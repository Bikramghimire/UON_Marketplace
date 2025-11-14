import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox } from '@fortawesome/free-solid-svg-icons';
import './ImageCarousel.css';

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="image-carousel">
        <div className="carousel-placeholder">
          <span className="placeholder-icon"><FontAwesomeIcon icon={faBox} /></span>
          <p>No images available</p>
        </div>
      </div>
    );
  }

    const imageArray = Array.isArray(images) ? images : [images];
  
    const imageUrls = imageArray.map(img => {
    if (typeof img === 'string') return img;
    if (img.url) return img.url;
    if (img.image) return img.image;
    return '';
  }).filter(url => url);

  if (imageUrls.length === 0) {
    return (
      <div className="image-carousel">
        <div className="carousel-placeholder">
          <span className="placeholder-icon"><FontAwesomeIcon icon={faBox} /></span>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

    const isUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
  };

  return (
    <div className="image-carousel">
      <div className="carousel-container">
        {}
        <div className="carousel-main">
          <button 
            className="carousel-btn carousel-btn-prev"
            onClick={goToPrevious}
            disabled={imageUrls.length === 1}
          >
            &#8249;
          </button>
          
          <div className="carousel-slide">
            {isUrl(imageUrls[currentIndex]) ? (
              <img 
                src={imageUrls[currentIndex]} 
                alt={`Product image ${currentIndex + 1}`}
                className="carousel-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="carousel-emoji">
                <span>{imageUrls[currentIndex]}</span>
              </div>
            )}
            
            {}
            {isUrl(imageUrls[currentIndex]) && (
              <div className="carousel-emoji-fallback" style={{ display: 'none' }}>
                <span><FontAwesomeIcon icon={faBox} /></span>
              </div>
            )}
          </div>

          <button 
            className="carousel-btn carousel-btn-next"
            onClick={goToNext}
            disabled={imageUrls.length === 1}
          >
            &#8250;
          </button>
        </div>

        {}
        {imageUrls.length > 1 && (
          <div className="carousel-counter">
            {currentIndex + 1} / {imageUrls.length}
          </div>
        )}

        {}
        {imageUrls.length > 1 && (
          <div className="carousel-thumbnails">
            {imageUrls.map((url, index) => (
              <div
                key={index}
                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              >
                {isUrl(url) ? (
                  <img 
                    src={url} 
                    alt={`Thumbnail ${index + 1}`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : (
                  <span className="thumbnail-emoji">{url}</span>
                )}
                
                {}
                {isUrl(url) && (
                  <span className="thumbnail-emoji-fallback" style={{ display: 'none' }}>
                    <FontAwesomeIcon icon={faBox} />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;

