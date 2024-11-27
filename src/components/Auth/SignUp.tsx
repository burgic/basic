import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

interface Adviser {
  id: string;
  name: string;
  email: string;
}

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'adviser' | 'client'>('client');
  const [adviserId, setAdviserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advisers, setAdvisers] = useState<Adviser[]>([]);

  // Fetch advisers when component mounts
  useEffect(() => {
    const fetchAdvisers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'adviser');

      if (error) {
        console.error('Error fetching advisers:', error);
        return;
      }

      setAdvisers(data || []);
    };

    fetchAdvisers();
  }, []);

  const handleSignUp = async () => {
    // Basic validation
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    if (role === 'client' && !adviserId) {
      setError('Please select an adviser');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if email already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (existingProfile) {
        throw new Error('An account with this email already exists');
      }

      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
        },
      });

      if (error) throw error;

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name,
            role,
            adviser_id: role === 'client' ? adviserId : null,
            created_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          await supabase.auth.signOut();
          throw new Error('Failed to create user profile');
        }

        console.log('Sign-up and profile creation successful:', data);
        alert('Sign-up successful! Please check your email to confirm your account.');
      }
    } catch (error: any) {
      console.error('Error in signup process:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <label>
        Name:
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Email:
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
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
          required
        />
      </label>
      <br />
      <label>
        Role:
        <select 
          value={role} 
          onChange={(e) => {
            setRole(e.target.value as 'adviser' | 'client');
            if (e.target.value === 'adviser') {
              setAdviserId(''); // Clear adviser selection if switching to adviser
            }
          }}
          required
        >
          <option value="client">Client</option>
          <option value="adviser">Adviser</option>
        </select>
      </label>
      <br />
      {role === 'client' && (
        <label>
          Select Adviser:
          <select
            value={adviserId}
            onChange={(e) => setAdviserId(e.target.value)}
            required
          >
            <option value="">Choose an adviser</option>
            {advisers.map((adviser) => (
              <option key={adviser.id} value={adviser.id}>
                {adviser.name} ({adviser.email})
              </option>
            ))}
          </select>
        </label>
      )}
      <br />
      <button 
        onClick={handleSignUp} 
        disabled={loading}
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </div>
  );
};

export default SignUp;