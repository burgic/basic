// src/utils/financialCalculations.ts
import { 
    Income, 
    Expenditure, 
    Asset, 
    Liability, 
    Goal,
    FinancialData 
  } from '../@types/financial';
  
  export const financialCalculations = {
    toMonthly: (amount: number, frequency: string = 'monthly'): number => {
      return frequency.toLowerCase() === 'annual' ? amount / 12 : amount;
    },
  
    toAnnual: (amount: number, frequency: string = 'monthly'): number => {
      return frequency.toLowerCase() === 'monthly' ? amount * 12 : amount;
    },
  
    calculateMonthlyIncome: (incomes: Income[]): number => {
      return incomes.reduce((sum, income) => 
        sum + financialCalculations.toMonthly(Number(income.amount), income.frequency), 0);
    },
  
    calculateAnnualIncome: (incomes: Income[]): number => {
      return incomes.reduce((sum, income) => 
        sum + financialCalculations.toAnnual(Number(income.amount), income.frequency), 0);
    },
  
    calculateMonthlyExpenditure: (expenditures: Expenditure[]): number => {
      return expenditures.reduce((sum, exp) => 
        sum + financialCalculations.toMonthly(Number(exp.amount), exp.frequency), 0);
    },
  
    calculateAnnualExpenditure: (expenditures: Expenditure[]): number => {
      return expenditures.reduce((sum, exp) => 
        sum + financialCalculations.toAnnual(Number(exp.amount), exp.frequency), 0);
    },
  
    calculateTotalAssets: (assets: Asset[]): number => {
      return assets.reduce((sum, asset) => sum + Number(asset.value), 0);
    },
  
    calculateTotalLiabilities: (liabilities: Liability[]): number => {
      return liabilities.reduce((sum, liability) => sum + Number(liability.amount), 0);
    },
  
    calculateNetWorth: (assets: Asset[], liabilities: Liability[]): number => {
      return financialCalculations.calculateTotalAssets(assets) - 
             financialCalculations.calculateTotalLiabilities(liabilities);
    },
  
    calculateFinancialSummary: (data: FinancialData) => {
      return {
        monthlyIncome: financialCalculations.calculateMonthlyIncome(data.incomes),
        annualIncome: financialCalculations.calculateAnnualIncome(data.incomes),
        monthlyExpenditure: financialCalculations.calculateMonthlyExpenditure(data.expenditures),
        annualExpenditure: financialCalculations.calculateAnnualExpenditure(data.expenditures),
        totalAssets: financialCalculations.calculateTotalAssets(data.assets),
        totalLiabilities: financialCalculations.calculateTotalLiabilities(data.liabilities),
        netWorth: financialCalculations.calculateNetWorth(data.assets, data.liabilities)
      };
    },
  
    formatCurrency: (amount: number): string => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    },
  
    calculatePercentage: (amount: number, total: number): number => {
      if (total === 0) return 0;
      return Number(((amount / total) * 100).toFixed(1));
    }
  };