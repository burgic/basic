// src/components/Auth/SignIn.tsx
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';

const SignIn: React.FC = () => {
  useAuthRedirect();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First, check if the user exists and is confirmed
      const { data: userCheck, error: userCheckError } = await supabase
        .from('auth.users')
        .select('confirmed_at, email')
        .eq('email', email)
        .single();

      if (userCheckError) {
        console.error('User check error:', userCheckError);
      }

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);

        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          // Attempt to resend confirmation email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email,
          });

          if (resendError) {
            console.error('Error resending confirmation:', resendError);
            throw new Error('Failed to resend confirmation email. Please contact support.');
          }

          throw new Error(
            'Your email is not confirmed. A new confirmation email has been sent. ' +
            'Please check your inbox and spam folder.'
          );
        }

        // Database error usually means permissions issue
        if (error.message.includes('Database error')) {
          throw new Error(
            'There was a problem accessing your account. ' +
            'Please try again or contact support if the problem persists.'
          );
        }

        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      // Get user's role from metadata
      const role = data.user.user_metadata?.role;
      
      console.log('Sign in successful:', {
        userId: data.user.id,
        role: role,
        email: data.user.email
      });

      // Redirect based on user role
      if (role === 'adviser') {
        navigate('/adviser/adviser-dashboard');
      } else {
        navigate('/client/client-dashboard');
      }
    } catch (error: any) {
      console.error('Sign in process error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-semibold text-gray-900">
            Sign In
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-md">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
