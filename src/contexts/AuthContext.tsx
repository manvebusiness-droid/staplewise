import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SupabaseAuthService, type AuthUser, type RegisterData } from '../lib/supabaseAuth';
import { supabase, testSupabaseConnection } from '../lib/supabase';

export type { AuthUser, RegisterData };

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem('stapleWiseUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Check for existing session on mount
  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 Checking for existing Supabase session...');
        const currentUser = await SupabaseAuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem('stapleWiseUser', JSON.stringify(currentUser));
          console.log('✅ Found existing session for:', currentUser.email);
        }
      } catch (error) {
        console.log('ℹ️ No existing session found');
      }
    };

    initializeAuth();
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔄 Attempting Supabase login for:', email);
      const { user: authUser, token } = await SupabaseAuthService.login(email, password);
      setUser(authUser);
      localStorage.setItem('stapleWiseUser', JSON.stringify(authUser));
      localStorage.setItem('stapleWiseToken', token);
      console.log('✅ Login successful');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await SupabaseAuthService.logout();
      setUser(null);
      localStorage.removeItem('stapleWiseUser');
      localStorage.removeItem('stapleWiseToken');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if logout fails
      setUser(null);
      localStorage.removeItem('stapleWiseUser');
      localStorage.removeItem('stapleWiseToken');
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      console.log('🔄 Attempting Supabase registration for:', userData.email);
      const { user: authUser, token } = await SupabaseAuthService.register(userData);
      setUser(authUser);
      localStorage.setItem('stapleWiseUser', JSON.stringify(authUser));
      localStorage.setItem('stapleWiseToken', token);
      console.log('✅ Registration successful');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};