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

  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, [clientId]);

  return (
    <div>
      <h2>Client Financial Data</h2>

      <h3>Income</h3>
      <ul>
        {incomes.map((income) => (
          <li key={income.id}>
            {income.type}: {income.amount} ({income.frequency})
          </li>
        ))}
      </ul>

      {/* Similarly for Expenditures, Assets, Liabilities, and Goals */}
    </div>
  );
};

export default ClientDetails;
