import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* <div className="footer-section">
            <h3>Lifecycle Marketplace</h3>
            <p>Connecting students and local vendors in a trusted marketplace environment.</p>
            <div className="social-links">
              <a href="#" className="social-link"><FontAwesomeIcon icon={faFacebook} /></a>
              <a href="#" className="social-link"><FontAwesomeIcon icon={faInstagram} /></a>
              <a href="#" className="social-link"><FontAwesomeIcon icon={faTwitter} /></a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#products">Products</a></li>
              <li><a href="#categories">Categories</a></li>
              <li><a href="#sell">Sell</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><a href="#help">Help Center</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#safety">Safety Tips</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="contact-info">
              <p><FontAwesomeIcon icon={faEnvelope} /> info@uonmarketplace.com</p>
              <p><FontAwesomeIcon icon={faPhone} /> +1 (555) 123-4567</p>
              <p><FontAwesomeIcon icon={faMapMarkerAlt} /> University of North Campus</p>
            </div>
          </div> */}
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Lifecycle Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
