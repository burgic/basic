// src/App.tsx
import React, { useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { supabase } from './services/supabaseClient';
import './styles.css';

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
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="app-footer">
            <p>© {new Date().getFullYear()} AoV Report Analyzer. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;