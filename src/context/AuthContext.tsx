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

const roleCache = React.useRef(new Map());

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
    const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
          try {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
              setSession(data.session);
              setUser(data.session.user);
              
              // Set role from metadata if available (fast path)
              if (data.session.user.user_metadata?.role) {
                setUserRole(data.session.user.user_metadata.role);
              }
            }
          } catch (error) {
            console.error('Session error:', error);
          } finally {
            setInitialAuthCheckComplete(true);
            setLoading(false);
          }
        };
        
        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('Auth state change:', { event, hasSession: !!newSession });
            
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            if (newSession?.user) {
                // Try to get role from user metadata first
                const metadataRole = newSession.user?.user_metadata?.role;
                if (metadataRole) {
                    setUserRole(metadataRole);
                } else {
                    // Fallback to profile table
                    try {
                        const { data: profileData } = await supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', newSession.user.id)
                            .single();
                        
                        if (profileData) {
                            setUserRole(profileData.role);
                        }
                    } catch (error) {
                        console.error('Error fetching user role:', error);
                    }
                }
            } else {
                setUserRole(null);
            }
            
            setLoading(false);  // Always set loading to false after auth state change
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const fetchRole = async () => {
            if (user && !userRole && initialAuthCheckComplete) {
                // Check cache first
                if (roleCache.current.has(user.id)) {
                    setUserRole(roleCache.current.get(user.id));
                    return;
                }
                
                try {
                    const { data } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();
                    
                    const fetchedRole = data?.role;
                    
                    if (fetchedRole) {
                        // Store in cache
                        roleCache.current.set(user.id, fetchedRole);
                        setUserRole(fetchedRole);
                    }
                } catch (error) {
                    console.error('Role fetch error:', error);
                }
            }
        };
        
        fetchRole();
    }, [user, userRole, initialAuthCheckComplete]);
    
    

    // Create the context value
    const contextValue = React.useMemo(() => ({
        user,
        session,
        loading,
        userRole
    }), [user, session, loading, userRole]);


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