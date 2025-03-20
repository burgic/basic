// src/App.tsx
import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import { supabase } from './services/supabaseClient';
import './styles.css';

// Lazy loaded components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ClientDashboard = lazy(() => import('./components/Client/ClientDashboard'));
const AdviserDashboard = lazy(() => import('./components/Admin/AdminDashboard'));

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

const App: React.FC = () => {
  useEffect(() => {
    // Test Supabase connection on app initialization
    async function testSupabaseConnection() {
      try {
        console.log("Testing Supabase connection...");
        const { data, error } = await supabase.from('profiles').select('count');
        
        if (error) {
          console.error("Connection test failed:", error);
          return false;
        }
        
        console.log("Connection successful:", data);
        return true;
      } catch (e) {
        console.error("Connection test exception:", e);
        return false;
      }
    }
    
    testSupabaseConnection();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Client routes */}
                <Route 
                  path="/client/*" 
                  element={
                    <ProtectedRoute requiredRole="client">
                      <Routes>
                        <Route path="dashboard" element={<ClientDashboard />} />
                        {/* Add more client routes here */}
                        <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
                      </Routes>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Adviser/Admin routes */}
                <Route 
                  path="/adviser/*" 
                  element={
                    <ProtectedRoute requiredRole="adviser">
                      <Routes>
                        <Route path="dashboard" element={<AdviserDashboard />} />
                        {/* Add more adviser routes here */}
                        <Route path="*" element={<Navigate to="/adviser/dashboard" replace />} />
                      </Routes>
                    </ProtectedRoute>
                  } 
                />
                
                
                
                {/* Redirect unknown routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <footer className="app-footer">
            <p>© {new Date().getFullYear()} Basic Webapp. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;