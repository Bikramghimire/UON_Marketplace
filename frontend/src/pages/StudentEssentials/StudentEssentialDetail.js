import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ImageCarousel from '../../components/common/ImageCarousel';
import ComposeMessage from '../../components/messages/ComposeMessage';
import { getStudentEssentialById } from '../../services/studentEssentialService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEnvelope, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import './StudentEssentialDetail.css';

const StudentEssentialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [essential, setEssential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComposeMessage, setShowComposeMessage] = useState(false);

  useEffect(() => {
    loadEssential();
  }, [id]);

  const loadEssential = async () => {
    try {
      setLoading(true);
      setError(null);
      const essentialData = await getStudentEssentialById(id);
      setEssential(essentialData);
    } catch (error) {
      setError(error.message || 'Failed to load student essential');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="essential-detail-page">
        <Header />
        <main className="essential-detail-main">
          <div className="essential-detail-container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading item...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !essential) {
    return (
      <div className="essential-detail-page">
        <Header />
        <main className="essential-detail-main">
          <div className="essential-detail-container">
            <div className="error-container">
              <div className="error-icon"><FontAwesomeIcon icon={faTimesCircle} /></div>
              <h2>Item Not Found</h2>
              <p>{error || 'The item you are looking for does not exist.'}</p>
              <button onClick={() => navigate('/student-essentials')} className="btn btn-primary">
                Back to Student Essentials
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

    const images = essential.images || (essential.image ? [essential.image] : []);

  return (
    <div className="essential-detail-page">
      <Header />
      <main className="essential-detail-main">
        <div className="essential-detail-container">
          <button onClick={() => navigate('/student-essentials')} className="back-button">
            ← Back to Student Essentials
          </button>

          <div className="essential-detail-content">
            {}
            <div className="essential-images-section">
              <ImageCarousel images={images} />
            </div>

            {}
            <div className="essential-info-section">
              <div className="essential-header">
                <div className="essential-category">
                  {essential.category?.name || essential.category || 'Uncategorized'}
                </div>
                <h1 className="essential-title">{essential.title}</h1>
                <div className="essential-price-large">
                  <span className="free-label">FREE</span>
                </div>
              </div>

              <div className="essential-meta-info">
                <div className="meta-item">
                  <span className="meta-label">Condition:</span>
                  <span className="meta-value condition-badge">{essential.condition || 'Good'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Location:</span>
                  <span className="meta-value"><FontAwesomeIcon icon={faMapMarkerAlt} /> {essential.location || essential.user?.location || 'N/A'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Posted:</span>
                  <span className="meta-value">{essential.datePosted || 'Recently'}</span>
                </div>
                {essential.views !== undefined && (
                  <div className="meta-item">
                    <span className="meta-label">Views:</span>
                    <span className="meta-value">{essential.views}</span>
                  </div>
                )}
              </div>

              <div className="essential-description-section">
                <h2>Description</h2>
                <p className="essential-description">{essential.description || 'No description available.'}</p>
              </div>

              {}
              {essential.user && (
                <div className="giver-section">
                  <h2>Giver Information</h2>
                  <div className="giver-info">
                    <div className="giver-name">
                      <strong>{essential.user.firstName || ''} {essential.user.lastName || ''}</strong>
                      {essential.user.firstName || essential.user.lastName ? '' : essential.user.username}
                    </div>
                    {essential.user.email && (
                      <div className="giver-email"><FontAwesomeIcon icon={faEnvelope} /> {essential.user.email}</div>
                    )}
                    {essential.user.location && (
                      <div className="giver-location"><FontAwesomeIcon icon={faMapMarkerAlt} /> {essential.user.location}</div>
                    )}
                  </div>
                </div>
              )}

              {}
              <div className="essential-actions">
                {isAuthenticated && essential?.user && (() => {
                  const giverId = essential.user.id || essential.user._id;
                  const currentUserId = user?.id || user?._id;
                  return giverId && currentUserId && giverId !== currentUserId;
                })() ? (
                  <button 
                    className="btn btn-primary btn-contact"
                    onClick={() => setShowComposeMessage(true)}
                  >
                    Contact Giver
                  </button>
                ) : !isAuthenticated ? (
                  <button 
                    className="btn btn-primary btn-contact"
                    onClick={() => navigate('/login')}
                  >
                    Login to Contact Giver
                  </button>
                ) : null}
               
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {}
      {showComposeMessage && essential?.user && (
        <ComposeMessage
          recipient={essential.user}
          product={essential}
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

export default StudentEssentialDetail;

