import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getDashboardStats } from '../../services/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faShoppingBag, faCheckCircle, faDollarSign, faFolder, faSearch } from '@fortawesome/free-solid-svg-icons';
import './AdminPage.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
        if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadDashboardStats();
  }, [isAuthenticated, user, navigate]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      setError(error.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="admin-page">
        <Header />
        <main className="admin-main">
          <div className="admin-container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading dashboard...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Header />
      <main className="admin-main">
        <div className="admin-container">
          <div className="admin-header">
            <h1>Admin Dashboard</h1>
            <p>Manage your marketplace</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {stats && (
            <>
              {}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon"><FontAwesomeIcon icon={faUsers} /></div>
                  <div className="stat-info">
                    <h3>Total Users</h3>
                    <p className="stat-value">{stats.users.total}</p>
                    <p className="stat-sub">+{stats.users.recent} this week</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon"><FontAwesomeIcon icon={faShoppingBag} /></div>
                  <div className="stat-info">
                    <h3>Total Products</h3>
                    <p className="stat-value">{stats.products.total}</p>
                    <p className="stat-sub">{stats.products.active} active</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon"><FontAwesomeIcon icon={faCheckCircle} /></div>
                  <div className="stat-info">
                    <h3>Sold Products</h3>
                    <p className="stat-value">{stats.products.sold}</p>
                    <p className="stat-sub">{stats.products.recent} new this week</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon"><FontAwesomeIcon icon={faDollarSign} /></div>
                  <div className="stat-info">
                    <h3>Total Sold Revenue</h3>
                    <p className="stat-value">${parseFloat(stats.revenue?.total || 0).toFixed(2)}</p>
                    <p className="stat-sub">From sold products</p>
                  </div>
                </div>
              </div>

              {}
              <div className="admin-section">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                  <button 
                    className="action-card"
                    onClick={() => navigate('/admin/users')}
                  >
                    <div className="action-icon"><FontAwesomeIcon icon={faUsers} /></div>
                    <h3>Manage Users</h3>
                    <p>View, edit, and manage all users</p>
                  </button>

                  <button 
                    className="action-card"
                    onClick={() => navigate('/admin/products')}
                  >
                    <div className="action-icon"><FontAwesomeIcon icon={faShoppingBag} /></div>
                    <h3>Manage Products</h3>
                    <p>View, edit, and manage all products</p>
                  </button>

                  <button 
                    className="action-card"
                    onClick={() => navigate('/admin/categories')}
                  >
                    <div className="action-icon"><FontAwesomeIcon icon={faFolder} /></div>
                    <h3>Manage Categories</h3>
                    <p>Create, edit, and manage product categories</p>
                  </button>

                  <button 
                    className="action-card"
                    onClick={() => navigate('/products')}
                  >
                    <div className="action-icon"><FontAwesomeIcon icon={faSearch} /></div>
                    <h3>View Marketplace</h3>
                    <p>Browse products as a user</p>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
