import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/Home/HomePage';
import ProductsPage from './pages/Products/ProductsPage';
import ProductDetail from './pages/Products/ProductDetail';
import MyProducts from './pages/MyProducts/MyProducts';
import Messages from './pages/Messages/Messages';
import LoginPage from './pages/Auth/LoginPage';
import SignUpPage from './pages/Auth/SignUpPage';
import VerifyEmail from './pages/Auth/VerifyEmail';
import SellProduct from './pages/Sell/SellProduct';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import ProductManagement from './pages/Admin/ProductManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';
import StudentEssentialsPage from './pages/StudentEssentials/StudentEssentialsPage';
import StudentEssentialDetail from './pages/StudentEssentials/StudentEssentialDetail';
import AddStudentEssential from './pages/StudentEssentials/AddStudentEssential';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/my-products" element={<MyProducts />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/sell" element={<SellProduct />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/products" element={<ProductManagement />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/student-essentials" element={<StudentEssentialsPage />} />
            <Route path="/student-essentials/:id" element={<StudentEssentialDetail />} />
            <Route path="/add-student-essential" element={<AddStudentEssential />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
