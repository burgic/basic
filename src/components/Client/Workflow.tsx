/*
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IncomeForm from './IncomeForm';
import ExpenditureForm from './ExpenditureForm';
import AssetsForm from './AssetsForm';
import LiabilitiesForm from './LiabilitiesForm';
import GoalsForm from './GoalsForm';

const FinancialWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: 'Income', description: 'Enter your sources of income' },
    { id: 2, title: 'Expenditure', description: 'Detail your regular expenses' },
    { id: 3, title: 'Assets', description: 'List your valuable assets' },
    { id: 4, title: 'Liabilities', description: 'Record any debts or loans' },
    { id: 5, title: 'Goals', description: 'Set your financial goals' }
  ];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 1:
        return <IncomeForm onComplete={() => setCurrentStep(2)} />;
      case 2:
        return <ExpenditureForm onComplete={() => setCurrentStep(3)} />;
      case 3:
        return <AssetsForm onComplete={() => setCurrentStep(4)} />;
      case 4:
        return <LiabilitiesForm onComplete={() => setCurrentStep(5)} />;
      case 5:
        return <GoalsForm onComplete={() => navigate('/dashboard')} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step) => (
              <div 
                key={step.id} 
                className={`flex-1 text-center ${
                  currentStep === step.id ? 'text-blue-600' : 
                  currentStep > step.id ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  <div 
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${
                      currentStep === step.id ? 'border-blue-600 bg-blue-50' :
                      currentStep > step.id ? 'border-green-600 bg-green-50' : 'border-gray-300'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm font-medium">{step.title}</div>
              </div>
            ))}
          </div>
      
          <div className="relative pt-4">
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded">
              <div 
                className="h-full bg-blue-600 rounded transition-all duration-500" 
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

 
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-gray-600 mb-6">
            {steps[currentStep - 1].description}
          </p>
          {renderStepContent(currentStep)}
        </div>

  
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialWorkflow;

*/