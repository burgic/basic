import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { AuthContext } from '../../context/AuthContext';

interface FormEntry {
  id: string;
  client_id: string;
  [key: string]: any;
}

interface FinancialFormProps {
  formType: 'expenditures' | 'assets' | 'goals' | 'liabilities';
  nextRoute: string;
  stepNumber: number;
  fields: {
    name: string;
    type: 'text' | 'number' | 'select';
    label: string;
    options?: { value: string; label: string; }[];
  }[];
  defaultEntry: Record<string, any>;
}

const FinancialForm: React.FC<FinancialFormProps> = ({
  formType,
  nextRoute,
  stepNumber,
  fields,
  defaultEntry
}) => {
  const navigate = useNavigate();
  const { user } = React.useContext(AuthContext);
  const [entries, setEntries] = useState<FormEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.warn('No user found in AuthContext.');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from(formType)
          .select('*')
          .eq('client_id', user.id);

        if (error) {
          throw new Error(`Failed to fetch ${formType}: ${error.message}`);
        }

        if (data && data.length > 0) {
          setEntries(data);
        } else {
          setEntries([{ id: '', client_id: user.id, ...defaultEntry }]);
        }
      } catch (error) {
        console.error(`Error fetching ${formType}:`, error);
        alert(`Failed to load existing ${formType} data`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, formType, defaultEntry]);

  const handleChange = (index: number, field: string, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: value
    };
    setEntries(newEntries);
  };

  const handleAddEntry = () => {
    if (!user) {
      console.warn('No user found');
      return;
    }
    
    setEntries([...entries, { id: '', client_id: user.id, ...defaultEntry }]);
  };

  const calculateProgress = () => {
    const requiredFields = fields.length;
    const filledEntries = entries.filter(entry => 
      fields.every(field => entry[field.name] !== '' && entry[field.name] !== 0)
    );
    return (filledEntries.length / entries.length) * 100;
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('No user found');
      return;
    }

    setIsSaving(true);
    try {
      const validEntries = entries.filter(entry => 
        fields.every(field => entry[field.name] !== '')
      );
      
      // Handle existing entries
      const existingEntries = validEntries.filter(entry => entry.id);
      for (const entry of existingEntries) {
        const { error } = await supabase
          .from(formType)
          .update(entry)
          .eq('id', entry.id);

        if (error) throw error;
      }

      // Handle new entries
      const newEntries = validEntries
        .filter(entry => !entry.id)
        .map(({ id, ...entry }) => ({
          ...entry,
          client_id: user.id
        }));

      if (newEntries.length > 0) {
        const { error } = await supabase
          .from(formType)
          .insert(newEntries);

        if (error) throw error;
      }

      navigate(nextRoute);
    } catch (error) {
      console.error(`Error saving ${formType}:`, error);
      alert(`Failed to save ${formType} data. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-md">
        <div className="text-gray-300 text-center">Loading {formType} data...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-md">
      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-semibold text-gray-100">{formType.charAt(0).toUpperCase() + formType.slice(1)} Details</h1>
          <span className="text-sm text-gray-400">Step {stepNumber} of 4</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-400 text-right">
          {Math.round(calculateProgress())}% Complete
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={entry.id || index} className="space-y-2 p-4 bg-gray-700 rounded-lg">
            {fields.map(field => (
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={entry[field.name]}
                    onChange={(e) => handleChange(index, field.name, e.target.value)}
                    className="w-full px-4 py-2 bg-gray-600 text-gray-100 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={entry[field.name]}
                    onChange={(e) => handleChange(index, field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-full px-4 py-2 bg-gray-600 text-gray-100 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={handleAddEntry}
          className="px-4 py-2 text-sm font-medium bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500"
        >
          + Add Entry
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500"
          >
            Back
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
            {isSaving ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialForm;