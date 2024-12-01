/*
// src/components/Client/AssetsForm.tsx
import React, { useState } from 'react';
import { BaseFormProps } from '../../@types/forms';

interface AssetEntry {

  type: string;
  description: string;
  value: number;
}

const AssetsForm: React.FC<BaseFormProps> = ({ onComplete }) => {
  const [assetEntries, setAssetEntries] = useState<AssetEntry[]>([
    { type: '', description: '', value: 0 }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // Here you would typically save the data
      await new Promise(resolve => setTimeout(resolve, 1000));
      onComplete();
    } catch (error) {
      console.error('Error saving assets:', error);
      alert('Failed to save asset data');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {assetEntries.map((entry, index) => (
        <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={entry.type}
              onChange={(e) => {
                const newEntries = [...assetEntries];
                newEntries[index].type = e.target.value;
                setAssetEntries(newEntries);
              }}
              className="rounded-lg border-gray-300"
            >
              <option value="">Select Asset Type</option>
              <option value="Property">Property</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Investment">Investment</option>
              <option value="Savings">Savings</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="text"
              value={entry.description}
              onChange={(e) => {
                const newEntries = [...assetEntries];
                newEntries[index].description = e.target.value;
                setAssetEntries(newEntries);
              }}
              placeholder="Description"
              className="rounded-lg border-gray-300"
            />

            <input
              type="number"
              value={entry.value}
              onChange={(e) => {
                const newEntries = [...assetEntries];
                newEntries[index].value = Number(e.target.value);
                setAssetEntries(newEntries);
              }}
              placeholder="Value"
              className="rounded-lg border-gray-300"
            />
          </div>
        </div>
      ))}

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setAssetEntries([...assetEntries, { type: '', description: '', value: 0 }])}
          className="text-blue-600 hover:text-blue-700"
        >
          + Add Another Asset
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

export default AssetsForm;

*/

import React from 'react';
import FinancialForm from './BaseForm';

const AssetsForm: React.FC = () => {
  return (
    <FinancialForm
      formType="assets"
      nextRoute="/client/liabilities"
      stepNumber={3}
      fields={[
        {
          name: 'type',
          type: 'select',
          label: 'Asset Type',
          options: [
            { value: 'Property', label: 'Property' },
            { value: 'Investments', label: 'Investments' },
            { value: 'ISA', label: 'ISA' },
            { value: 'Savings', label: 'Savings' },
            { value: 'Other', label: 'Other' }
          ]
        },
        {
          name: 'description',
          type: 'text',
          label: 'Description'
        },
        {
          name: 'value',
          type: 'number',
          label: 'Value'
        }
      ]}
      defaultEntry={{
        type: '',
        description: '',
        value: ''
      }}
    />
  );
};

export default AssetsForm;