import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';

// User pages
import UserDashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import Accounts from './pages/user/Accounts';
import Transactions from './pages/user/Transactions';
import Signature from './pages/user/Signature';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminAccounts from './pages/admin/AdminAccounts';

const LayoutWithNav = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="py-6">{children}</main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* User routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="user">
              <LayoutWithNav><UserDashboard /></LayoutWithNav>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute role="user">
              <LayoutWithNav><Profile /></LayoutWithNav>
            </ProtectedRoute>
          } />
          <Route path="/accounts" element={
            <ProtectedRoute role="user">
              <LayoutWithNav><Accounts /></LayoutWithNav>
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute role="user">
              <LayoutWithNav><Transactions /></LayoutWithNav>
            </ProtectedRoute>
          } />
          <Route path="/signature" element={
            <ProtectedRoute role="user">
              <LayoutWithNav><Signature /></LayoutWithNav>
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <LayoutWithNav><AdminDashboard /></LayoutWithNav>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute role="admin">
              <LayoutWithNav><AdminUsers /></LayoutWithNav>
            </ProtectedRoute>
          } />
          <Route path="/admin/users/:userId" element={
            <ProtectedRoute role="admin">
              <LayoutWithNav><AdminUserDetail /></LayoutWithNav>
            </ProtectedRoute>
          } />
          <Route path="/admin/transactions" element={
            <ProtectedRoute role="admin">
              <LayoutWithNav><AdminTransactions /></LayoutWithNav>
            </ProtectedRoute>
          } />
          <Route path="/admin/accounts" element={
            <ProtectedRoute role="admin">
              <LayoutWithNav><AdminAccounts /></LayoutWithNav>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
