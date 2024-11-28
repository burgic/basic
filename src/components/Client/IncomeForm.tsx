// src/components/Client/IncomeForm.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

interface IncomeEntry {
    id?: string;
  type: string;
  amount: number;
  frequency: string;
}

const IncomeForm: React.FC = () => {
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);

  // Fetch existing incomes in useEffect
useEffect(() => {
    const fetchIncomes = async () => {
      const { data: user } = await supabase.auth.getUser();
      const clientId = user.user?.id;

      const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('client_id', clientId);

    if (error) console.error(error);
    else setIncomeEntries(data || []);
    };

    fetchIncomes();
}, []);

  const handleAddEntry = () => {
    setIncomeEntries([...incomeEntries, { id: '', type: '', amount: 0, frequency: '' }]);
  };

  const handleChange = (index: number, field: keyof IncomeEntry, value: any) => {
    const updatedEntries = incomeEntries.map((entry, i) => {
      if (i === index) {
        return { ...entry, [field]: value };
      }
      return entry;
    });
    setIncomeEntries(updatedEntries);
  };

  const handleSubmit = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const clientId = userData?.user?.id;
  
    if (!clientId) {
      alert('User not authenticated');
      return;
    }
  
    try {
    for (const entry of incomeEntries) {
      if (entry.id) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('incomes')
          .update({
            type: entry.type,
            amount: entry.amount,
            frequency: entry.frequency,
          })
          .eq('id', entry.id);
  
        if (updateError) throw updateError;
      } else {
        // Insert new entry
        const { error: insertError } = await supabase
        .from('incomes')
        .insert({
          ...entry,
          client_id: clientId,
          type: entry.type,
          amount: entry.amount,
          frequency: entry.frequency
        });
  
        if (insertError) throw insertError;
        }
    }
    alert('Income data submitted successfully!');
  } catch (error: any) {
    alert(`Error saving income data: ${error.message}`);
  }
};
    const handleDeleteEntry = async (index: number) => {
      const entry = incomeEntries[index];

      try {
          if (entry.id) {
              const { error } = await supabase
                  .from('incomes')
                  .delete()
                  .eq('id', entry.id);

              if (error) throw error;
          }

          setIncomeEntries(incomeEntries.filter((_, i) => i !== index));
      } catch (error: any) {
          alert(`Error deleting entry: ${error.message}`);
      }
    };

    const isValidEntry = (entry: IncomeEntry) => {
      return entry.type && entry.amount > 0 && entry.frequency;
    };


    return (
      <div className="space-y-4">
          <h2 className="text-xl font-semibold">Income Details</h2>
          {incomeEntries.map((entry, index) => (
              <div key={entry.id || index} className="flex space-x-4">
                  <select
                      value={entry.type}
                      onChange={(e) => handleChange(index, 'type', e.target.value)}
                      className="border rounded p-2"
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
                      className="border rounded p-2"
                      min="0"
                  />
                  <select
                      value={entry.frequency}
                      onChange={(e) => handleChange(index, 'frequency', e.target.value)}
                      className="border rounded p-2"
                  >
                      <option value="">Select Frequency</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Annually">Annually</option>
                  </select>
                  <button
                      onClick={() => handleDeleteEntry(index)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                      Delete
                  </button>
              </div>
          ))}
          <div className="space-x-4">
              <button
                  onClick={handleAddEntry}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                  Add Another Income Source
              </button>
              <button
                  onClick={handleSubmit}
                  disabled={!incomeEntries.every(isValidEntry)}
                  className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                  Submit Income Data
              </button>
            </div>
        </div>
    );
  };

  export default IncomeForm;
