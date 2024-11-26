// src/components/Client/IncomeForm.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

interface IncomeEntry {
  type: string;
  amount: number;
  frequency: string;
}

// Fetch existing incomes in useEffect
useEffect(() => {
    const fetchIncomes = async () => {
    const { data: user } = await supabase.auth.getUser();
    const clientId = user.user?.id;

    const { data, error } = await supabase.from('incomes').select('*').eq('client_id', clientId);
    if (error) console.error(error);
    else setIncomeEntries(data || []);
    };

    fetchIncomes();
}, []);


const IncomeForm: React.FC = () => {
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([
    { type: '', amount: 0, frequency: '' },
  ]);

  const handleAddEntry = () => {
    setIncomeEntries([...incomeEntries, { type: '', amount: 0, frequency: '' }]);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const entries = [...incomeEntries];
    (entries[index] as any)[field] = value;
    setIncomeEntries(entries);
  };

  const handleSubmit = async () => {
    const { data: user } = await supabase.auth.getUser();
    const clientId = user.user?.id;
  
    for (const entry of incomeEntries) {
      if (entry.id) {
        // Update existing entry
        await supabase.from('incomes').update(entry).eq('id', entry.id);
      } else {
        // Insert new entry
        await supabase.from('incomes').insert({ ...entry, client_id: clientId });
      }
    }
    if (Error) alert(Error.message);
    else alert('Income data submitted successfully!');
  };

  // Handler function
    const handleDeleteEntry = async (index: number) => {
        const entries = [...incomeEntries];
        const entry = entries[index];
    
        if (entry.id) {
        // Delete from database
        await supabase.from('incomes').delete().eq('id', entry.id);
        }
    
        entries.splice(index, 1);
        setIncomeEntries(entries);
    };

  return (
    <div>
      <h2>Income Details</h2>
      {incomeEntries.map((entry, index) => (
        <div key={index}>
          <select
            value={entry.type}
            onChange={(e) => handleChange(index, 'type', e.target.value)}
          >
            <option value="">Select Income Type</option>
            <option value="Salary">Salary</option>
            <option value="Rental Income">Rental Income</option>
            <option value="Investments">Investments</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={entry.amount}
            onChange={(e) => handleChange(index, 'amount', Number(e.target.value))}
          />
          <select
            value={entry.frequency}
            onChange={(e) => handleChange(index, 'frequency', e.target.value)}
          >
            <option value="">Select Frequency</option>
            <option value="Monthly">Monthly</option>
            <option value="Annually">Annually</option>
          </select>
        </div>
      ))}
      <button onClick={handleAddEntry}>Add Another Income Source</button>
      <button onClick={handleSubmit}>Submit Income Data</button>
      <button onClick={() => handleDeleteEntry(index)}>Delete</button>
    </div>
  );
};

export default IncomeForm;
