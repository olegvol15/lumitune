import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AuthLogo from '../../components/auth/AuthLogo';

export const Route = createFileRoute('/auth/signin')({
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const socialButtons = [
    { id: 'facebook', icon: 'f', label: 'Увійти з Facebook' },
    { id: 'google', icon: 'G', label: 'Увійти з Google' },
    { id: 'apple', icon: '', label: 'Увійти з Apple' },
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate async auth
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigate({ to: '/' });
  };

  return (
    <div className="auth-page-bg min-h-screen px-4 py-6 sm:py-8 flex items-center justify-center">
      <div className="w-full max-w-[440px] auth-modal px-4 py-5 sm:px-5 sm:py-6">
        <AuthLogo heading="Пориньте у LumiTune" />

        <div className="space-y-2.5">
          {socialButtons.map((button) => (
            <button
              key={button.id}
              type="button"
              className="w-full h-11 rounded-xl border border-[#2f73bf] bg-[#041325]/45 text-[#6EA0DE] hover:text-[#97bff0] transition-colors flex items-center justify-center gap-3"
            >
              <span className="text-[30px] leading-none w-7 text-center">{button.icon}</span>
              <span className="text-[32px] sm:text-base font-medium">{button.label}</span>
            </button>
          ))}
        </div>

        <div className="auth-muted-line mt-6 mb-5" />

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[#D4E3F7] text-sm mb-1.5 block">
              Електронна пошта або ім&apos;я користувача
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="@gmail.com"
              required
              className="w-full auth-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/45 text-[33px] sm:text-[15px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[#D4E3F7] text-sm block">Пароль</label>
              <button type="button" className="text-[#79A9E4] text-xs underline">
                Забули пароль?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="************"
                required
                className="w-full auth-input rounded-xl px-4 py-3 pr-11 outline-none focus:ring-2 focus:ring-brand/45 text-[33px] sm:text-[15px]"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                {showPwd ? (
                  <EyeOff size={18} className="text-[#79A9E4]" />
                ) : (
                  <Eye size={18} className="text-[#79A9E4]" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1CA2EA] text-[#041325] py-3 rounded-xl font-semibold text-[36px] sm:text-[18px] mt-4 disabled:opacity-60"
          >
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>

        <div className="auth-muted-line w-4/5 mx-auto mt-6 mb-5" />

        <p className="text-center text-[#769CCF] text-[30px] sm:text-[15px]">
          Немає акаунта?{' '}
          <button
            onClick={() => navigate({ to: '/auth/signup' })}
            className="text-[#8AB8F0] font-semibold underline underline-offset-4"
          >
            Реєстрація у LumiTune
          </button>
        </p>
      </div>
    </div>
  );
}
