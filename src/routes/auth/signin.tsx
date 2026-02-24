import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Eye, EyeOff, Music2 } from 'lucide-react';

export const Route = createFileRoute('/auth/signin')({
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate async auth
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col px-6 py-12">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mb-3">
          <Music2 size={32} className="text-white" />
        </div>
        <h1 className="text-white text-3xl font-bold">LumiTune</h1>
        <p className="text-muted text-sm mt-1">Музика, яка надихає</p>
      </div>

      <h2 className="text-white text-2xl font-bold mb-6">Увійти</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-muted text-sm mb-1.5 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full bg-surface-alt text-white placeholder-muted rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-brand/50 text-sm"
          />
        </div>

        <div>
          <label className="text-muted text-sm mb-1.5 block">Пароль</label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-surface-alt text-white placeholder-muted rounded-xl px-4 py-3.5 pr-12 outline-none focus:ring-2 focus:ring-brand/50 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
            >
              {showPwd ? (
                <EyeOff size={18} className="text-muted" />
              ) : (
                <Eye size={18} className="text-muted" />
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          className="text-brand text-sm font-medium self-end w-full text-right"
        >
          Забули пароль?
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white py-3.5 rounded-xl font-semibold text-sm mt-2 disabled:opacity-60"
        >
          {loading ? 'Вхід...' : 'Увійти'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-muted text-xs">або</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Social */}
      <button className="w-full border border-white/20 text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
        <span className="text-lg">G</span>
        Продовжити з Google
      </button>

      <p className="text-center text-muted text-sm mt-8">
        Немає акаунту?{' '}
        <button
          onClick={() => navigate({ to: '/auth/signup' })}
          className="text-brand font-semibold"
        >
          Зареєструватись
        </button>
      </p>
    </div>
  );
}
