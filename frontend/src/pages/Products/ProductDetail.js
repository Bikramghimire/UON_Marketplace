import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ImageCarousel from '../../components/common/ImageCarousel';
import ComposeMessage from '../../components/messages/ComposeMessage';
import { getProductById } from '../../services/productService';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComposeMessage, setShowComposeMessage] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const productData = await getProductById(id);
      setProduct(productData);
    } catch (error) {
      setError(error.message || 'Failed to load product');
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Header />
        <main className="product-detail-main">
          <div className="product-detail-container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading product...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <Header />
        <main className="product-detail-main">
          <div className="product-detail-container">
            <div className="error-container">
              <div className="error-icon">❌</div>
              <h2>Product Not Found</h2>
              <p>{error || 'The product you are looking for does not exist.'}</p>
              <button onClick={() => navigate('/products')} className="btn btn-primary">
                Back to Products
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Extract images array from product
  const images = product.images || (product.image ? [product.image] : []);

  return (
    <div className="product-detail-page">
      <Header />
      <main className="product-detail-main">
        <div className="product-detail-container">
          <button onClick={() => navigate('/products')} className="back-button">
            ← Back to Products
          </button>

          <div className="product-detail-content">
            {/* Image Carousel Section */}
            <div className="product-images-section">
              <ImageCarousel images={images} />
            </div>

            {/* Product Information Section */}
            <div className="product-info-section">
              <div className="product-header">
                <div className="product-category">
                  {product.category?.name || product.category || 'Uncategorized'}
                </div>
                <h1 className="product-title">{product.title}</h1>
                <div className="product-price-large">${product.price?.toFixed(2) || '0.00'}</div>
              </div>

              <div className="product-meta-info">
                <div className="meta-item">
                  <span className="meta-label">Condition:</span>
                  <span className="meta-value condition-badge">{product.condition || 'Good'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Location:</span>
                  <span className="meta-value">📍 {product.location || product.user?.location || 'N/A'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Posted:</span>
                  <span className="meta-value">{product.datePosted || 'Recently'}</span>
                </div>
                {product.views !== undefined && (
                  <div className="meta-item">
                    <span className="meta-label">Views:</span>
                    <span className="meta-value">{product.views}</span>
                  </div>
                )}
              </div>

              <div className="product-description-section">
                <h2>Description</h2>
                <p className="product-description">{product.description || 'No description available.'}</p>
              </div>

              {/* Seller Information */}
              {product.user && (
                <div className="seller-section">
                  <h2>Seller Information</h2>
                  <div className="seller-info">
                    <div className="seller-name">
                      <strong>{product.user.firstName || ''} {product.user.lastName || ''}</strong>
                      {product.user.firstName || product.user.lastName ? '' : product.user.username}
                    </div>
                    {product.user.email && (
                      <div className="seller-email">📧 {product.user.email}</div>
                    )}
                    {product.user.location && (
                      <div className="seller-location">📍 {product.user.location}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="product-actions">
                {isAuthenticated && product?.user && (() => {
                  const sellerId = product.user.id || product.user._id;
                  const currentUserId = user?.id || user?._id;
                  return sellerId && currentUserId && sellerId !== currentUserId;
                })() ? (
                  <button 
                    className="btn btn-primary btn-contact"
                    onClick={() => setShowComposeMessage(true)}
                  >
                    Contact Seller
                  </button>
                ) : !isAuthenticated ? (
                  <button 
                    className="btn btn-primary btn-contact"
                    onClick={() => navigate('/login')}
                  >
                    Login to Contact Seller
                  </button>
                ) : null}
               
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Compose Message Modal */}
      {showComposeMessage && product?.user && (
        <ComposeMessage
          recipient={product.user}
          product={product}
          onClose={() => setShowComposeMessage(false)}
          onSent={() => {
            setShowComposeMessage(false);
            navigate('/messages');
          }}
        />
      )}
    </div>
  );
};

export default ProductDetail;

