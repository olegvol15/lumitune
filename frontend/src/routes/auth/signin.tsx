import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { FaFacebook, FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import AuthLogo from '../../components/auth/AuthLogo';
import Button from '../../components/ui/Button';
import Tooltip from '../../components/ui/Tooltip';
import authApi from '../../api/authApi';
import { useAuthLoginMutation } from '../../hooks/auth';
import { useAuthStore } from '../../store/authStore';
import { useI18n } from '../../lib/i18n';

export const Route = createFileRoute('/auth/signin')({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) throw redirect({ to: '/' });
  },
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const { copy } = useI18n();
  const socialButtons = [
    { id: 'facebook', icon: <FaFacebook size={22} color="#1877F2" />, label: `${copy.auth.signIn} Facebook` },
    { id: 'google', icon: <FcGoogle size={22} />, label: `${copy.auth.signIn} Google` },
    { id: 'apple', icon: <FaApple size={22} color="#fff" />, label: `${copy.auth.signIn} Apple` },
  ];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginMutation = useAuthLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await loginMutation.mutateAsync({ email, password });
      navigate({ to: '/' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? copy.auth.signInError);
    }
  };

  return (
    <div className="auth-page-bg min-h-screen px-4 py-6 sm:py-8 flex flex-col sm:items-center sm:justify-center">
      <div className="w-full max-w-[440px] auth-modal px-4 py-5 sm:px-5 sm:py-6">
        <AuthLogo heading={copy.auth.signInHeading} />

        <div className="space-y-2.5">
          {socialButtons.map(({ id, icon, label }) => {
            const isComingSoon = id !== 'google';

            return (
              <Tooltip key={id} content="Coming soon!" disabled={!isComingSoon} className="w-full">
                <Button
                  type="button"
                  variant="auth-outline"
                  size="lg"
                  shape="rect"
                  fullWidth
                  disabled={isComingSoon}
                  onClick={id === 'google' ? authApi.startGoogleOAuth : undefined}
                  leftIcon={
                    <div className="w-7 flex flex-col sm:items-center sm:justify-center">{icon}</div>
                  }
                >
                  <span className="flex-1 text-center">{label}</span>
                </Button>
              </Tooltip>
            );
          })}
        </div>

        <div className="auth-muted-line mt-6 mb-5" />

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[#D4E3F7] text-sm mb-1.5 block">
              {copy.auth.emailOrUsername}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="@gmail.com"
              required
              className="w-full auth-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/45 text-[15px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[#D4E3F7] text-sm block">{copy.auth.password}</label>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => navigate({ to: '/auth/forgot-password' })}
                className="text-[#79A9E4] !px-0 underline"
              >
                {copy.auth.forgotPassword}
              </Button>
            </div>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="************"
                required
                className="w-full auth-input rounded-xl px-4 py-3 pr-11 outline-none focus:ring-2 focus:ring-brand/45 text-[15px]"
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

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            shape="rect"
            fullWidth
            loading={loginMutation.isPending}
            className="mt-4"
          >
            {copy.auth.signIn}
          </Button>
        </form>

        <div className="auth-muted-line w-4/5 mx-auto mt-6 mb-5" />

        <p className="text-center text-[#769CCF] text-[15px]">
          {copy.auth.noAccount}{' '}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/auth/signup' })}
            className="text-[#8AB8F0] font-semibold underline underline-offset-4 !px-0"
          >
            {copy.auth.signUpLumiTune}
          </Button>
        </p>
      </div>
    </div>
  );
}
