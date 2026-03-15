import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAdminLoginMutation } from '../../hooks/admin-auth';
import LogoIcon from '../../components/ui/LogoIcon';

export const Route = createFileRoute('/admin/login')({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const loginMutation = useAdminLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await loginMutation.mutateAsync({ email, password });
      navigate({ to: '/admin' });
      return;
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? 'Invalid email or password');
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

          <div className="mb-5">
            <label className="block text-white text-sm font-medium mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full bg-[#19233a] border border-[#2a3a54] rounded-md px-3 py-2.5 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#4a7ea0] transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-2.5 rounded-md text-sm font-semibold text-white bg-[#4a7ea0] hover:bg-[#3d6d8e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loginMutation.isPending ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-[#5a6a82]">
          <Link to="/admin/forgot-password" className="hover:text-white transition-colors">
            Lost your password?
          </Link>
          <Link to="/admin/signup" className="hover:text-white transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
