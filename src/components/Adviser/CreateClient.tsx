// src/components/Adviser/CreateClient.tsx
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const CreateClient: React.FC = () => {
  const navigate = useNavigate();
  const { user } = React.useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    password: '', // temporary password that client can change later
  });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user?.id) {
        throw new Error('Adviser not authenticated');
      }

      // Create auth user for client
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: clientData.email,
        password: clientData.password,
        options: {
          data: { 
            role: 'client',
          },
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('No user data returned');

      // Create profile for client
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: clientData.email,
          name: clientData.name,
          role: 'client',
          adviser_id: user.id, // Current adviser's ID
        });

      if (profileError) throw profileError;

      alert(`Client account created successfully. Login credentials have been sent to ${clientData.email}`);
      navigate('/adviser/adviser-dashboard');

    } catch (err: any) {
      console.error('Error creating client:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Create New Client</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 mb-4 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateClient} className="space-y-4">
        <div>
          <label className="block mb-1">
            Client Name
          </label>
          <input
            type="text"
            value={clientData.name}
            onChange={(e) => setClientData({...clientData, name: e.target.value})}
            required
            className="w-full p-2 border rounded"
            placeholder="Full Name"
          />
        </div>

        <div>
          <label className="block mb-1">
            Email
          </label>
          <input
            type="email"
            value={clientData.email}
            onChange={(e) => setClientData({...clientData, email: e.target.value})}
            required
            className="w-full p-2 border rounded"
            placeholder="client@example.com"
          />
        </div>

        <div>
          <label className="block mb-1">
            Temporary Password
          </label>
          <input
            type="password"
            value={clientData.password}
            onChange={(e) => setClientData({...clientData, password: e.target.value})}
            required
            className="w-full p-2 border rounded"
            placeholder="Temporary password"
          />
          <p className="text-sm text-gray-500 mt-1">
            Client can change this password after first login
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 rounded ${
            loading 
              ? 'bg-gray-300' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Creating Client...' : 'Create Client'}
        </button>
      </form>
    </div>
  );
};

export default CreateClient;