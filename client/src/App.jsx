// client/src/App.jsx
import React from 'react';
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import CustomerDashboard from './Pages/CustomerDashboard';
import AgentDashboard from './Pages/AgentDashboard';
import TicketDetailsPage from './Pages/TicketDetailsPage';


/**
 * Protected route for authenticated users
 */
function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * Main App component with routing
 */
function AppRoutes() {
  const { isAuthenticated, isAgent, isCustomer } = useAuth();

  return (
    <Routes>
      {/* Home route - shows HomePage if not authenticated */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            isAgent ? (
              <Navigate to="/agent" />
            ) : (
              <Navigate to="/customer" />
            )
          ) : (
            <HomePage />
          )
        }
      />

      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />}
      />

      {/* Customer routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Agent routes */}
      <Route
        path="/agent"
        element={
          <ProtectedRoute requiredRole="agent">
            <AgentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Ticket details (accessible to both roles) */}
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <TicketDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* 404 - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

/**
 * Root App component
 */
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}