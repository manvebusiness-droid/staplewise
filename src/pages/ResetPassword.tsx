import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SupabaseAuthService } from '../lib/supabaseAuth';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const ensureRecoverySession = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      const hash = window.location.hash || '';
      if (!session || !hash.includes('type=recovery')) {
        navigate('/');
      }
    };
    ensureRecoverySession();
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await SupabaseAuthService.updatePassword(password);
      setSuccess('Password updated. Redirecting to login...');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError('Failed to update password. Open the latest reset link and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Reset Password</h1>
        {error && <div className="mb-3 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-3 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="w-full px-3 py-2 border rounded" />
          </div>
          <button disabled={loading} className="w-full bg-primary text-white py-2 rounded disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;


