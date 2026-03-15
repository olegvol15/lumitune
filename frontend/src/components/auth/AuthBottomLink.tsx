import type { AuthBottomLinkProps } from '../../types/auth/auth-component.types';
import Button from '../ui/Button';

export default function AuthBottomLink({ onNavigateToSignIn }: AuthBottomLinkProps) {
  return (
    <p className="mt-4 text-center text-[15px] text-[#769CCF]">
      Згадали пароль?{' '}
      <Button
        variant="ghost"
        size="sm"
        onClick={onNavigateToSignIn}
        className="!px-0 font-semibold text-[#8AB8F0] underline underline-offset-4"
      >
        Увійдіть до аккаунту
      </Button>
    </p>
  );
}
