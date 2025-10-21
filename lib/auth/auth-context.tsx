'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/auth/supabase-client';
import { TierManager } from '@/lib/image-processing/download-manager';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  plan_name?: string;
  subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing';
  subscription_expires_at?: string;
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  syncAuthFromAPI: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default context value to prevent errors when context is not available
const defaultAuthContext: AuthContextType = {
  user: null,
  profile: null,
  session: null,
  loading: false,
  signIn: async () => ({ success: false, error: 'Auth not initialized' }),
  signUp: async () => ({ success: false, error: 'Auth not initialized' }),
  signOut: async () => {},
  signInWithGoogle: async () => ({ success: false, error: 'Auth not initialized' }),
  updateProfile: async () => ({ success: false, error: 'Auth not initialized' }),
  refreshProfile: async () => {},
  syncAuthFromAPI: async () => {},
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug Supabase configuration
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Supabase Config Check:', { 
      supabaseUrl: supabaseUrl?.substring(0, 30) + '...', 
      supabaseKey: supabaseKey?.substring(0, 20) + '...',
      isPlaceholder: supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key'
    });
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
      console.error('Supabase not properly configured:', { supabaseUrl, supabaseKey });
      setLoading(false);
      return;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        
        // Check if there's a stored session in localStorage
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const projectId = supabaseUrl?.split('//')[1]?.split('.')[0];
        const storageKey = `sb-${projectId}-auth-token`;
        const storedSession = localStorage.getItem(storageKey);
        
        console.log('Storage key:', storageKey);
        console.log('Stored session exists:', !!storedSession);
        console.log('All localStorage keys:', Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('sb-')));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('Initial session result:', {
          sessionExists: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          expiresAt: session?.expires_at
        });
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('Loading user profile for:', session.user.id);
            await loadUserProfile(session.user.id);
          } else {
            console.log('No session found, trying to sync from API as fallback');
            // Try to sync auth state from API as fallback
            await syncAuthFromAPI();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await loadUserProfile(session.user.id);
          } else {
            console.log('Auth state change: No session, trying API sync fallback');
            // Try to sync from API as fallback
            await syncAuthFromAPI();
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for ID:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('User profile query result:', { data, error });

      if (error) {
        console.error('Error loading user profile:', error);
        console.log('Creating default profile for user:', userId);
        // Create default profile if it doesn't exist
        await createDefaultProfile(userId);
        return;
      }

      console.log('User profile loaded successfully:', {
        id: data.id,
        email: data.email,
        plan_name: data.plan_name,
        subscription_status: data.subscription_status,
        is_admin: data.is_admin
      });

      setProfile(data);
      // Determine plan based on subscription status
      const plan = (data.plan_name === 'Pro' || data.plan_name === 'pro') && 
                   (data.subscription_status === 'active' || data.subscription_status === 'trialing') 
                   ? 'pro' : 'free';
      
      console.log('Setting user plan to:', plan);
      TierManager.setUserPlan(plan);
      setLoading(false);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setLoading(false);
    }
  };

  const createDefaultProfile = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: user.email!,
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          plan_name: 'Free',
          subscription_status: null,
          subscription_end_date: null,
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return;
      }

      setProfile(data);
      TierManager.setUserPlan('free');
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      console.log('Auth context: Starting sign out process');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Auth context: Sign out error:', error);
        throw error;
      }
      console.log('Auth context: Sign out successful');
    } catch (error) {
      console.error('Auth context: Sign out failed:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      // Update tier manager if plan changed
      if (updates.plan_name) {
        const plan = (updates.plan_name === 'Pro' || updates.plan_name === 'pro') && 
                     (updates.subscription_status === 'active' || updates.subscription_status === 'trialing') 
                     ? 'pro' : 'free';
        TierManager.setUserPlan(plan);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const refreshProfile = async () => {
    console.log('Refreshing profile...');
    console.log('Current user:', user?.id);
    console.log('Current profile:', profile?.email);
    
    if (user) {
      console.log('User exists, reloading profile');
      await loadUserProfile(user.id);
    } else {
      console.log('No user, trying to refresh session');
      // Try to refresh the session if no user
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Session refresh result:', { session: !!session, error });
        
        if (!error && session?.user) {
          console.log('Found session, setting user and loading profile');
          setSession(session);
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          console.log('No valid session found');
        }
      } catch (error) {
        console.error('Error refreshing session:', error);
      }
    }
  };

  // Sync auth state from API when client-side session fails
  const syncAuthFromAPI = async () => {
    try {
      console.log('Syncing auth state from API...');
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        console.log('API user data:', userData);
        
        if (userData) {
          // Create a mock session object
          const mockSession = {
            user: {
              id: userData.id,
              email: userData.email,
              email_confirmed_at: new Date().toISOString(),
            },
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
            expires_in: 3600,
            token_type: 'bearer',
          };
          
          console.log('Setting mock session and profile');
          setSession(mockSession as any);
          setUser(mockSession.user as any);
          setProfile(userData);
          
          // Determine plan based on subscription status
          const plan = (userData.plan_name === 'Pro' || userData.plan_name === 'pro') && 
                       (userData.subscription_status === 'active' || userData.subscription_status === 'trialing') 
                       ? 'pro' : 'free';
          
          console.log('Setting user plan to:', plan);
          TierManager.setUserPlan(plan);
          setLoading(false);
        }
      } else {
        console.log('API user fetch failed:', response.status);
      }
    } catch (error) {
      console.error('Error syncing auth from API:', error);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateProfile,
    refreshProfile,
    syncAuthFromAPI,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn('useAuth called outside of AuthProvider, returning default context');
    return defaultAuthContext;
  }
  return context;
}

// Hook for checking if user has Pro access
export function useProAccess() {
  const { profile, loading } = useAuth();
  
  const isPro = ((profile?.plan_name === 'Pro' || profile?.plan_name === 'pro') && 
    (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing')) || 
    profile?.is_admin === true;
  
  const isTrialing = profile?.subscription_status === 'trialing';
  
  return {
    isPro,
    isTrialing,
    isLoading: loading,
    profile
  };
}
