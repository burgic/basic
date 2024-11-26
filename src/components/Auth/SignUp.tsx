// src/components/Auth/SignUp.tsx
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'adviser' | 'client'>('client'); // Default to 'client'

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }, // Assign 'adviser' or 'client'
      },
    });

    if (error) {
      console.error('Error signing up:', error);
      alert(`Error: ${error.message}`);
    } else {
      console.log('Sign-up successful:', data);
      alert('Sign-up successful! Please check your email to confirm your account.');
      // Optionally, redirect the user or perform additional actions
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <label>
        Email:
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <br />
      <label>
        Password:
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <br />
      <label>
        Role:
        <select value={role} onChange={(e) => setRole(e.target.value as 'adviser' | 'client')}>
          <option value="client">Client</option>
          <option value="adviser">Adviser</option>
        </select>
      </label>
      <br />
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
};

export default SignUp;
