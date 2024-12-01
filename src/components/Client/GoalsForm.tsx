import React from 'react';
import FinancialForm from './BaseForm';

const GoalsForm: React.FC = () => {
  return (
    <FinancialForm
      formType="goals"
      nextRoute="/client/dashboard"
      stepNumber={4}
      fields={[
        {
          name: 'goal',
          type: 'text',
          label: 'Goal Description'
        },
        {
          name: 'target_amount',
          type: 'number',
          label: 'Target Amount'
        },
        {
          name: 'time_horizon',
          type: 'number',
          label: 'Time Horizon (years)'
        }
      ]}
      defaultEntry={{
        goal: '',
        target_amount: 0,
        time_horizon: 0
      }}
    />
  );
};

export default GoalsForm;
