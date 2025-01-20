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
