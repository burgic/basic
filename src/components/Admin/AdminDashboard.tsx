// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      
      try {
        if (!user) {
          console.log('No authenticated user found');
          setLoading(false);
          return;
        }

        // Fetch user profile from Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name, email, role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setLoading(false);
          return;
        }

        setUserData(profile);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {userData?.name || 'User'}
          </h1>
          <p className="text-gray-600">
            Role: {userData?.role || 'Not specified'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Profile Details
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium text-gray-600">Email:</span> {userData?.email}
              </p>
              <p>
                <span className="font-medium text-gray-600">Role:</span> {userData?.role}
              </p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-4">
              {userData?.role === 'adviser' && (
                <button
                  onClick={() => navigate('/adviser/create-client')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add New Client
                </button>
              )}
              
              {userData?.role === 'client' && (
                <button
                  onClick={() => navigate('/upload-document')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Upload Document
                </button>
              )}

              <button
                onClick={() => navigate('/profile')}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {userData?.role === 'adviser' && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Clients
            </h2>
            <p className="text-gray-600">
              Feature coming soon. You'll be able to see your recent client interactions here.
            </p>
          </div>
        )}

        {userData?.role === 'client' && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Documents
            </h2>
            <p className="text-gray-600">
              No recent documents. Start by uploading your first document.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
