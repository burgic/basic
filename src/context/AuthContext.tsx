// src/context/AuthContext.tsx
import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { AuthSession, User } from '@supabase/supabase-js';

interface AuthContextProps {
    user: User | null;
    session: AuthSession | null;
    loading: boolean;
    userRole: string | null;
}

const initialState: AuthContextProps = {
    user: null,
    session: null,
    loading: true, 
    userRole: null
};

export const AuthContext = createContext<AuthContextProps>(initialState);

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<AuthSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    const fetchUserRole = async (userId: string) => {
        // First check if user has role in metadata
        if (user?.user_metadata?.role) {
            setUserRole(user.user_metadata.role);
            return;
        }

        try {
            // Attempt to get role from profiles table
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();
                
            if (error) throw error;
            
            if (data?.role) {
                setUserRole(data.role);
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
            setUserRole(null);
        }
    };

    useEffect(() => {
        // Test Supabase connection
        async function testSupabaseConnection() {
          try {
            console.log("Testing Supabase connection...");
            const { data, error } = await supabase.from('profiles').select('count');
            
            if (error) {
              console.error("Connection test failed:", error);
              return false;
            }
            
            console.log("Connection successful:", data);
            return true;
          } catch (e) {
            console.error("Connection test exception:", e);
            return false;
          }
        }
        
        testSupabaseConnection();
      }, []);

    useEffect(() => {
        // Try to recover session from storage
        const initializeAuth = async () => {
            try {
                // Get current session
                const { data: { session: currentSession }, error } = await supabase.auth.getSession();
                
                console.log('Retrieved session:', {
                    hasSession: !!currentSession,
                    error: error?.message
                });

                if (currentSession) {
                    setSession(currentSession);
                    setUser(currentSession.user);

                    // Fetch user role when we have a user
                    await fetchUserRole(currentSession.user.id);

                }
            } catch (error) {
                console.error('Session retrieval error:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('Auth state change:', { event, hasSession: !!newSession });
            
            setSession(newSession);
            setUser(newSession?.user ?? null);

            // Update user role when session changes
            if (newSession?.user) {
                await fetchUserRole(newSession.user.id);
            } else {
                setUserRole(null);
            }

            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const contextValue = {
        user,
        session,
        loading, 
        userRole
    };

    if (loading) {
        return <div>Loading auth state...</div>;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};


/*
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('Initial session:', session);
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session);
            setSession(session);
            setUser(session?.user ?? null);

            if (event === 'SIGNED_IN' && session?.user) {
                // Check if profile exists
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                // If no profile exists, create one
                if (!profile) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert({
                            id: session.user.id,
                            email: session.user.email,
                            role: 'client',
                            created_at: new Date().toISOString()
                        });

                    if (profileError) {
                        console.error('Error creating profile:', profileError);
                    }
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Don't return loading component here
    return (
        <AuthContext.Provider value={{ user, session, loading }}>
            {children}
        </AuthContext.Provider>
    );
};


useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
  
        // If no profile exists, create one
        if (!profile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              role: 'client',
              created_at: new Date().toISOString()
            });
  
          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }
      }
    });
  
    return () => subscription.unsubscribe();
  }, []);

    if (loading) {
        return <div>Loading...</div>; // Or your loading component
    }

    return (
        <AuthContext.Provider value={{ user, session }}>
            {children}
        </AuthContext.Provider>
    );
};

*/