// netlify/functions/types/financial.ts

export interface Income {
    id: string;
    client_id: string;
    type: string;
    amount: number;
    frequency: string;
  }
  
  export interface Expenditure {
    id: string;
    client_id: string;
    category: string;
    amount: number;
    frequency: string;
  }
  
  export interface Asset {
    id: string;
    client_id: string;
    type: string;
    description: string;
    value: number;
  }
  
  export interface Liability {
    id: string;
    client_id: string;
    type: string;
    description: string;
    amount: number;
    interest_rate: number;
  }
  
  export interface Goal {
    id: string;
    client_id: string;
    goal: string;
    target_amount: number;
    time_horizon: number;
  }
  
  export interface FinancialData {
    incomes: Income[];
    expenditures: Expenditure[];
    assets: Asset[];
    liabilities: Liability[];
    goals: Goal[];
  }
  
