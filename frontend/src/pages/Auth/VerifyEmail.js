import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import './AuthPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
  const [formData, setFormData] = useState({
    email: user?.email || pendingEmail || '',
    code: ''
  });
  const [status, setStatus] = useState('form');   const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
        if (name === 'code') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    setStatus('verifying');

    if (!formData.email || !formData.code) {
      setMessage('Please enter both email and verification code');
      setStatus('form');
      setLoading(false);
      return;
    }

    if (formData.code.length !== 6) {
      setMessage('Verification code must be 6 digits');
      setStatus('form');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          code: formData.code.trim()
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
                localStorage.removeItem('pendingVerificationEmail');
                setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to verify email');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while verifying your email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!formData.email) {
      setMessage('Please enter your email address');
      return;
    }

    setResending(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please login first to resend verification code');
        setResending(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Verification code sent successfully! Please check your email.');
      } else {
        setMessage(data.message || 'Failed to resend verification code');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <Header />
      <main className="auth-main">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Email Verification</h1>
            </div>

            {status === 'form' ? (
              <form onSubmit={handleSubmit} className="auth-form">
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                  Enter the 6-digit verification code sent to your email address
                </p>

                {message && (
                  <div className={`error-message ${message.includes('successfully') ? 'success-message' : ''}`}>
                    {message}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    disabled={loading || !!user}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="code">Verification Code</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    required
                    disabled={loading}
                    style={{
                      fontSize: '24px',
                      letterSpacing: '8px',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontWeight: 'bold'
                    }}
                  />
                  <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                    Check your email for the 6-digit code
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading || formData.code.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || !formData.email}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#667eea',
                      cursor: resending || !formData.email ? 'not-allowed' : 'pointer',
                      textDecoration: 'underline',
                      fontSize: '14px'
                    }}
                  >
                    {resending ? 'Sending...' : "Didn't receive code? Resend"}
                  </button>
                </div>
              </form>
            ) : loading ? (
              <div className="verification-status">
                <div className="loading-spinner" style={{ margin: '20px auto' }}></div>
                <p>Verifying your email...</p>
              </div>
            ) : status === 'success' ? (
              <div className="verification-status">
                <div className="success-icon" style={{ 
                  fontSize: '64px', 
                  color: '#4caf50', 
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <FontAwesomeIcon icon={faCheck} />
                </div>
                <h2 style={{ color: '#4caf50', textAlign: 'center' }}>Email Verified!</h2>
                <p style={{ textAlign: 'center', marginBottom: '30px' }}>{message}</p>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                  You can now login to your account
                </p>
                <Link to="/login" className="btn btn-primary btn-block">
                  Go to Login
                </Link>
              </div>
            ) : (
              <div className="verification-status">
                <div className="error-icon" style={{ 
                  fontSize: '64px', 
                  color: '#f44336', 
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <FontAwesomeIcon icon={faTimes} />
                </div>
                <h2 style={{ color: '#f44336', textAlign: 'center' }}>Verification Failed</h2>
                <p style={{ textAlign: 'center', marginBottom: '30px' }}>{message}</p>
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  <Link to="/login" className="btn btn-primary btn-block">
                    Go to Login
                  </Link>
                  <Link to="/signup" className="btn btn-secondary btn-block">
                    Sign Up Again
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;

