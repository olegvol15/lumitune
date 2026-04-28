import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import AuthLogo from '../../components/auth/AuthLogo';
import Button from '../../components/ui/Button';
import { useI18n } from '../../lib/i18n';
import { useAuthStore } from '../../store/authStore';

export const Route = createFileRoute('/oauth/callback')({
  beforeLoad: ({ location }) => {
    const search = new URLSearchParams(location.searchStr);
    if (!search.get('token') && !search.get('error')) {
      throw redirect({ to: '/auth/signin' });
    }
  },
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { copy } = useI18n();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const completeOAuthLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const providerError = params.get('error');

      if (providerError || !token) {
        if (mounted) setError(copy.auth.signInError);
        return;
      }

      try {
        const nextToken = await useAuthStore.getState().refreshSession();
        if (!nextToken) {
          throw new Error('OAuth refresh failed');
        }
        navigate({ to: '/', replace: true });
      } catch {
        useAuthStore.getState().clearSession();
        if (mounted) setError(copy.auth.signInError);
      }
    };

    void completeOAuthLogin();

    return () => {
      mounted = false;
    };
  }, [copy.auth.signInError, navigate]);

  return (
    <div className="auth-page-bg min-h-screen px-4 py-6 sm:py-8 flex flex-col sm:items-center sm:justify-center">
      <div className="w-full max-w-[440px] auth-modal px-4 py-5 sm:px-5 sm:py-6">
        <AuthLogo heading={copy.auth.signInHeading} />

        {error ? (
          <div className="space-y-4">
            <p className="text-red-400 text-sm text-center">{error}</p>
            <Button
              variant="primary"
              size="lg"
              shape="rect"
              fullWidth
              onClick={() => navigate({ to: '/auth/signin', replace: true })}
            >
              {copy.auth.signIn}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <span className="w-6 h-6 border-2 border-[#8AB8F0] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#769CCF] text-sm">{copy.auth.signIn}</p>
          </div>
        )}
      </div>
    </div>
  );
}
