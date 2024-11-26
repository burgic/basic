// src/components/Client/ExpenditureForm.tsx
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface ExpenditureEntry {
  category: string;
  amount: number;
  frequency: string;
}

const ExpenditureForm: React.FC = () => {
  const [expenditureEntries, setExpenditureEntries] = useState<ExpenditureEntry[]>([
    { category: '', amount: 0, frequency: '' },
  ]);

  const handleAddEntry = () => {
    setExpenditureEntries([
      ...expenditureEntries,
      { category: '', amount: 0, frequency: '' },
    ]);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const entries = [...expenditureEntries];
    (entries[index] as any)[field] = value;
    setExpenditureEntries(entries);
  };

  const handleSubmit = async () => {
    const { data: user } = await supabase.auth.getUser();
    const clientId = user.user?.id;

    const { error } = await supabase.from('expenditures').insert(
      expenditureEntries.map((entry) => ({
        ...entry,
        client_id: clientId,
      }))
    );

    if (error) alert(error.message);
    else alert('Expenditure data submitted successfully!');
  };

  return (
    <div>
      <h2>Expenditure Details</h2>
      {expenditureEntries.map((entry, index) => (
        <div key={index}>
          <select
            value={entry.category}
            onChange={(e) => handleChange(index, 'category', e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Rent/Mortgage">Rent/Mortgage</option>
            <option value="Utilities">Utilities</option>
            <option value="Groceries">Groceries</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
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
      <button onClick={handleAddEntry}>Add Another Expenditure</button>
      <button onClick={handleSubmit}>Submit Expenditure Data</button>
    </div>
  );
};

export default ExpenditureForm;
