import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAdminSignupMutation } from '../../hooks/admin-auth';
import LogoIcon from '../../components/ui/LogoIcon';

export const Route = createFileRoute('/admin/signup')({
  component: AdminSignupPage,
});

function AdminSignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState('');
  const signupMutation = useAdminSignupMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== repeat) {
      setError('Passwords do not match');
      return;
    }
    try {
      await signupMutation.mutateAsync({ email, password });
      navigate({ to: '/admin/login' });
      return;
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-[#1c2330] flex items-center justify-center px-4">
      <div className="w-full max-w-[360px] bg-[#1e2840] rounded-xl px-10 py-10">
        <div className="flex justify-center mb-8">
          <LogoIcon className="w-16 h-auto" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white text-sm font-medium mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full bg-[#19233a] border border-[#2a3a54] rounded-md px-3 py-2.5 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#4a7ea0] transition-colors"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white text-sm font-medium mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full bg-[#19233a] border border-[#2a3a54] rounded-md px-3 py-2.5 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#4a7ea0] transition-colors"
            />
          </div>

          <div className="mb-5">
            <label className="block text-white text-sm font-medium mb-1.5">Repeat Password</label>
            <input
              type="password"
              placeholder="••••••••••••••••••"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full bg-[#19233a] border border-[#2a3a54] rounded-md px-3 py-2.5 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#4a7ea0] transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full py-2.5 rounded-md text-sm font-semibold text-white bg-[#4a7ea0] hover:bg-[#3d6d8e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {signupMutation.isPending ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-[#5a6a82]">
          Already have an account?{' '}
          <Link to="/admin/login" className="text-[#4a7ea0] hover:text-white transition-colors">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
