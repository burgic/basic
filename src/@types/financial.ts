// src/types/financial.ts

export interface FormFields {
    // Goals fields
    retirement_age: string | number;
    planned_expenditures: string;
    retirement_type: string;
    time_horizon: string | number;
    
    // Assets fields
    type: string;
    description: string;
    value: number;
    
    // Liabilities fields
    amount: number;
    interest_rate: number;
    
    // Expenditure fields
    category: string;
    frequency: string;
  }
  
  export type FormFieldName = keyof FormFields;
  
  export interface FormField {
    name: FormFieldName;
    type: 'text' | 'number' | 'select';
    label: string;
    options?: { value: string; label: string }[];
  }
  
  // Update other interfaces to use these field names
  export interface BaseEntry {
    id: string;
    client_id: string;
  }
  
  export interface GoalEntry extends BaseEntry {
    retirement_age: number;
    planned_expenditures: string;
    retirement_type: string;
    time_horizon: number;
  }
  
  export interface AssetEntry extends BaseEntry {
    type: string;
    description: string;
    value: number;
  }
  
  export interface LiabilityEntry extends BaseEntry {
    type: string;
    description: string;
    amount: number;
    interest_rate: number;
  }
  
  export interface ExpenditureEntry extends BaseEntry {
    category: string;
    amount: number;
    frequency: string;
  }
  
  export type FormEntry = GoalEntry | AssetEntry | LiabilityEntry | ExpenditureEntry;
  
  export interface FinancialData {
    income: number;
    expenditure: { category: string; amount: number }[];
    assets: number;
    liabilities: number;
    goals: {
        id: string;
        goal: string;
        target_amount: number;
        time_horizon: number;
      }[];
    }
  
  export interface FinancialFormProps {
    formType: 'expenditures' | 'assets' | 'goals' | 'liabilities';
    nextRoute: string;
    stepNumber: number;
    fields: FormField[];
    defaultEntry: Record<string, any>;
  }