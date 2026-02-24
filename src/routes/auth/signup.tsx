import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AuthLogo from '../../components/auth/AuthLogo';

export const Route = createFileRoute('/auth/signup')({
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigate({ to: '/' });
  };

  return (
    <div className="auth-page-bg min-h-screen px-4 py-6 sm:py-8 flex items-center justify-center">
      <div className="w-full max-w-[440px] auth-modal px-4 py-5 sm:px-5 sm:py-6">
        <AuthLogo heading="Створити акаунт у LumiTune" />

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[#D4E3F7] text-sm mb-1.5 block">Ім&apos;я</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше ім'я"
              required
              className="w-full auth-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/45 text-[33px] sm:text-[15px]"
            />
          </div>

          <div>
            <label className="text-[#D4E3F7] text-sm mb-1.5 block">Email</label>
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
            <label className="text-[#D4E3F7] text-sm mb-1.5 block">Пароль</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="************"
                required
                minLength={8}
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

          <p className="text-[#769CCF] text-xs leading-relaxed">
            Реєструючись, ви погоджуєтесь з нашими{' '}
            <span className="text-[#8AB8F0] underline">Умовами використання</span> та{' '}
            <span className="text-[#8AB8F0] underline">Політикою конфіденційності</span>.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1CA2EA] text-[#041325] py-3 rounded-xl font-semibold text-[34px] sm:text-[17px] mt-4 disabled:opacity-60"
          >
            {loading ? 'Реєстрація...' : 'Зареєструватись'}
          </button>
        </form>

        <div className="auth-muted-line mt-6 mb-5" />

        <button className="w-full h-11 rounded-xl border border-[#2f73bf] bg-[#041325]/45 text-[#8AB8F0] hover:text-[#9fc4f1] transition-colors flex items-center justify-center gap-3">
          <span className="text-[30px] leading-none w-7 text-center">G</span>
          <span className="text-[32px] sm:text-[15px] font-medium">Продовжити з Google</span>
        </button>

        <p className="text-center text-[#769CCF] text-[30px] sm:text-[15px] mt-6">
          Вже є акаунт?{' '}
          <button
            onClick={() => navigate({ to: '/auth/signin' })}
            className="text-[#8AB8F0] font-semibold underline underline-offset-4"
          >
            Увійти
          </button>
        </p>
      </div>
    </div>
  );
}
