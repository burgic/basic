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
    <div className="w-full max-w-3xl mx-auto p-4 space-y-6 bg-gray-50 rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Income Details</span>
          <span className="text-sm text-gray-600">Step 1 of 4</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {incomes.map((income, index) => (
          <div key={income.type} className="p-4 bg-white rounded-lg shadow">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {income.type} Income
            </label>
            <div className="flex gap-4">
              <div className="relative w-2/3">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={income.amount}
                    onChange={(e) => handleAmountChange(index, e.target.value)}
                    className="block w-full px-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={income.frequency}
                onChange={(e) => handleFrequencyChange(index, e.target.value)}
                className="block w-1/3 rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Monthly">Monthly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSaving || calculateProgress() === 0}
          className={`
            px-6 py-2 rounded-md text-white font-medium
            ${isSaving || calculateProgress() === 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          {isSaving ? 'Saving...' : 'Continue to Expenditure'}
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