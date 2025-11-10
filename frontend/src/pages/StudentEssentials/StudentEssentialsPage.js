import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import StudentEssentialCard from '../../components/common/StudentEssentialCard';
import { getAllStudentEssentials, getCategories } from '../../services/studentEssentialService';
import './StudentEssentialsPage.css';

const StudentEssentialsPage = () => {
  const [essentials, setEssentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: 'All',
    search: '',
    sortBy: 'newest'
  });

  useEffect(() => {
    loadCategories();
    loadEssentials();
  }, []);

  useEffect(() => {
    loadEssentials();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const cats = await getCategories();
      // Extract category names from objects
      const categoryNames = cats.map(cat => typeof cat === 'string' ? cat : cat.name);
      setCategories(['All', ...categoryNames]);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Set default categories on error
      setCategories(['All']);
    }
  };

  const loadEssentials = async () => {
    setLoading(true);
    try {
      const data = await getAllStudentEssentials(filters);
      setEssentials(data);
    } catch (error) {
      console.error('Error loading student essentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearchChange = (e) => {
    handleFilterChange('search', e.target.value);
  };

  const handleCategoryChange = (e) => {
    handleFilterChange('category', e.target.value);
  };

  const handleSortChange = (e) => {
    handleFilterChange('sortBy', e.target.value);
  };

  return (
    <div className="essentials-page">
      <Header />
      
      <main className="essentials-main">
        {/* Page Header */}
        <section className="essentials-header">
          <div className="container">
            <h1 className="page-title">Student Essentials</h1>
            <p className="page-subtitle">Free items shared by your fellow students</p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="filters-section">
          <div className="container">
            <div className="filters-container">
              {/* Search Bar */}
              <div className="filter-group">
                <label htmlFor="search">Search</label>
                <input
                  type="text"
                  id="search"
                  className="search-input"
                  placeholder="Search items..."
                  value={filters.search}
                  onChange={handleSearchChange}
                />
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  className="filter-select"
                  value={filters.category}
                  onChange={handleCategoryChange}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="filter-group">
                <label htmlFor="sort">Sort By</label>
                <select
                  id="sort"
                  className="filter-select"
                  value={filters.sortBy}
                  onChange={handleSortChange}
                >
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Essentials Grid */}
        <section className="essentials-section">
          <div className="container">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading student essentials...</p>
              </div>
            ) : essentials.length > 0 ? (
              <>
                <div className="essentials-count">
                  <p>Showing {essentials.length} item{essentials.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="essentials-grid">
                  {essentials.map(essential => (
                    <StudentEssentialCard key={essential.id} essential={essential} />
                  ))}
                </div>
              </>
            ) : (
              <div className="no-essentials">
                <div className="no-essentials-icon">🎁</div>
                <h2>No items found</h2>
                <p>Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default StudentEssentialsPage;

