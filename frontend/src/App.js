import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './components/ui/globals.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ContactDetail from './pages/ContactDetail';
import AddContact from './pages/AddContact';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 14, color: '#6B7280' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/contacts" replace /> : children;
}

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? '/contacts' : '/login'} replace />;
}

export default function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login"         element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register"      element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/contacts"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/contacts/:id"  element={<PrivateRoute><ContactDetail /></PrivateRoute>} />
            <Route path="/add-contact"   element={<PrivateRoute><AddContact /></PrivateRoute>} />
            <Route path="/profile"       element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="*"              element={<RootRedirect />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
  );
}