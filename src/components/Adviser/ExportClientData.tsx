// src/components/Adviser/ExportClientData.tsx
import React from 'react';
import { supabase } from '../../services/supabaseClient';
import { useParams } from 'react-router-dom';
import { Parser } from 'json2csv';

const handleExport = async () => {
    // Fetch data as before
    const [{ data: incomes }, { data: expenditures }, { data: assets }, { data: liabilities }, { data: goals }] =
      await Promise.all([
        supabase.from('incomes').select('*').eq('client_id', clientId),
        supabase.from('expenditures').select('*').eq('client_id', clientId),
        supabase.from('assets').select('*').eq('client_id', clientId),
        supabase.from('liabilities').select('*').eq('client_id', clientId),
        supabase.from('goals').select('*').eq('client_id', clientId),
      ]);
  
    const allData = {
      incomes,
      expenditures,
      assets,
      liabilities,
      goals,
    };
  
    const parser = new Parser();
    const csv = parser.parse(allData);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `client_${clientId}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return <button onClick={handleExport}>Export Data</button>;
};

export default ExportClientData;
