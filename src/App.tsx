// src/App.tsx
import React from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter as HashRouter, Routes, Route } from 'react-router-dom';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import Navbar from './components/Navbar';
import AdviserDashboard from './components/Adviser/Dashboard';
import CreateClient from './components/Adviser/CreateClient';
import ClientDashboard from './components/Client/Dashboard';
import { AuthProvider } from './context/AuthContext';
import IncomeForm from './components/Client/IncomeForm';
import ExpenditureForm from './components/Client/ExpenditureForm';
import AssetsForm from './components/Client/AssetsForm';
import LiabilitiesForm from './components/Client/LiabilitiesForm';
import GoalsForm from './components/Client/GoalsForm';
import ClientDetails from './components/Adviser/ClientDetails';
import './styles.css';


const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/adviser/dashboard" element={<ProtectedRoute requiredRole = "adviser"> <AdviserDashboard /> </ProtectedRoute>} />
          <Route path="/adviser/create-client" element={<ProtectedRoute requiredRole = "adviser"> <CreateClient /></ProtectedRoute>} />
          <Route path="/client/dashboard" element={<ProtectedRoute requiredRole = "client"><ClientDashboard /></ProtectedRoute>} />
          <Route
                path="/client/income"
                element={
                  <ProtectedRoute requiredRole="client">
                    <IncomeForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/expenditure"
                element={
                  <ProtectedRoute requiredRole="client">
                    <ExpenditureForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/assets"
                element={
                  <ProtectedRoute requiredRole="client">
                    <AssetsForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/liabilities"
                element={
                  <ProtectedRoute requiredRole="client">
                    <LiabilitiesForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/goals"
                element={
                  <ProtectedRoute requiredRole="client">
                    <GoalsForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/adviser/client/:clientId"
                element={
                  <ProtectedRoute requiredRole="adviser">
                    <ClientDetails />
                  </ProtectedRoute>
                }
              />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
