import { supabase } from './supabase';

export const signInWithGoogle = async () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
  }

  try {
    // Prefer a configured public site URL in production, fallback to current origin (useful for local dev)
    const siteUrl = (import.meta as any).env?.VITE_PUBLIC_SITE_URL || window.location.origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl.replace(/\/$/, '')}/auth/callback`,
      },
    });

    if (error) {
      console.error('Google OAuth error:', error.message);
      throw error;
    }

    console.log('Redirecting to Google:', data.url);
    return data;
  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    throw error;
  }
};

export type UserRole = 'ADMIN' | 'SALES' | 'BUYER' | 'SELLER';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  companyName?: string;
  gst?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  companyName?: string;
  gst?: string;
}

export class SupabaseAuthService {
  static getSiteUrl(): string {
    const siteUrl = (import.meta as any).env?.VITE_PUBLIC_SITE_URL || window.location.origin;
    return siteUrl.replace(/\/$/, '');
  }

  static async register(data: RegisterData): Promise<{ user: AuthUser; token: string }> {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
    
    try {
      console.log('🔄 Attempting Supabase registration for:', data.email);
      
     // Ensure role is uppercase to match database constraint
     const normalizedRole = data.role.toUpperCase() as UserRole;
     
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            name: data.name,
            phone: data.phone,
            role: normalizedRole,
            company_name: data.companyName,
            gst: data.gst,
          },
          // Disable email confirmation for development
          captchaToken: undefined,
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      console.log('✅ Auth user created successfully');

      // Wait a moment for the auth user to be fully created
      await new Promise(resolve => setTimeout(resolve, 100));

      // 2. Create user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: normalizedRole,
          company_name: data.companyName,
          gst: data.gst,
        })
        .select()
        .single();

      if (userError) throw userError;

      console.log('✅ User profile created successfully');

      const user: AuthUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        companyName: userData.company_name || undefined,
        gst: userData.gst || undefined,
      };

      return {
        user,
        token: authData.session?.access_token || '',
      };
    } catch (error) {
      console.error('❌ Supabase registration error:', error);
      
      // Extract meaningful error message
      const errorMessage = this.extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  static async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
    
    try {
      console.log('🔄 Attempting Supabase login for:', email);
      
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.log('🔄 Auth error details:', authError);
        throw authError;
      }
      if (!authData.user) throw new Error('Login failed');

      console.log('✅ Supabase login successful');

      // 2. Get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) throw userError;

      const user: AuthUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        companyName: userData.company_name || undefined,
        gst: userData.gst || undefined,
      };

      return {
        user,
        token: authData.session?.access_token || '',
      };
    } catch (error) {
      console.error('❌ Supabase login error:', error);
      const errorMessage = this.extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  private static extractErrorMessage(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (error && typeof error === 'object') {
      // Check common Supabase error fields
      const possibleFields = ['message', 'error_description', 'msg', 'details', 'hint'];
      
      for (const field of possibleFields) {
        if (error[field] && typeof error[field] === 'string') {
          return error[field];
        }
      }
      
      // Check nested error object
      if (error.error) {
        if (typeof error.error === 'string') {
          return error.error;
        }
        if (typeof error.error === 'object' && error.error.message) {
          return error.error.message;
        }
      }
      
      // Try to stringify if it has meaningful content
      const stringified = JSON.stringify(error);
      if (stringified && stringified !== '{}' && stringified !== 'null') {
        return stringified;
      }
    }
    
    return 'Authentication service error. Please try again.';
  }

  static async logout(): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async requestPasswordReset(email: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }
    const redirectTo = `${this.getSiteUrl()}/reset-password`;
    const client = supabase!;
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  }

  static async updatePassword(newPassword: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }
    const client = supabase!;
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    if (!supabase) return null;
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        companyName: userData.company_name || undefined,
        gst: userData.gst || undefined,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async updateProfile(userId: string, updates: Partial<AuthUser>): Promise<AuthUser> {
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured.');
      }
      const { data, error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          phone: updates.phone,
          company_name: updates.companyName,
          gst: updates.gst,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role,
        companyName: data.company_name || undefined,
        gst: data.gst || undefined,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Profile update failed: ${JSON.stringify(error)}`);
    }
  }
}