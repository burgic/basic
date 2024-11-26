// src/components/Client/Dashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Your Financial Overview</h1>
      <button onClick={() => navigate('/client/income')}>Update Income</button>
      <button onClick={() => navigate('/client/expenditure')}>Update Expenditure</button>
      <button onClick={() => navigate('/client/assets')}>Update Assets</button>
      <button onClick={() => navigate('/client/liabilities')}>Update Liabilities</button>
      <button onClick={() => navigate('/client/goals')}>Set Goals</button>
      {/* Additional code to display current financial summary */}
    </div>
  );
};

export default ClientDashboard;
