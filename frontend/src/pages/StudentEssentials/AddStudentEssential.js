import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getCategories, createStudentEssential } from '../../services/studentEssentialService';
import { uploadImages } from '../../services/uploadService';
import './AddStudentEssential.css';

const AddStudentEssential = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: 'Good',
    location: '',
    imageFiles: [] // Store File objects (multiple images)
  });
  
  const [previewUrls, setPreviewUrls] = useState([]); // Store preview URLs for uploaded files

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadCategories();
  }, [isAuthenticated, navigate]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      setError(error.message || 'Failed to load categories');
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    const validFiles = [];
    const errors = [];

    files.forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Not an image file`);
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: File size must be less than 5MB`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    // Limit to 10 images
    const totalFiles = formData.imageFiles.length + validFiles.length;
    if (totalFiles > 10) {
      setError(`Maximum 10 images allowed. You already have ${formData.imageFiles.length} image(s) and trying to add ${validFiles.length}. Please remove some images first.`);
      return;
    }

    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...validFiles]
    }));
    
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setError(null);
  };

  const removeImage = (index) => {
    // Clean up preview URL
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    setFormData(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
    
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    setUploading(false);

    // Validation
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    try {
      let processedImages = [];

      // Upload files to Cloudinary
      if (formData.imageFiles.length > 0) {
        setUploading(true);
        try {
          const uploadResult = await uploadImages(formData.imageFiles);
          processedImages = uploadResult.data.images.map((img, index) => ({
            url: img.url,
            public_id: img.public_id,
            isPrimary: index === 0
          }));
        } catch (uploadError) {
          setError(uploadError.message || 'Failed to upload images');
          setUploading(false);
          setSubmitting(false);
          return;
        }
        setUploading(false);
      }

      // If no images, use default emoji
      if (processedImages.length === 0) {
        processedImages = [{
          url: '🎁',
          isPrimary: true
        }];
      }

      // Mark first image as primary
      if (processedImages.length > 0) {
        processedImages[0].isPrimary = true;
      }

      const essentialData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        location: formData.location || user?.location || '',
        images: processedImages
      };

      await createStudentEssential(essentialData);
      
      setSuccess('Student essential listed successfully!');
      
      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        condition: 'Good',
        location: '',
        imageFiles: []
      });
      setPreviewUrls([]);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/my-products');
      }, 2000);

    } catch (error) {
      setError(error.message || 'Failed to create student essential listing');
      console.error('Error creating student essential:', error);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="add-essential-page">
        <Header />
        <main className="add-essential-main">
          <div className="add-essential-container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading form...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="add-essential-page">
      <Header />
      <main className="add-essential-main">
        <div className="add-essential-container">
          <div className="add-essential-header">
            <h1>Give Away for Free</h1>
            <p>Share something with your fellow students - completely free!</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
              <p className="redirect-message">Redirecting to my products page...</p>
            </div>
          )}

          <div className="add-essential-form-container">
            <form onSubmit={handleSubmit} className="add-essential-form">
              {/* Basic Information */}
              <div className="form-section">
                <h2>Item Details</h2>
                
                <div className="form-group">
                  <label htmlFor="title">Item Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Old Textbooks, Furniture, etc."
                    required
                    disabled={submitting}
                    maxLength={200}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your item in detail..."
                    rows="6"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat._id || cat.name} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="condition">Condition *</label>
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    >
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={user?.location || "e.g., Campus Dorm, Off-Campus"}
                    disabled={submitting}
                  />
                  <small>Leave empty to use your profile location</small>
                </div>
              </div>

              {/* Images */}
              <div className="form-section">
                <h2>Item Images</h2>
                <p className="section-description">
                  Upload multiple images from your device. You can select up to 10 images at once. The first image will be the primary image.
                </p>
                
                {/* Multiple File Upload */}
                <div className="image-upload-section">
                  <input
                    type="file"
                    id="essential-images"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={submitting || uploading}
                    style={{ display: 'none' }}
                    multiple
                    ref={fileInputRef}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-primary btn-upload"
                    disabled={submitting || uploading}
                  >
                    📁 Select Images (Multiple)
                  </button>
                  <small className="upload-hint">
                    Select one or more images (max 10 images, 5MB each)
                  </small>
                </div>

                {/* Image Preview Grid */}
                {previewUrls.length > 0 && (
                  <div className="image-previews-grid">
                    <h3>Selected Images ({formData.imageFiles.length})</h3>
                    <div className="preview-grid">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="preview-item">
                          <div className="preview-image-wrapper">
                            <img 
                              src={url} 
                              alt={`Preview ${index + 1}`}
                              className="preview-image"
                            />
                            {index === 0 && (
                              <span className="primary-badge">Primary</span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="preview-remove-btn"
                              disabled={submitting || uploading}
                            >
                              ×
                            </button>
                          </div>
                          <div className="preview-info">
                            <span className="preview-name">
                              {formData.imageFiles[index]?.name || `Image ${index + 1}`}
                            </span>
                            {formData.imageFiles[index] && (
                              <span className="preview-size">
                                {(formData.imageFiles[index].size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {uploading && (
                  <div className="upload-progress">
                    <div className="loading-spinner"></div>
                    <p>Uploading {formData.imageFiles.length} image(s) to Cloudinary...</p>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/student-essentials')}
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || uploading}
                >
                  {uploading ? 'Uploading Images...' : submitting ? 'Listing Item...' : 'List Item for Free'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddStudentEssential;

