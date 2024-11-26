// src/components/Adviser/CreateClient.tsx
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

const CreateClient: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleCreateClient = async () => {
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from('clients').insert([
      { name, email, adviser_id: user.user?.id },
    ]);
    if (error) alert(error.message);
    else alert('Client added successfully!');
  };

  return (
    <div>
      <h2>Add New Client</h2>
      <input
        type="text"
        placeholder="Client Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Client Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleCreateClient}>Create Client</button>
    </div>
  );
};

export default CreateClient;
