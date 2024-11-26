// src/components/Adviser/Dashboard.tsx
import React from 'react';
import ClientsList from './ClientList';
import { useNavigate } from 'react-router-dom';

const AdviserDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Adviser Dashboard</h1>
      <button onClick={() => navigate('/create-client')}>Add New Client</button>
      <ClientsList />
    </div>
  );
};

export default AdviserDashboard;
