import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import MyProductCard from '../../components/common/MyProductCard';
import { getUserProducts, updateProductStatus, deleteProduct } from '../../services/productService';
import './MyProducts.css';

const MyProducts = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadMyProducts();
  }, [isAuthenticated, navigate]);

  const loadMyProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserProducts();
      setProducts(data);
    } catch (error) {
      setError(error.message || 'Failed to load your products');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (productId, status) => {
    try {
      setActionLoading(productId);
      setError(null);
      setSuccess(null);
      
      await updateProductStatus(productId, status);
      
      setSuccess(`Product ${status === 'sold' ? 'marked as sold' : 'marked as active'} successfully!`);
      
      // Reload products to reflect changes
      await loadMyProducts();
    } catch (error) {
      setError(error.message || 'Failed to update product status');
      console.error('Error updating product status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (productId) => {
    try {
      setActionLoading(productId);
      setError(null);
      setSuccess(null);
      
      await deleteProduct(productId);
      
      setSuccess('Product deleted successfully!');
      
      // Remove product from list immediately
      setProducts(products.filter(p => (p.id || p._id) !== productId));
    } catch (error) {
      setError(error.message || 'Failed to delete product');
      console.error('Error deleting product:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="my-products-page">
      <Header />
      <main className="my-products-main">
        {/* Page Header */}
        <section className="my-products-header">
          <div className="container">
            <h1 className="page-title">My Products</h1>
            <p className="page-subtitle">Manage and review all your listed products</p>
          </div>
        </section>

        {/* Products Section */}
        <section className="my-products-section">
          <div className="container">
            <div className="my-products-actions">
              <Link to="/sell" className="btn btn-primary">
                + List New Product
              </Link>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your products...</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="products-count">
                  <p>You have {products.length} product{products.length !== 1 ? 's' : ''} listed</p>
                </div>
                <div className="products-grid">
                  {products.map(product => (
                    <MyProductCard
                      key={product.id || product._id}
                      product={product}
                      onStatusUpdate={handleStatusUpdate}
                      onDelete={handleDelete}
                      isActionLoading={actionLoading === (product.id || product._id)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="no-products">
                <div className="no-products-icon">📦</div>
                <h2>No products yet</h2>
                <p>Start selling by listing your first product!</p>
                <Link to="/sell" className="btn btn-primary">
                  List Your First Product
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MyProducts;

