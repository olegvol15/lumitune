import type { AuthBottomLinkProps } from '../../types/auth/auth-component.types';
import Button from '../ui/Button';
import { useI18n } from '../../lib/i18n';

export default function AuthBottomLink({ onNavigateToSignIn }: AuthBottomLinkProps) {
  const { copy } = useI18n();
  return (
    <p className="mt-4 text-center text-[15px] text-[#769CCF]">
      {copy.auth.rememberedPassword}{' '}
      <Button
        variant="ghost"
        size="sm"
        onClick={onNavigateToSignIn}
        className="!px-0 font-semibold text-[#8AB8F0] underline underline-offset-4"
      >
        {copy.auth.signInToAccount}
      </Button>
    </p>
  );
}
