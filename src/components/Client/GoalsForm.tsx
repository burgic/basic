// src/components/Client/GoalsForm.tsx
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface GoalEntry {
  goal: string;
  target_amount: number;
  time_horizon: number; // in months or years
}

const GoalsForm: React.FC = () => {
  const [goalEntries, setGoalEntries] = useState<GoalEntry[]>([
    { goal: '', target_amount: 0, time_horizon: 0 },
  ]);

  const handleAddEntry = () => {
    setGoalEntries([...goalEntries, { goal: '', target_amount: 0, time_horizon: 0 }]);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const entries = [...goalEntries];
    (entries[index] as any)[field] = value;
    setGoalEntries(entries);
  };

  const handleSubmit = async () => {
    const { data: user } = await supabase.auth.getUser();
    const clientId = user.user?.id;

    const { error } = await supabase.from('goals').insert(
      goalEntries.map((entry) => ({
        ...entry,
        client_id: clientId,
      }))
    );

    if (error) alert(error.message);
    else alert('Goals data submitted successfully!');
  };

  return (
    <div>
      <h2>Set Your Financial Goals</h2>
      {goalEntries.map((entry, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Goal Description"
            value={entry.goal}
            onChange={(e) => handleChange(index, 'goal', e.target.value)}
          />
          <input
            type="number"
            placeholder="Target Amount"
            value={entry.target_amount}
            onChange={(e) => handleChange(index, 'target_amount', Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="Time Horizon (in years)"
            value={entry.time_horizon}
            onChange={(e) => handleChange(index, 'time_horizon', Number(e.target.value))}
          />
        </div>
      ))}
      <button onClick={handleAddEntry}>Add Another Goal</button>
      <button onClick={handleSubmit}>Submit Goals Data</button>
    </div>
  );
};

export default GoalsForm;
