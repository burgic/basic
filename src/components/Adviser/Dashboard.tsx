// src/components/Adviser/Dashboard.tsx
import React from 'react';
// import ClientsList from './ClientList';
import { useNavigate } from 'react-router-dom';


const AdviserDashboard: React.FC = () => {
  const navigate = useNavigate();


  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Adviser Dashboard
            </h1>
            <button
              onClick={() => navigate('/adviser/create-client')}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Add New Client
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Your dashboard content here */}
      </main>
    </div>
  );
};

export default AdviserDashboard;