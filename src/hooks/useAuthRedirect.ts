// src/hooks/useAuthRedirect.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuthRedirect = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const role = user.user_metadata.role;
      if (role === 'adviser') {
        navigate('/adviser/adviser-dashboard');
      } else if (role === 'client') {
        navigate('/client-dashboard');
      }
    }
  }, [user, navigate]);
};