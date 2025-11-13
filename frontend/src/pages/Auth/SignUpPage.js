import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import './AuthPage.css';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { register, user, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in and verified
  useEffect(() => {
    if (user && user.emailVerified) {
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

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setFormError('Username, email, and password are required');
      setIsSubmitting(false);
      return;
    }

    // Username validation
    const usernameTrimmed = formData.username.trim();
    if (usernameTrimmed.length < 3) {
      setFormError('Username must be at least 3 characters');
      setIsSubmitting(false);
      return;
    }
    if (usernameTrimmed.length > 30) {
      setFormError('Username must be less than 30 characters');
      setIsSubmitting(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(usernameTrimmed)) {
      setFormError('Username can only contain letters, numbers, and underscores');
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailTrimmed = formData.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setFormError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    // Password validation
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      setIsSubmitting(false);
      return;
    }
    if (formData.password.length > 255) {
      setFormError('Password must be less than 255 characters');
      setIsSubmitting(false);
      return;
    }
    // Check for spaces
    if (/\s/.test(formData.password)) {
      setFormError('Password should not contain spaces');
      setIsSubmitting(false);
      return;
    }
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(formData.password)) {
      setFormError('Password must include at least one uppercase letter (A-Z)');
      setIsSubmitting(false);
      return;
    }
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(formData.password)) {
      setFormError('Password must include at least one lowercase letter (a-z)');
      setIsSubmitting(false);
      return;
    }
    // Check for at least one digit
    if (!/[0-9]/.test(formData.password)) {
      setFormError('Password must include at least one digit (0-9)');
      setIsSubmitting(false);
      return;
    }
    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      setFormError('Password must include at least one special character (e.g., !@#$%^&*() etc.)');
      setIsSubmitting(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    // Phone validation (if provided)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        setFormError('Please enter a valid phone number');
        setIsSubmitting(false);
        return;
      }
    }

    // First name and last name validation (if provided)
    if (formData.first_name && formData.first_name.trim().length > 255) {
      setFormError('First name must be less than 255 characters');
      setIsSubmitting(false);
      return;
    }
    if (formData.last_name && formData.last_name.trim().length > 255) {
      setFormError('Last name must be less than 255 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      const userData = {
        username: usernameTrimmed,
        email: emailTrimmed,
        password: formData.password,
        firstName: formData.first_name?.trim() || undefined,
        lastName: formData.last_name?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        location: formData.location?.trim() || undefined,
      };

      await register(userData);
      // Clear any existing tokens/user before redirect
      // This ensures no auto-login happens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to verification page after signup
      navigate('/verify-email');
    } catch (error) {
      setFormError(error.message || 'Registration failed. Please try again.');
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
              <h1>Create Account</h1>
              <p>Join Lifecycle Marketplace today</p>
            </div>

            {(error || formError) && (
              <div className="error-message">
                {error || formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Username *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First name"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last name"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Campus Dorm, Off-Campus"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  disabled={isSubmitting}
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  disabled={isSubmitting}
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign In
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

export default SignUpPage;
