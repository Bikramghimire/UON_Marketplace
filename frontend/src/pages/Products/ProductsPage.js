import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ProductCard from '../../components/common/ProductCard';
import { getAllProducts, getCategories } from '../../services/productService';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: 'All',
    search: '',
    sortBy: 'newest'
  });

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadCategories = async () => {
    const cats = getCategories();
    setCategories(['All', ...cats]);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getAllProducts(filters);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
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
    <div className="products-page">
      <Header />
      
      <main className="products-main">
        {/* Page Header */}
        <section className="products-header">
          <div className="container">
            <h1 className="page-title">Browse Products</h1>
            <p className="page-subtitle">Discover amazing deals from your university community</p>
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
                  placeholder="Search products..."
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
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="products-section">
          <div className="container">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="products-count">
                  <p>Showing {products.length} product{products.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="products-grid">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="no-products">
                <div className="no-products-icon">🔍</div>
                <h2>No products found</h2>
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

export default ProductsPage;
