import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import './AuthPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/products');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    // Basic validation
    if (!formData.emailOrUsername || !formData.password) {
      setFormError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    // Trim inputs
    const emailOrUsernameTrimmed = formData.emailOrUsername.trim();
    const passwordTrimmed = formData.password.trim();

    if (!emailOrUsernameTrimmed || !passwordTrimmed) {
      setFormError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    // Validate email format if it's an email
    const isEmail = emailOrUsernameTrimmed.includes('@');
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailOrUsernameTrimmed)) {
        setFormError('Please enter a valid email address');
        setIsSubmitting(false);
        return;
      }
    } else {
      // Validate username format
      if (emailOrUsernameTrimmed.length < 3) {
        setFormError('Username must be at least 3 characters');
        setIsSubmitting(false);
        return;
      }
      if (emailOrUsernameTrimmed.length > 30) {
        setFormError('Username must be less than 30 characters');
        setIsSubmitting(false);
        return;
      }
    }

    // Password validation
    if (passwordTrimmed.length < 6) {
      setFormError('Password must be at least 6 characters');
      setIsSubmitting(false);
      return;
    }

    // Determine if input is email or username
    const loginData = {
      [isEmail ? 'email' : 'username']: isEmail ? emailOrUsernameTrimmed.toLowerCase() : emailOrUsernameTrimmed,
      password: passwordTrimmed
    };

    try {
      await login(loginData);
      // Check if user email is verified
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser && !currentUser.emailVerified) {
        navigate('/verify-email');
        return;
      }
      navigate('/products');
    } catch (error) {
      // Check if error is due to unverified email
      if (error.requiresVerification) {
        setFormError(error.message);
        // Redirect to verification page after showing error
        setTimeout(() => {
          navigate('/verify-email');
        }, 2000);
      } else {
        setFormError(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Header />
      <main className="auth-main">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Welcome Back</h1>
              <p>Sign in to your UON Marketplace account</p>
            </div>

            {(error || formError) && (
              <div className="error-message">
                {error || formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="emailOrUsername">Email</label>
                <input
                  type="text"
                  id="emailOrUsername"
                  name="emailOrUsername"
                  value={formData.emailOrUsername}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="auth-link">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
