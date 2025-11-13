import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import MyProductCard from '../../components/common/MyProductCard';
import { getUserProducts, updateProductStatus, deleteProduct } from '../../services/productService';
import { getUserStudentEssentials, updateStudentEssentialStatus, deleteStudentEssential } from '../../services/studentEssentialService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faBox } from '@fortawesome/free-solid-svg-icons';
import './MyProducts.css';

const MyProducts = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [essentials, setEssentials] = useState([]);
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
      const [productsData, essentialsData] = await Promise.all([
        getUserProducts(),
        getUserStudentEssentials()
      ]);
      setProducts(productsData);
      setEssentials(essentialsData);
    } catch (error) {
      setError(error.message || 'Failed to load your items');
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (itemId, status, isEssential = false) => {
    try {
      setActionLoading(itemId);
      setError(null);
      setSuccess(null);
      
      if (isEssential) {
        await updateStudentEssentialStatus(itemId, status);
        setSuccess(`Item ${status === 'claimed' ? 'marked as claimed' : 'marked as active'} successfully!`);
      } else {
        await updateProductStatus(itemId, status);
        setSuccess(`Product ${status === 'sold' ? 'marked as sold' : 'marked as active'} successfully!`);
      }
      
      // Reload items to reflect changes
      await loadMyProducts();
    } catch (error) {
      setError(error.message || 'Failed to update item status');
      console.error('Error updating item status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (itemId, isEssential = false) => {
    try {
      setActionLoading(itemId);
      setError(null);
      setSuccess(null);
      
      if (isEssential) {
        await deleteStudentEssential(itemId);
        setEssentials(essentials.filter(e => (e.id || e._id) !== itemId));
        setSuccess('Student essential deleted successfully!');
      } else {
        await deleteProduct(itemId);
        setProducts(products.filter(p => (p.id || p._id) !== itemId));
        setSuccess('Product deleted successfully!');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete item');
      console.error('Error deleting item:', error);
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
            <p className="page-subtitle">Manage and review all your listed products and free items</p>
          </div>
        </section>

        {/* Products Section */}
        <section className="my-products-section">
          <div className="container">
            <div className="my-products-actions">
              <Link to="/sell" className="btn btn-primary">
                + List New Product
              </Link>
              <Link to="/add-student-essential" className="btn btn-secondary">
                <FontAwesomeIcon icon={faGift} /> Give Away for Free
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
            ) : (products.length > 0 || essentials.length > 0) ? (
              <>
                <div className="products-count">
                  <p>You have {products.length + essentials.length} item{(products.length + essentials.length) !== 1 ? 's' : ''} listed ({products.length} product{products.length !== 1 ? 's' : ''}, {essentials.length} free item{essentials.length !== 1 ? 's' : ''})</p>
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
                  {essentials.map(essential => (
                    <MyProductCard
                      key={essential.id || essential._id}
                      product={{ ...essential, isStudentEssential: true }}
                      onStatusUpdate={(id, status) => handleStatusUpdate(id, status, true)}
                      onDelete={(id) => handleDelete(id, true)}
                      isActionLoading={actionLoading === (essential.id || essential._id)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="no-products">
                <div className="no-products-icon"><FontAwesomeIcon icon={faBox} /></div>
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

