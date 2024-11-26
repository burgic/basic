// src/components/Auth/SignUp.tsx
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

await supabase.auth.signUp(
    { email, password },
    { data: { role: 'adviser' } } // or 'client'
);

// During sign-up
await supabase.auth.signUp(
    { email, password },
    { data: { role: 'client' } } // or 'client'
);

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Check your email for the confirmation link.');
  };

  // During sign-up
    
  
  

  return (
    <div>
      <h2>Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
};

export default SignUp;
