// src/components/Client/Dashboard.tsx

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { Pie, Bar } from 'react-chartjs-2';
import { AuthContext } from '../../context/AuthContext';
import 'chart.js/auto';

interface FinancialData {
  income: number;
  expenditure: { category: string; amount: number }[];
  assets: number;
  liabilities: number;
}

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Fetching financial data...');
    const fetchFinancialData = async () => {
      if (!user) {
        setError('User not authenticated.');
        setLoading(false);
        console.warn('No user found in AuthContext.');
        return;
      }

      const clientId = user.id;
      console.log(`Fetching data for client ID: ${clientId}`);

      try {
        const [incomesRes, expendituresRes, assetsRes, liabilitiesRes] = await Promise.all([
          supabase.from('incomes').select('amount').eq('client_id', clientId),
          supabase.from('expenditures').select('category, amount').eq('client_id', clientId),
          supabase.from('assets').select('value').eq('client_id', clientId),
          supabase.from('liabilities').select('amount').eq('client_id', clientId),
        ]);

        console.log('Supabase responses:', incomesRes, expendituresRes, assetsRes, liabilitiesRes);

        if (incomesRes.error || expendituresRes.error || assetsRes.error || liabilitiesRes.error) {
          console.error('Error fetching financial data:', incomesRes.error, expendituresRes.error, assetsRes.error, liabilitiesRes.error);
          throw new Error('Error fetching financial data.');
        }

        const totalIncome = incomesRes.data?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0;
        const totalAssets = assetsRes.data?.reduce((sum: number, item: any) => sum + item.value, 0) || 0;
        const totalLiabilities = liabilitiesRes.data?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0;

        setFinancialData({
          income: totalIncome,
          expenditure: expendituresRes.data || [],
          assets: totalAssets,
          liabilities: totalLiabilities,
        });

        console.log('Financial Data Set:', {
          income: totalIncome,
          expenditure: expendituresRes.data,
          assets: totalAssets,
          liabilities: totalLiabilities,
        });

        setLoading(false);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to fetch financial data.');
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [user]);

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="container"><p>Error: {error}</p></div>;
  }

  if (!financialData) {
    return <div className="container"><p>No financial data available.</p></div>;
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
    <div className="container">
      <header>
        <h1>Your Financial Dashboard</h1>
      </header>

      <main className="flex flex-column align-center">
        <section className="card">
        <h2>Income vs. Expenditure</h2>
          {financialData?.income ? (
            <>
              <p><strong>Total Income:</strong> ${financialData.income.toFixed(2)}</p>
              <p><strong>Total Expenditure:</strong> ${totalExpenditure.toFixed(2)}</p>
              <p><strong>Remaining Income:</strong> ${remainingIncome.toFixed(2)}</p>
            </>
          ) : (
            <NoDataPrompt type="income" url="/client/income" />
          )}
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
          {financialData?.assets || financialData?.liabilities ? (
            <>
              <p><strong>Total Assets:</strong> ${financialData.assets.toFixed(2)}</p>
              <p><strong>Total Liabilities:</strong> ${financialData.liabilities.toFixed(2)}</p>
              <p><strong>Net Worth:</strong> ${netWorth.toFixed(2)}</p>
              <Bar data={assetsLiabilitiesChartData} />
            </>
          ) : (
            <div>
              <NoDataPrompt type="assets" url="/client/assets" />
              <NoDataPrompt type="liabilities" url="/client/liabilities" />
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
