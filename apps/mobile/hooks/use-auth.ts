import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import {
  getCurrentUser,
  signInUserWithPhone,
  signOutUser,
  signUpUser,
  SignUpData,
} from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { USER_TYPE } from '@/constants/enums';

/**
 * Custom hook for authentication
 */

export interface AuthState {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Load current user on mount
    loadUser();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            userProfile: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        await loadUserProfile(user);
      } else {
        setAuthState({
          user: null,
          userProfile: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  };

  const loadUserProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        setAuthState({
          user,
          userProfile: null,
          loading: false,
          isAuthenticated: true,
        });
        return;
      }

      setAuthState({
        user,
        userProfile: profile,
        loading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      setAuthState({
        user,
        userProfile: null,
        loading: false,
        isAuthenticated: true,
      });
    }
  };

  const signUp = async (signUpData: SignUpData) => {
    const result = await signUpUser(signUpData);
    if (result.success && result.user) {
      await loadUserProfile(result.user);
    }
    return result;
  };

  const signIn = async (phoneNumber: string, password: string) => {
    const result = await signInUserWithPhone(phoneNumber, password);
    if (result.success && result.user) {
      await loadUserProfile(result.user);
    }
    return result;
  };

  const signOut = async () => {
    const result = await signOutUser();
    if (result.success) {
      setAuthState({
        user: null,
        userProfile: null,
        loading: false,
        isAuthenticated: false,
      });
    }
    return result;
  };

  const isUserType = (type: USER_TYPE): boolean => {
    return authState.userProfile?.user_type === type;
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    isUserType,
    reload: loadUser,
  };
};
