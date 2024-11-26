// src/components/Client/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient'; // Adjust the import path
import { Pie, Bar } from 'react-chartjs-2'; // Assuming you're using react-chartjs-2

interface FinancialData {
  income: number;
  expenditure: { category: string; amount: number }[];
  assets: number;
  liabilities: number;
}

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);

  useEffect(() => {
    const fetchFinancialData = async () => {
      const clientId = (await supabase.auth.getUser())?.data?.user?.id;

      if (!clientId) {
        console.error('No client ID found.');
        return;
      }

      const [
        { data: incomes, error: incomeError },
        { data: expenditures, error: expenditureError },
        { data: assets, error: assetError },
        { data: liabilities, error: liabilityError },
      ] = await Promise.all([
        supabase.from('incomes').select('amount').eq('client_id', clientId),
        supabase.from('expenditures').select('category, amount').eq('client_id', clientId),
        supabase.from('assets').select('value').eq('client_id', clientId),
        supabase.from('liabilities').select('amount').eq('client_id', clientId),
      ]);

      if (incomeError || expenditureError || assetError || liabilityError) {
        console.error('Error fetching financial data.');
        return;
      }

      const totalIncome = incomes?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0;
      const totalAssets = assets?.reduce((sum: number, item: any) => sum + item.value, 0) || 0;
      const totalLiabilities = liabilities?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0;

      setFinancialData({
        income: totalIncome,
        expenditure: expenditures || [],
        assets: totalAssets,
        liabilities: totalLiabilities,
      });
    };

    fetchFinancialData();
  }, []);

  if (!financialData) {
    return <div>Loading...</div>;
  }

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
        backgroundColor: ['#0077ff', '#00c49a', '#ffbb28', '#ff8042'],
      },
    ],
  };

  const assetsLiabilitiesChartData = {
    labels: ['Assets', 'Liabilities'],
    datasets: [
      {
        label: 'Assets vs. Liabilities',
        data: [financialData.assets, financialData.liabilities],
        backgroundColor: ['#00c49a', '#ff8042'],
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
          <p>Total Income: ${financialData.income.toFixed(2)}</p>
          <p>Total Expenditure: ${totalExpenditure.toFixed(2)}</p>
          <p>Remaining Income: ${remainingIncome.toFixed(2)}</p>
        </section>

        <section className="card">
          <h2>Expenditure Breakdown</h2>
          <Pie data={expenditureChartData} />
        </section>

        <section className="card">
          <h2>Assets and Liabilities</h2>
          <p>Total Assets: ${financialData.assets.toFixed(2)}</p>
          <p>Total Liabilities: ${financialData.liabilities.toFixed(2)}</p>
          <p>Net Worth: ${netWorth.toFixed(2)}</p>
          <Bar data={assetsLiabilitiesChartData} />
        </section>

        <section className="card">
          <h2>Actions</h2>
          <div className="flex justify-center">
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
