import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getAllCategoriesAdmin, getAllProductsAdmin, createCategory, updateCategory, deleteCategory } from '../../services/adminService';
import './AdminPage.css';

const CategoryManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', icon: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', description: '', icon: '📦' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadCategories();
  }, [isAuthenticated, user, navigate]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const [categoriesResponse, productsResponse] = await Promise.all([
        getAllCategoriesAdmin(),
        getAllProductsAdmin({ limit: 1000 }) // Get all products to count
      ]);
      
      const categoriesData = categoriesResponse.data || [];
      const productsData = productsResponse.data || [];
      
      // Count products per category
      const counts = {};
      categoriesData.forEach(cat => {
        counts[cat._id] = productsData.filter(p => p.category?._id === cat._id || p.category === cat._id).length;
      });
      
      setCategories(categoriesData);
      setProductCounts(counts);
    } catch (error) {
      setError(error.message || 'Failed to load categories');
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setShowAddForm(true);
    setAddForm({ name: '', description: '', icon: '📦' });
    setError(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createCategory(addForm);
      await loadCategories();
      setShowAddForm(false);
      setAddForm({ name: '', description: '', icon: '📦' });
    } catch (error) {
      setError(error.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setEditForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📦'
    });
    setError(null);
  };

  const handleUpdate = async () => {
    if (!editForm.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await updateCategory(editingCategory._id, editForm);
      await loadCategories();
      setEditingCategory(null);
      setEditForm({ name: '', description: '', icon: '' });
    } catch (error) {
      setError(error.message || 'Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"? This action cannot be undone.`)) {
      try {
        setSubmitting(true);
        setError(null);
        await deleteCategory(id);
        await loadCategories();
      } catch (error) {
        setError(error.message || 'Failed to delete category');
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-page">
      <Header />
      <main className="admin-main">
        <div className="admin-container">
          <div className="admin-header">
            <h1>Category Management</h1>
            <p>Manage product categories</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="admin-filters">
            <button onClick={() => navigate('/admin')} className="btn btn-outline">
              ← Back to Dashboard
            </button>
            <button onClick={handleAdd} className="btn btn-primary">
              + Add Category
            </button>
          </div>

          {/* Add Category Form */}
          {showAddForm && (
            <div className="admin-form-container" style={{ marginBottom: '2rem' }}>
              <h2>Add New Category</h2>
              <form onSubmit={handleCreate}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category Name *</label>
                    <input
                      type="text"
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      placeholder="e.g., Electronics"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="form-group">
                    <label>Icon (Emoji)</label>
                    <input
                      type="text"
                      value={addForm.icon}
                      onChange={(e) => setAddForm({ ...addForm, icon: e.target.value })}
                      placeholder="📦"
                      maxLength={2}
                      disabled={submitting}
                    />
                    <small>Enter an emoji (e.g., 📚, 💻, 👕)</small>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    placeholder="Category description"
                    rows="3"
                    disabled={submitting}
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setAddForm({ name: '', description: '', icon: '📦' });
                    }}
                    className="btn btn-outline"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories Table */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading categories...</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Products</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        No categories found. Click "Add Category" to create one.
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category._id}>
                        <td style={{ fontSize: '1.5rem', textAlign: 'center' }}>
                          {category.icon || '📦'}
                        </td>
                        <td style={{ fontWeight: '600' }}>{category.name}</td>
                        <td>{category.description || '-'}</td>
                        <td style={{ fontWeight: '600', color: '#1295D8' }}>
                          {productCounts[category._id] || 0}
                        </td>
                        <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-edit"
                              onClick={() => handleEdit(category)}
                              disabled={submitting}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(category._id, category.name)}
                              disabled={submitting}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Edit Modal */}
          {editingCategory && (
            <div className="modal-overlay" onClick={() => setEditingCategory(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Edit Category</h2>
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <label>Icon (Emoji)</label>
                  <input
                    type="text"
                    value={editForm.icon}
                    onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                    placeholder="📦"
                    maxLength={2}
                    disabled={submitting}
                  />
                  <small>Enter an emoji (e.g., 📚, 💻, 👕)</small>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows="3"
                    disabled={submitting}
                  />
                </div>
                <div className="modal-actions">
                  <button onClick={handleUpdate} className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="btn btn-outline"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryManagement;
