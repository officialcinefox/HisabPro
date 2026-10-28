import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { Profile } from '../types';

const PERSISTED_AUTH_KEY = '@hisabpro_persisted_auth';
const PERSISTED_PROFILE_KEY = '@hisabpro_persisted_profile';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    phone?: string
  ) => Promise<{ error: string | null; needsEmailVerification?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  sendPasswordResetCode: (email: string) => Promise<{ error: string | null }>;
  verifyPasswordResetOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  resetPassword: (newPassword: string) => Promise<{ error: string | null }>;
  updateProfile: (
    displayName: string,
    phone?: string,
    avatarId?: string
  ) => Promise<{ error: string | null }>;
  updateAvatar: (avatarId: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
  sendPasswordResetCode: async () => ({ error: null }),
  verifyPasswordResetOtp: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
  updateAvatar: async () => ({ error: null }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
        await AsyncStorage.setItem(PERSISTED_PROFILE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Error fetching profile:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Instantly restore saved user & profile so login is preserved even after days
    const restorePersistedAuth = async () => {
      try {
        const [savedAuth, savedProfile] = await Promise.all([
          AsyncStorage.getItem(PERSISTED_AUTH_KEY),
          AsyncStorage.getItem(PERSISTED_PROFILE_KEY),
        ]);

        if (savedAuth && isMounted) {
          const parsedUser = JSON.parse(savedAuth);
          setUser(parsedUser);
        }
        if (savedProfile && isMounted) {
          setProfile(JSON.parse(savedProfile));
        }
      } catch (e) {
        console.warn('Error restoring persisted auth:', e);
      }
    };

    restorePersistedAuth();

    // 2. Validate session with Supabase and refresh token if needed
    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          setSession(session);
          setUser(session.user);
          await AsyncStorage.setItem(PERSISTED_AUTH_KEY, JSON.stringify(session.user));
          await fetchProfile(session.user.id);

          // If token expires in less than 2 minutes, refresh it now
          if (session.expires_at && session.expires_at * 1000 < Date.now() + 120000) {
            const { data: refreshed } = await supabase.auth.refreshSession();
            if (refreshed.session && isMounted) {
              setSession(refreshed.session);
              setUser(refreshed.session.user);
            }
          }
        }
      } catch (e) {
        console.warn('Error getting supabase session:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initSession();

    // 3. Listen for Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        await AsyncStorage.setItem(PERSISTED_AUTH_KEY, JSON.stringify(newSession.user));
        await fetchProfile(newSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        // ONLY clear credentials when explicitly signed out
        setSession(null);
        setUser(null);
        setProfile(null);
        await AsyncStorage.multiRemove([PERSISTED_AUTH_KEY, PERSISTED_PROFILE_KEY]);
      }
      if (isMounted) setIsLoading(false);
    });

    // 4. AppState listener: Automatically auto-refresh when app resumes from background
    const appStateSub = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
        try {
          const { data } = await supabase.auth.getSession();
          if (
            data?.session &&
            data.session.expires_at &&
            data.session.expires_at * 1000 < Date.now()
          ) {
            await supabase.auth.refreshSession();
          }
        } catch (_) {}
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      appStateSub.remove();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        return { error: error.message };
      }
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await AsyncStorage.setItem(PERSISTED_AUTH_KEY, JSON.stringify(data.user));
        await fetchProfile(data.user.id);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during sign in.' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    phone?: string
  ) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            phone: phone?.trim() || null,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await AsyncStorage.setItem(PERSISTED_AUTH_KEY, JSON.stringify(data.user));
        // Also ensure profile row is created
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            display_name: displayName.trim(),
            email: trimmedEmail,
            phone: phone?.trim() || null,
          })
          .select();

        await fetchProfile(data.user.id);

        // If session was not immediately attached, sign in automatically
        if (!data.session) {
          const signInRes = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });
          if (signInRes.data.session) {
            setSession(signInRes.data.session);
            setUser(signInRes.data.user);
            if (signInRes.data.user) {
              await fetchProfile(signInRes.data.user.id);
            }
          }
        }
      }

      return {
        error: null,
      };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during sign up.' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      await AsyncStorage.multiRemove([PERSISTED_AUTH_KEY, PERSISTED_PROFILE_KEY]);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const sendPasswordResetCode = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase()
      );
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to send password reset code.' };
    }
  };

  const verifyPasswordResetOtp = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: 'recovery',
      });
      if (error) {
        return { error: error.message };
      }
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Verification failed.' };
    }
  };

  const resetPassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to reset password.' };
    }
  };

  const updateProfile = async (
    displayName: string,
    phone?: string,
    avatarId?: string
  ) => {
    if (!user) return { error: 'Not authenticated' };
    try {
      const updateData: any = {
        display_name: displayName.trim(),
        phone: phone?.trim() || null,
        updated_at: new Date().toISOString(),
      };
      if (avatarId) {
        updateData.avatar_id = avatarId;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        return { error: error.message };
      }

      await fetchProfile(user.id);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to update profile.' };
    }
  };

  const updateAvatar = async (avatarId: string) => {
    if (!user) return { error: 'Not authenticated' };
    try {
      // Optimistically update local profile immediately
      setProfile((prev) => (prev ? { ...prev, avatar_id: avatarId } : null));

      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_id: avatarId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        await fetchProfile(user.id); // revert on error
        return { error: error.message };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to update avatar.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        sendPasswordResetCode,
        verifyPasswordResetOtp,
        resetPassword,
        updateProfile,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
