// IncomeForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const IncomeForm = () => {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState([
    { type: 'Salary', amount: '', frequency: 'Monthly' },
    { type: 'Investment', amount: '', frequency: 'Monthly' },
    { type: 'Rental', amount: '', frequency: 'Monthly' },
    { type: 'Business', amount: '', frequency: 'Monthly' },
    { type: 'Other', amount: '', frequency: 'Monthly' }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAmountChange = (index: number, value: string) => {
    const newIncomes = [...incomes];
    newIncomes[index].amount = value;
    setIncomes(newIncomes);
  };

  const handleFrequencyChange = (index: number, value: string) => {
    const newIncomes = [...incomes];
    newIncomes[index].frequency = value;
    setIncomes(newIncomes);
  };

  const calculateProgress = () => {
    const filledIncomes = incomes.filter(income => income.amount !== '');
    return (filledIncomes.length / incomes.length) * 100;
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    // Your supabase logic here
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated save
    setIsSaving(false);
    navigate('/expenditure'); // Navigate to expenditure form
  };

  return (
        <div className="w-full max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-gray-100 mb-6">Income Details</h1>

      {/* Form */}
      <div className="space-y-4">
        {incomes.map((income, index) => (
          <div key={income.type} className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {income.type} Income
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={income.amount}
                placeholder="Amount"
                onChange={(e) => handleAmountChange(index, e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <select
                value={income.frequency}
                onChange={(e) => handleFrequencyChange(index, e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Monthly">Monthly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500"
        >
          + Add Income Source
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSaving || calculateProgress() === 0}
          className={`px-6 py-2 text-sm font-medium rounded-lg focus:outline-none ${
            isSaving || calculateProgress() === 0
              ? "bg-gray-500 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-gray-100 hover:bg-blue-600"
          }`}
        >
          {isSaving ? "Saving..." : "Save Income Details"}
        </button>
      </div>
    </div>
  );
};

export default IncomeForm;


/*

import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

interface IncomeFormProps {
  onComplete?: () => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ onComplete }) => {
  const [incomeEntries, setIncomeEntries] = useState([
    { type: '', amount: 0, frequency: '' }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const clientId = user.user?.id;

      if (!clientId) {
        throw new Error('No user found');
      }

      const { error } = await supabase.from('incomes').insert(
        incomeEntries.map(entry => ({
          ...entry,
          client_id: clientId
        }))
      );

      if (error) throw error;
      
      // Call onComplete to move to next step
      if (onComplete) { 
        onComplete();
      }
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Failed to save income data');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {incomeEntries.map((entry, index) => (
        <div key={index} className="grid grid-cols-3 gap-4">
          <select
            value={entry.type}
            onChange={(e) => {
              const newEntries = [...incomeEntries];
              newEntries[index].type = e.target.value;
              setIncomeEntries(newEntries);
            }}
            className="rounded-lg border-gray-300"
          >
            <option value="">Select Type</option>
            <option value="Salary">Salary</option>
            <option value="Business">Business Income</option>
            <option value="Investment">Investment Income</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="number"
            value={entry.amount}
            onChange={(e) => {
              const newEntries = [...incomeEntries];
              newEntries[index].amount = Number(e.target.value);
              setIncomeEntries(newEntries);
            }}
            placeholder="Amount"
            className="rounded-lg border-gray-300"
          />

          <select
            value={entry.frequency}
            onChange={(e) => {
              const newEntries = [...incomeEntries];
              newEntries[index].frequency = e.target.value;
              setIncomeEntries(newEntries);
            }}
            className="rounded-lg border-gray-300"
          >
            <option value="">Select Frequency</option>
            <option value="Monthly">Monthly</option>
            <option value="Annual">Annual</option>
          </select>
        </div>
      ))}

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setIncomeEntries([...incomeEntries, { type: '', amount: 0, frequency: '' }])}
          className="text-blue-600 hover:text-blue-700"
        >
          + Add Another Income
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
};

export default IncomeForm;



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
    setIncomeEntries([...incomeEntries, { type: '', amount: 0, frequency: '' }]);
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
*/