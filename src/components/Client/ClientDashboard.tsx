// src/components/Client/ClientDashboard.tsx

import React, { useEffect, useState, useContext, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';



const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, session } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<Array<{ id: string; title: string; description: string; completed: boolean; path: string }>>([]); // Declare workflowSteps state



  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      try {
        // Example of fetching workflow steps - in a real app, these might come from the database
        // based on the client's progress
        setWorkflowSteps([
          {
            id: '1',
            title: 'Personal Information',
            description: 'Provide your basic details',
            completed: false,
            path: '/client/personal-info'
          },
          {
            id: '2',
            title: 'Financial Information',
            description: 'Add your income and expenses',
            completed: false,
            path: '/client/financial-info'
          },
          {
            id: '3',
            title: 'Document Upload',
            description: 'Upload required documents',
            completed: false,
            path: '/client/documents'
          },
          {
            id: '4',
            title: 'Review',
            description: 'Review and submit your information',
            completed: false,
            path: '/client/review'
          }
        ]);
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [user]);


  return (
    <div 
      className="bg-blue-600 h-2.5 rounded-full" 
      style={{ width: `${workflowSteps.length > 0 ? (workflowSteps.filter(step => step.completed).length / workflowSteps.length) * 100 : 0}%` }}
    >
      {workflowSteps.map((step, index) => (
        <div key={step.id}> {/* Ensure each child has a unique key */}
          <span>{index + 1}</span>
          <span>{step.title}</span>
          <span>{step.description}</span>
          <button
            onClick={() => navigate(step.path)}
            className={`mt-2 px-4 py-2 text-sm rounded ${
              step.completed
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {step.completed ? 'Edit' : 'Complete'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default ClientDashboard;