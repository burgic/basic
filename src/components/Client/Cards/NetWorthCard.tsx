import React from 'react';

interface NetWorthCardProps {
  assets: number;
  liabilities: number;
}

const NetWorthCard: React.FC<NetWorthCardProps> = ({ assets, liabilities }) => {
  const netWorth = assets - liabilities;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-[#111111] rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-12">Net Worth Summary</h2>
      
      <div className="grid grid-cols-3 gap-8">
        <div className="space-y-2">
          <p className="text-gray-400 text-lg">Total Assets</p>
          <p className="text-[#4ade80] text-4xl font-bold">{formatCurrency(assets)}</p>
        </div>
        
        <div className="space-y-2">
          <p className="text-gray-400 text-lg">Total Liabilities</p>
          <p className="text-[#f87171] text-4xl font-bold">{formatCurrency(liabilities)}</p>
        </div>
        
        <div className="space-y-2">
          <p className="text-gray-400 text-lg">Net Worth</p>
          <p className="text-[#818cf8] text-4xl font-bold">{formatCurrency(netWorth)}</p>
        </div>
      </div>
    </div>
  );
};

export default NetWorthCard;