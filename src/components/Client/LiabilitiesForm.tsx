// src/components/Client/LiabilitiesForm.tsx
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface LiabilityEntry {
  type: string;
  description: string;
  amount: number;
  interest_rate: number;
}

const LiabilitiesForm: React.FC = () => {
  const [liabilityEntries, setLiabilityEntries] = useState<LiabilityEntry[]>([
    { type: '', description: '', amount: 0, interest_rate: 0 },
  ]);

  const handleAddEntry = () => {
    setLiabilityEntries([
      ...liabilityEntries,
      { type: '', description: '', amount: 0, interest_rate: 0 },
    ]);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const entries = [...liabilityEntries];
    (entries[index] as any)[field] = value;
    setLiabilityEntries(entries);
  };

  const handleSubmit = async () => {
    const { data: user } = await supabase.auth.getUser();
    const clientId = user.user?.id;

    const { error } = await supabase.from('liabilities').insert(
      liabilityEntries.map((entry) => ({
        ...entry,
        client_id: clientId,
      }))
    );

    if (error) alert(error.message);
    else alert('Liabilities data submitted successfully!');
  };

  return (
    <div>
      <h2>Liabilities Details</h2>
      {liabilityEntries.map((entry, index) => (
        <div key={index}>
          <select
            value={entry.type}
            onChange={(e) => handleChange(index, 'type', e.target.value)}
          >
            <option value="">Select Liability Type</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Loan">Loan</option>
            <option value="Mortgage">Mortgage</option>
            <option value="Overdraft">Overdraft</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Description"
            value={entry.description}
            onChange={(e) => handleChange(index, 'description', e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={entry.amount}
            onChange={(e) => handleChange(index, 'amount', Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="Interest Rate (%)"
            value={entry.interest_rate}
            onChange={(e) => handleChange(index, 'interest_rate', Number(e.target.value))}
          />
        </div>
      ))}
      <button onClick={handleAddEntry}>Add Another Liability</button>
      <button onClick={handleSubmit}>Submit Liabilities Data</button>
    </div>
  );
};

export default LiabilitiesForm;
