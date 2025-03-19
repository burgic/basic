// src/components/ProtectedRoute.tsx

// src/components/ProtectedRoute.tsx
import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user } = useContext(AuthContext);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // First check if role is in user metadata
      if (user.user_metadata?.role) {
        setUserRole(user.user_metadata.role);
        setLoading(false);
        return;
      }

      // If not in metadata, fetch from profiles table
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserRole(data.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  // Show loading state while checking role
  if (loading) {
    return <div>Checking authorization...</div>;
  }

  // Redirect if no user
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Redirect if role doesn't match required
  if (requiredRole && userRole !== requiredRole) {
    console.log('Role mismatch:', { userRole, requiredRole });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

/*
import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

interface ProtectedRouteProps {
  children: React.ReactNode; // Changed from JSX.Element to React.ReactNode
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user } = useContext(AuthContext);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('Protected Route:', {
    user: user?.id,
    userRole: user?.user_metadata?.role,
    requiredRole,
    hasUser: !!user,
    roleMatch: user?.user_metadata?.role === requiredRole
  });

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.user_metadata.role !== requiredRole) {
    return <Navigate to="/" replace/>;
  }

  return <>{children}</>; // Use fragment to wrap children
};

export default ProtectedRoute;

*/