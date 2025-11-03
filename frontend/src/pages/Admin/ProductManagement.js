import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getAllProductsAdmin, updateProductAdmin, deleteProductAdmin } from '../../services/adminService';
import './AdminPage.css';

const ProductManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', title: '', price: '' });

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadProducts();
  }, [page, search, statusFilter, isAuthenticated, user, navigate]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllProductsAdmin({ page, limit: 10, status: statusFilter, search });
      setProducts(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      setError(error.message || 'Failed to load products');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      status: product.status,
      title: product.title,
      price: product.price
    });
  };

  const handleUpdate = async () => {
    try {
      await updateProductAdmin(editingProduct._id, editForm);
      await loadProducts();
      setEditingProduct(null);
      setEditForm({ status: '', title: '', price: '' });
    } catch (error) {
      setError(error.message || 'Failed to update product');
    }
  };

  const handleDelete = async (productId, title) => {
    if (window.confirm(`Are you sure you want to delete product "${title}"? This action cannot be undone.`)) {
      try {
        await deleteProductAdmin(productId);
        await loadProducts();
      } catch (error) {
        setError(error.message || 'Failed to delete product');
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
            <h1>Product Management</h1>
            <p>Manage all marketplace products</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="admin-filters">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="filter-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="inactive">Inactive</option>
            </select>
            <button onClick={() => navigate('/admin')} className="btn btn-outline">
              ← Back to Dashboard
            </button>
          </div>

          {/* Products Table */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : (
            <>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Seller</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td>{product.title}</td>
                        <td>{product.user?.username || 'Unknown'}</td>
                        <td>{product.category?.name || 'N/A'}</td>
                        <td>${product.price.toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${product.status}`}>
                            {product.status}
                          </span>
                        </td>
                        <td>{product.views || 0}</td>
                        <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-edit"
                              onClick={() => handleEdit(product)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(product._id, product.title)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn btn-outline"
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="btn btn-outline"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* Edit Modal */}
          {editingProduct && (
            <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Edit Product</h2>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button onClick={handleUpdate} className="btn btn-primary">
                    Update
                  </button>
                  <button onClick={() => setEditingProduct(null)} className="btn btn-outline">
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

export default ProductManagement;
