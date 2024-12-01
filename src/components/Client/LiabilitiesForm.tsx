// LiabilitiesForm.tsx
import React from 'react';
import FinancialForm from './BaseForm';

const LiabilitiesForm: React.FC = () => {
  return (
    <FinancialForm
      formType="liabilities"
      nextRoute="/client/goals"
      stepNumber={3}
      fields={[
        {
          name: 'type',
          type: 'select',
          label: 'Liability Type',
          options: [
            { value: 'Credit Card', label: 'Credit Card' },
            { value: 'Loan', label: 'Loan' },
            { value: 'Mortgage', label: 'Mortgage' },
            { value: 'Overdraft', label: 'Overdraft' },
            { value: 'Other', label: 'Other' }
          ]
        },
        {
          name: 'description',
          type: 'text',
          label: 'Description'
        },
        {
          name: 'amount',
          type: 'number',
          label: 'Amount'
        },
        {
          name: 'interest_rate',
          type: 'number',
          label: 'Interest Rate (%)'
        }
      ]}
      defaultEntry={{
        type: '',
        description: '',
        amount: '',
        interest_rate: ''
      }}
    />
  );
};

export default LiabilitiesForm;