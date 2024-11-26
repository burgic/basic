// src/components/Client/AssetsForm.tsx
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface AssetEntry {
  type: string;
  description: string;
  value: number;
}

const AssetsForm: React.FC = () => {
  const [assetEntries, setAssetEntries] = useState<AssetEntry[]>([
    { type: '', description: '', value: 0 },
  ]);

  const handleAddEntry = () => {
    setAssetEntries([...assetEntries, { type: '', description: '', value: 0 }]);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const entries = [...assetEntries];
    (entries[index] as any)[field] = value;
    setAssetEntries(entries);
  };

  const handleSubmit = async () => {
    const { data: user } = await supabase.auth.getUser();
    const clientId = user.user?.id;

    const { error } = await supabase.from('assets').insert(
      assetEntries.map((entry) => ({
        ...entry,
        client_id: clientId,
      }))
    );

    if (error) alert(error.message);
    else alert('Assets data submitted successfully!');
  };

  return (
    <div>
      <h2>Assets Details</h2>
      {assetEntries.map((entry, index) => (
        <div key={index}>
          <select
            value={entry.type}
            onChange={(e) => handleChange(index, 'type', e.target.value)}
          >
            <option value="">Select Asset Type</option>
            <option value="Property">Property</option>
            <option value="Investments">Investments</option>
            <option value="ISA">ISA</option>
            <option value="Savings">Savings</option>
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
            placeholder="Value"
            value={entry.value}
            onChange={(e) => handleChange(index, 'value', Number(e.target.value))}
          />
        </div>
      ))}
      <button onClick={handleAddEntry}>Add Another Asset</button>
      <button onClick={handleSubmit}>Submit Assets Data</button>
    </div>
  );
};

export default AssetsForm;
