// src/components/Adviser/ClientDetails.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useParams } from 'react-router-dom';

interface Income {
  type: string;
  amount: number;
  frequency: string;
}

interface Expenditure {
  category: string;
  amount: number;
  frequency: string;
}

interface Asset {
  type: string;
  description: string;
  value: number;
}

interface Liability {
  type: string;
  description: string;
  amount: number;
  interest_rate: number;
}

interface Goal {
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
      const [{ data: incomes }, { data: expenditures }, { data: assets }, { data: liabilities }, { data: goals }] =
        await Promise.all([
          supabase.from('incomes').select('*').eq('client_id', clientId),
          supabase.from('expenditures').select('*').eq('client_id', clientId),
          supabase.from('assets').select('*').eq('client_id', clientId),
          supabase.from('liabilities').select('*').eq('client_id', clientId),
          supabase.from('goals').select('*').eq('client_id', clientId),
        ]);

      setIncomes(incomes || []);
      setExpenditures(expenditures || []);
      setAssets(assets || []);
      setLiabilities(liabilities || []);
      setGoals(goals || []);
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

      <h3>Expenditure</h3>
      <ul>
        {expenditures.map((expense) => (
          <li key={expense.id}>
            {expense.category}: {expense.amount} ({expense.frequency})
          </li>
        ))}
      </ul>

      <h3>Assets</h3>
      <ul>
        {assets.map((asset) => (
          <li key={asset.id}>
            {asset.type} ({asset.description}): {asset.value}
          </li>
        ))}
      </ul>

      <h3>Liabilities</h3>
      <ul>
        {liabilities.map((liability) => (
          <li key={liability.id}>
            {liability.type} ({liability.description}): {liability.amount} at {liability.interest_rate}%
          </li>
        ))}
      </ul>

      <h3>Goals</h3>
      <ul>
        {goals.map((goal) => (
          <li key={goal.id}>
            {goal.goal}: Target of {goal.target_amount} in {goal.time_horizon} years
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientDetails;
