import { useI18n } from '../../lib/i18n';

export default function AuthOrDivider() {
  const { copy } = useI18n();
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="auth-muted-line flex-1" />
      <span className="text-sm text-[#769CCF]">{copy.auth.or}</span>
      <div className="auth-muted-line flex-1" />
    </div>
  );
}
