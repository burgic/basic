import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { financialCalculations } from '../../utils/financialcalculations';
import type { Income, Expenditure, Asset, Liability, Goal, Profile, ClientData } from '../../@types/financial';


const EnhancedClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ClientData>({
    profile: null,
    incomes: [] as Income[],
    expenditures: [] as Expenditure[],
    assets: [] as Asset[],
    liabilities: [] as Liability[],
    goals: [] as Goal[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) {
        setError('No client ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const [
          { data: profile },
          { data: incomes },
          { data: expenditures },
          { data: assets },
          { data: liabilities },
          { data: goals },
          { data: kycData }
        ] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', clientId).single(),
          supabase.from('incomes').select('*').eq('client_id', clientId),
          supabase.from('expenditures').select('*').eq('client_id', clientId),
          supabase.from('assets').select('*').eq('client_id', clientId),
          supabase.from('liabilities').select('*').eq('client_id', clientId),
          supabase.from('goals').select('*').eq('client_id', clientId),
          supabase.from('kyc_data').select('*').eq('profile_id', clientId).single()
        ]);

        setData({
          profile: profile ? { ...profile, kyc: kycData } as Profile : null,
          incomes: incomes as Income[] || [],
          expenditures: expenditures as Expenditure[] || [],
          assets: assets as Asset[] || [],
          liabilities: liabilities as Liability[] || [],
          goals: goals as Goal[] || []
        });
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-medium">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const financialSummary = financialCalculations.calculateFinancialSummary({
    incomes: data.incomes,
    expenditures: data.expenditures,
    assets: data.assets,
    liabilities: data.liabilities,
    goals: data.goals
  });

  const incomeChartData = {
    labels: data.incomes.map(inc => inc.type),
    datasets: [{
      data: data.incomes.map(inc => inc.amount),
      backgroundColor: [
        '#4BC0C0', '#36A2EB', '#FFCE56', '#FF6384', '#9966FF'
      ]
    }]
  };

  const expenditureChartData = {
    labels: data.expenditures.map(exp => exp.category),
    datasets: [{
      data: data.expenditures.map(exp => exp.amount),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
      ]
    }]
  };

  const assetsLiabilitiesData = {
    labels: ['Assets', 'Liabilities'],
    datasets: [{
      data: [financialSummary.totalAssets, financialSummary.totalLiabilities],
      backgroundColor: ['#4BC0C0', '#FF6384']
    }]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Client Profile Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold mb-4">{data.profile?.name}</h2>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/adviser/client/${clientId}/insights`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Insights
            </button>
            <button
              onClick={() => navigate(`/adviser/client/${clientId}/reports`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Reports
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Email:</span> {data.profile?.email}</p>
            <p><span className="font-medium">Date of Birth:</span> {data.profile?.kyc?.date_of_birth}</p>
            <p><span className="font-medium">Phone:</span> {data.profile?.kyc?.phone_number}</p>
          </div>
          <div>
            <p><span className="font-medium">Address:</span></p>
            <p>{data.profile?.kyc?.address_line1}</p>
            <p>{data.profile?.kyc?.address_line2}</p>
            <p>{data.profile?.kyc?.city}, {data.profile?.kyc?.postal_code}</p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
          <p className="text-2xl font-bold text-green-600">
            {financialCalculations.formatCurrency(financialSummary.monthlyIncome)}
          </p>
          <p className="text-sm text-gray-600">Monthly Income</p>
          <p className="text-2xl font-bold text-red-600 mt-4">
            {financialCalculations.formatCurrency(financialSummary.monthlyExpenditure)}
          </p>
          <p className="text-sm text-gray-600">Monthly Expenditure</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Net Worth</h3>
          <p className="text-2xl font-bold">
            {financialCalculations.formatCurrency(financialSummary.netWorth)}
          </p>
          <div className="mt-4">
            <Bar data={assetsLiabilitiesData} options={{ plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Goals Progress</h3>
          <div className="space-y-4">
            {data.goals.map((goal, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{goal.goal}</span>
                  <span>{financialCalculations.formatCurrency(goal.target_amount)}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-blue-500 rounded" style={{ width: '30%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Income Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Income Sources</h3>
          <div className="h-64 flex justify-center items-center">
            <Pie data={incomeChartData} />
          </div>
          <div className="mt-4 max-h-48 overflow-y-auto">
            {data.incomes.map((income, index) => (
              <div key={index} className="flex justify-between py-2 border-b">
                <span>{income.type}</span>
                <span>
                  {financialCalculations.formatCurrency(income.amount)}
                  <span className="text-gray-500 text-sm ml-2">
                    ({income.frequency})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenditure Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Expenditure Categories</h3>
          <div className="h-64 flex justify-center items-center">
            <Pie data={expenditureChartData} />
          </div>
          <div className="mt-4 max-h-48 overflow-y-auto">
            {data.expenditures.map((exp, index) => (
              <div key={index} className="flex justify-between py-2 border-b">
                <span>{exp.category}</span>
                <span>
                  {financialCalculations.formatCurrency(exp.amount)}
                  <span className="text-gray-500 text-sm ml-2">
                    ({exp.frequency})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedClientDetails;
/*
// src/components/Adviser/ClientDetails.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useParams } from 'react-router-dom';

interface Income {
  id: string;           // Added 'id' property
  type: string;
  amount: number;
  frequency: string;
}

interface Expenditure {
  id: string;           // Added 'id' property
  category: string;
  amount: number;
  frequency: string;
}

interface Asset {
  id: string;           // Added 'id' property
  type: string;
  description: string;
  value: number;
}

interface Liability {
  id: string;           // Added 'id' property
  type: string;
  description: string;
  amount: number;
  interest_rate: number;
}

interface Goal {
  id: string;           // Added 'id' property
  goal: string;
  target_amount: number;
  time_horizon: number;
}

const ClientDetails: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) {
        setError('No client ID provided');
        setIsLoading(false);
        return;
      }
    try {
      const [
        { data: incomesData, error: incomesError },
        { data: expendituresData, error: expendituresError },
        { data: assetsData, error: assetsError },
        { data: liabilitiesData, error: liabilitiesError },
        { data: goalsData, error: goalsError },
      ] = await Promise.all([
        supabase.from('incomes').select('*').eq('client_id', clientId),
        supabase.from('expenditures').select('*').eq('client_id', clientId),
        supabase.from('assets').select('*').eq('client_id', clientId),
        supabase.from('liabilities').select('*').eq('client_id', clientId),
        supabase.from('goals').select('*').eq('client_id', clientId),
      ]);

      if (incomesError) console.error(incomesError);
      else setIncomes(incomesData || []);

      if (expendituresError) console.error(expendituresError);
      else setExpenditures(expendituresData || []);

      if (assetsError) console.error(assetsError);
      else setAssets(assetsData || []);

      if (liabilitiesError) console.error(liabilitiesError);
      else setLiabilities(liabilitiesData || []);

      if (goalsError) console.error(goalsError);
      else setGoals(goalsData || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

    fetchData();
  }, [clientId]);

  if (!clientId) {
    return <div className="p-4 text-red-600">No client ID provided</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading client data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <h2>Client Financial Data</h2>

      <h3>Income</h3>
      <ul>
        {incomes.map((income) => (
          <li key={income.id}>
            {income.type}: ${income.amount} ({income.frequency})
          </li>
        ))}
      </ul>

      <h3>Expenditures</h3>
      <ul>
        {expenditures.map((expenditure) => (
          <li key={expenditure.id}>
            {expenditure.category}: £{expenditure.amount} ({expenditure.frequency})
          </li>
        ))}
      </ul>

      <h3>Assets</h3>
      <ul>
        {assets.map((asset) => (
          <li key={asset.id}>
            {asset.type}: {asset.description} valued at £{asset.value}
          </li>
        ))}
      </ul>

      <h3>Liabilities</h3>
      <ul>
        {liabilities.map((liability) => (
          <li key={liability.id}>
            {liability.type}: {liability.description} amounting to £{liability.amount} at {liability.interest_rate}% interest
          </li>
        ))}
      </ul>

      <h3>Goals</h3>
      <ul>
        {goals.map((goal) => (
          <li key={goal.id}>
            {goal.goal}: Target of £{goal.target_amount} in {goal.time_horizon} years
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientDetails;
*/