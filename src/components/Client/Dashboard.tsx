// src/components/Client/Dashboard.tsx

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { Pie, Bar } from 'react-chartjs-2';
import { AuthContext } from '../../context/AuthContext';
import 'chart.js/auto';
import NetWorthCard from './Cards/NetWorthCard';

interface Income {
  id: string;
  client_id: string;
  type: string;
  amount: number;
  frequency: string;
}

interface FinancialData {
  income: number;
  expenditure: { category: string; amount: number }[];
  assets: number;
  liabilities: number;
  goals?: {
    id: string;
    goal: string;
    target_amount: number;
    time_horizon: number;
  }[];
}


const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, session } = useContext(AuthContext);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Dashboard mounted, user:', { 
      userId: user?.id,
      isAuthenticated: !!user 
    });

    const fetchFinancialData = async () => {
      if (!user || !session) {
        console.log('No user found in dashboard');
        setError('User not authenticated.');
        setLoading(false);
        console.warn('No user found in AuthContext.');
        return;
      }

      /*
      // Verify auth status before fetching
      const { data: { session: currentSession }, error: sessionError } = 
        await supabase.auth.getSession();

      if (sessionError || !currentSession) {
        console.error('Session verification failed:', sessionError);
        setError('Session expired');
        setLoading(false);
        return;
      }
        */

      console.log('Starting financial data fetch for user:', user.id);
      
      try {
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
          
        console.log('Profile test query:', {
          success: !testError,
          hasProfile: !!testData,
          error: testError?.message
        });
      } catch (e) {
        console.error('Profile test failed:', e);
      }

      // Insert the new code here
      try {
        // Fetch incomes with proper type casting and null checks
        const { data: incomesData, error: incomesError } = await supabase
          .from('incomes')
          .select('*')
          .eq('client_id', user.id);

        console.log('Incomes fetch result:', { 
          success: !incomesError, 
          count: incomesData?.length || 0 
        });

        if (incomesError) {
          throw new Error(`Failed to fetch incomes: ${incomesError.message}`);
        }

        // Fetch expenditures
        const { data: expendituresData, error: expendituresError } = await supabase
          .from('expenditures')
          .select('*')
          .eq('client_id', user.id);

        console.log('Expenditures fetch result:', { 
          success: !expendituresError, 
          count: expendituresData?.length || 0 
        });

        if (expendituresError) {
          throw new Error(`Failed to fetch expenditures: ${expendituresError.message}`);
        }

        // Calculate total income, properly handling monthly vs annual frequencies
        const totalIncome = (incomesData || []).reduce((sum, income: Income) => {
          const amount = Number(income.amount) || 0;
          return sum + (income.frequency === 'Monthly' ? amount * 12 : amount);
        }, 0);

        // Transform expenditure data
        const expenditures = (expendituresData || []).map(exp => ({
          category: exp.category,
          amount: Number(exp.amount) || 0
        }));

              // Fetch assets
          const { data: assetsData, error: assetsError } = await supabase
          .from('assets')
          .select('*')
          .eq('client_id', user.id);

        if (assetsError) throw new Error(`Failed to fetch assets: ${assetsError.message}`);

        // Fetch liabilities
        const { data: liabilitiesData, error: liabilitiesError } = await supabase
          .from('liabilities')
          .select('*')
          .eq('client_id', user.id);

        if (liabilitiesError) throw new Error(`Failed to fetch liabilities: ${liabilitiesError.message}`);

        const totalAssets = assetsData?.reduce((sum, asset) => sum + (asset.value || 0), 0) || 0;
        const totalLiabilities = liabilitiesData?.reduce((sum, liability) => sum + (liability.amount || 0), 0) || 0;
        
        const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('client_id', user.id);

        if (goalsError) throw new Error(`Failed to fetch goals: ${goalsError.message}`);


        // Update financial data state
        console.log('Setting financial data');
        setFinancialData({
          income: totalIncome,
          expenditure: expenditures,
          assets: totalAssets, // Add assets fetch when implementing that feature
          liabilities: totalLiabilities, // Add liabilities fetch when implementing that feature
          goals: goalsData || [] // Add the goals data here
        });

      } catch (err) {
        console.error('Error fetching financial data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch financial data');
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [user, session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading your financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <h3 className="text-red-800 font-medium">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

if (!financialData) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="mb-4">No financial data available.</p>
      <button
        onClick={() => navigate('/client/income')}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Income Data
      </button>
    </div>
  );
}


  const NoDataPrompt = ({ type, url }: { type: string, url: string }) => (
    <div className="p-4 border rounded">
      <p>No {type} data available. <Link to={url}>Click here to add your {type}</Link></p>
    </div>
  );
  const totalExpenditure = financialData.expenditure.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const remainingIncome = financialData.income - totalExpenditure;
  const netWorth = financialData.assets - financialData.liabilities;

  const expenditureChartData = {
    labels: financialData.expenditure.map((item) => item.category),
    datasets: [
      {
        label: 'Expenditure by Category',
        data: financialData.expenditure.map((item) => item.amount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  const assetsLiabilitiesChartData = {
    labels: ['Assets', 'Liabilities'],
    datasets: [
      {
        label: 'Assets vs. Liabilities',
        data: [financialData.assets, financialData.liabilities],
        backgroundColor: ['#4BC0C0', '#FF6384'],
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Your Financial Dashboard</h1>
      </header>

      <div className="space-y-6">
    <NetWorthCard 
      assets={financialData.assets}
      liabilities={financialData.liabilities}
    />
      </div>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Income Overview</h2>
          <div className="space-y-2">
            <p>Annual Income: £{financialData.income.toLocaleString()}</p>
            <p>Monthly Average: £{(financialData.income / 12).toLocaleString()}</p>
          </div>
        </section>

        <section className="card">
          <h2>Expenditure Breakdown</h2>
          {financialData?.expenditure.length > 0 ? (
            <Pie data={expenditureChartData} />
          ) : (
            <NoDataPrompt type="expenditure" url="/client/expenditure" />
          )}
        </section>

        <section className="card">
          <h2>Assets and Liabilities</h2>
          {financialData.assets > 0 || financialData?.liabilities > 0 ? (
            <>
              <p><strong>Total Assets:</strong> £{financialData.assets.toFixed(2)}</p>
              <p><strong>Total Liabilities:</strong> £{financialData.liabilities.toFixed(2)}</p>
              <p><strong>Net Worth:</strong> £{netWorth.toFixed(2)}</p>
              <Bar data={assetsLiabilitiesChartData} />
            </>
          ) : (
            <div>
              <NoDataPrompt type="assets" url="/client/assets" />
              <NoDataPrompt type="liabilities" url="/client/liabilities" />
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Financial Goals</h2>
          {financialData?.goals && financialData.goals.length > 0 ? (
            <div className="space-y-4">
              {financialData.goals.map((goal, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-gray-500">Goal</p>
                      <p className="text-lg font-medium">{goal.goal}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Target Amount</p>
                      <p className="text-lg font-medium">£{goal.target_amount.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Time Horizon</p>
                      <p className="text-lg font-medium">{goal.time_horizon} years</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't set any financial goals yet</p>
              <Link 
                to="/client/goals" 
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Set Your Goals
              </Link>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Actions</h2>
          <div className="flex justify-center gap-10">
            <button onClick={() => navigate('/client/income')}>Update Income</button>
            <button onClick={() => navigate('/client/expenditure')}>Update Expenditure</button>
            <button onClick={() => navigate('/client/assets')}>Update Assets</button>
            <button onClick={() => navigate('/client/liabilities')}>Update Liabilities</button>
            <button onClick={() => navigate('/client/goals')}>Set Goals</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ClientDashboard;
