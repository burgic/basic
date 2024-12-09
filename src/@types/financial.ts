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
  
  export interface Income {
    client_id: string;
    type: string; // e.g., 'Salary', 'Rental Income'
    amount: number;
    frequency: string; // e.g., 'Monthly', 'Yearly'
  }
  
  export interface Expenditure {
    client_id: string;
    category: string; // e.g., 'Rent/Mortgage', 'Utilities'
    amount: number;
    frequency: string; // e.g., 'Monthly', 'Yearly'
  }
  
  export interface Asset {
    client_id: string;
    type: string; // e.g., 'Property', 'Stocks', 'Savings'
    description: string; // Additional details about the asset
    value: number; // Current value of the asset
  }
  
  export interface Liability {
    client_id: string;
    type: string; // e.g., 'Mortgage', 'Credit Card', 'Student Loan'
    amount: number; // Outstanding balance
    interest_rate?: number; // Interest rate (if applicable)
  }
  
  export interface Goal {
    client_id: string;
    id: string;
    goal: string; // e.g., 'Retire', 'Pay off mortgage'
    target_amount: number;
    time_horizon: number; // Years to achieve the goal
  }
  
  export interface FinancialData {
    incomes: Income[]; // Detailed incomes
    expenditures: Expenditure[]; // Detailed expenditures
    assets: Asset[]; // Detailed assets
    liabilities: Liability[]; // Detailed liabilities
    goals: Goal[]; // Financial goals
  }
  
  
  export interface FinancialFormProps {
    formType: 'expenditures' | 'assets' | 'goals' | 'liabilities';
    nextRoute: string;
    stepNumber: number;
    fields: FormField[];
    defaultEntry: Record<string, any>;
  }

  export * from '../../netlify/functions/types/financial';
