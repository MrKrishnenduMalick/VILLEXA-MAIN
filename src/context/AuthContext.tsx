import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, checkIsAdmin, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  isLoading: true,
  isConfigured: false,
  signIn: async () => ({ success: false }),
  signOut: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    async function initSession() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const adminStatus = await checkIsAdmin();
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase credentials are not configured in environment variables. See SETUP_AND_SECURITY.md.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || 'Invalid credentials' };
      }

      // Explicit administrative authorization check
      const adminStatus = await checkIsAdmin();
      if (!adminStatus) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Access Denied: This account is not recorded as an authorized administrator in app_admins.'
        };
      }

      setUser(data.user);
      setSession(data.session);
      setIsAdmin(true);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      return { success: false, error: msg };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
