// src/components/Adviser/Dashboard.tsx
import React from 'react';
import ClientsList from './ClientList';
import { useNavigate } from 'react-router-dom';


const AdviserDashboard: React.FC = () => {
  const navigate = useNavigate();


  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Adviser Dashboard</h1>
        <button
          onClick={() => navigate('/adviser/create-client')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New Client
        </button>
      </div>
      
      <div>
      <button onClick={() => navigate('/create-client')} 
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Add New Client</button>
      <ClientsList />
    </div>
    
    </div>
  );
};

export default AdviserDashboard;
