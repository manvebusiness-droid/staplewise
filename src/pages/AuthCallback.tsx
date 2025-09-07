import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabase) {
          console.error('Supabase not configured');
          navigate('/');
          return;
        }

        // Get the session from the URL
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/?error=auth_failed');
          return;
        }

        if (session?.user) {
          console.log('✅ Google OAuth successful:', session.user.email);
          
          // Check if user profile exists in our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError && userError.code !== 'PGRST116') {
            console.error('Error fetching user profile:', userError);
            navigate('/?error=profile_error');
            return;
          }

          if (!userData) {
            // Create user profile for Google OAuth user
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
                phone: session.user.user_metadata?.phone || '',
                role: 'BUYER',
                company_name: '',
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating user profile:', createError);
              navigate('/?error=profile_creation_failed');
              return;
            }

            console.log('✅ User profile created for Google OAuth user');
            
            // Update auth context
            const authUser = {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              phone: newUser.phone,
              role: newUser.role,
              companyName: newUser.company_name || undefined,
              gst: newUser.gst || undefined,
            };

            localStorage.setItem('stapleWiseUser', JSON.stringify(authUser));
            localStorage.setItem('stapleWiseToken', session.access_token);
          } else {
            // User profile exists, update auth context
            const authUser = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              phone: userData.phone,
              role: userData.role,
              companyName: userData.company_name || undefined,
              gst: userData.gst || undefined,
            };

            localStorage.setItem('stapleWiseUser', JSON.stringify(authUser));
            localStorage.setItem('stapleWiseToken', session.access_token);
          }

          // Redirect to appropriate dashboard or home
          const user = JSON.parse(localStorage.getItem('stapleWiseUser') || '{}');
          if (user.role === 'SELLER') {
            navigate('/seller');
          } else if (user.role === 'ADMIN') {
            navigate('/admin');
          } else if (user.role === 'SALES') {
            navigate('/sales');
          } else {
            navigate('/');
          }
        } else {
          console.log('No session found, redirecting to home');
          navigate('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/?error=auth_callback_failed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we set up your account.</p>
      </div>
    </div>
  );
};

export default AuthCallback;