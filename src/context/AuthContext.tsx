// src/context/AuthContext.tsx
import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '@supabase/supabase-js';

interface AuthContextProps {
    user: User | null;
}

export const AuthContext = createContext<AuthContextProps>({ user: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      // Define an async function
      const fetchSession = async () => {
        const { data, error } = await supabase.auth.getSession();
  
        if (error) {
          console.error('Error fetching session:', error);
          return;
        }
  
        setUser(data.session?.user ?? null);
      };
  
      // Call the async function
      fetchSession();
  
      // Set up the auth state change listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
  
      // Clean up the listener on component unmount
      return () => {
        subscription.unsubscribe();
      };
    }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};
