import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import AuthLogo from "../../components/auth/AuthLogo";
import Button from "../../components/ui/Button";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1 | 2>(0);

  // Step 0
  const [email, setEmail] = useState("");

  // Step 1
  const [code, setCode] = useState("");

  // Step 2
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const maskedEmail = email
    ? email[0] +
      "*".repeat(5) +
      email.slice(6, email.indexOf("@")) +
      email.slice(email.indexOf("@"))
    : "";

  const handleResend = () => {
    // TODO: resend code
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigate({ to: "/auth/signin" });
  };

  const BackButton = ({ onBack }: { onBack: () => void }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onBack}
      className="text-[#8AB8F0] underline underline-offset-4 !px-0 mb-3"
    >
      Назад
    </Button>
  );

  const OrDivider = () => (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 auth-muted-line" />
      <span className="text-[#769CCF] text-sm">або</span>
      <div className="flex-1 auth-muted-line" />
    </div>
  );

  const BottomLink = () => (
    <p className="text-center text-[#769CCF] text-[15px] mt-4">
      Згадали пароль?{" "}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/auth/signin" })}
        className="text-[#8AB8F0] font-semibold underline underline-offset-4 !px-0"
      >
        Увійдіть до аккаунту
      </Button>
    </p>
  );

  // ─── Step 0: email ────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="auth-page-bg min-h-screen px-4 py-6 sm:py-8 flex flex-col sm:items-center sm:justify-center">
        <div className="w-full max-w-[440px] auth-modal px-4 py-5 sm:px-5 sm:py-6">
          <BackButton onBack={() => navigate({ to: "/auth/signin" })} />

          <AuthLogo heading="Забули пароль?" />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(1);
            }}
            className="space-y-3.5"
          >
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
                className="w-full auth-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/45 text-[15px]"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              shape="rect"
              fullWidth
            >
              Продовжити
            </Button>
          </form>

          <OrDivider />

          <Button
            variant="auth-outline"
            size="lg"
            shape="rect"
            fullWidth
            onClick={handleResend}
          >
            Отримайте новий код
          </Button>

          <BottomLink />
        </div>
      </div>
    );
  }

  // ─── Step 1: verification code ────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="auth-page-bg min-h-screen px-4 py-6 sm:py-8 flex flex-col sm:items-center sm:justify-center">
        <div className="w-full max-w-[440px] auth-modal px-4 py-5 sm:px-5 sm:py-6">
          <BackButton onBack={() => setStep(0)} />

          <AuthLogo heading="Забули пароль?" />

          <p className="text-[#769CCF] text-sm text-center -mt-2 mb-4">
            Введіть 6-значний код, який ми відправили вам на адресу{" "}
            <span className="text-[#8AB8F0]">
              {maskedEmail || "G*****2@G*l.com"}
            </span>
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}
            className="space-y-3.5"
          >
            <div>
              <label className="text-[#D4E3F7] text-sm mb-1.5 block">
                Код підтвердження
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000-00"
                maxLength={6}
                required
                className="w-full auth-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/45 text-[15px] tracking-widest text-center"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              shape="rect"
              fullWidth
            >
              Продовжити
            </Button>
          </form>

          <OrDivider />

          <Button
            variant="auth-outline"
            size="lg"
            shape="rect"
            fullWidth
            onClick={handleResend}
          >
            Отримайте новий код
          </Button>

          <BottomLink />
        </div>
      </div>
    );
  }

  // ─── Step 2: new password ─────────────────────────────────────────────────
  return (
    <div className="auth-page-bg min-h-screen px-4 py-6 sm:py-8 flex flex-col sm:items-center sm:justify-center">
      <div className="w-full max-w-[440px] auth-modal px-4 py-5 sm:px-5 sm:py-6">
        <BackButton onBack={() => setStep(1)} />

        <AuthLogo heading="Придумайте новий пароль" />

        <div className="space-y-3.5 mt-1">
          <div>
            <label className="text-[#D4E3F7] text-sm mb-1.5 block">
              Пароль
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="************"
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

          <div>
            <label className="text-[#D4E3F7] text-sm mb-1.5 block">
              Підтвердіть пароль
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="************"
                className="w-full auth-input rounded-xl px-4 py-3 pr-11 outline-none focus:ring-2 focus:ring-brand/45 text-[15px]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                {showConfirm ? (
                  <EyeOff size={18} className="text-[#79A9E4]" />
                ) : (
                  <Eye size={18} className="text-[#79A9E4]" />
                )}
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            shape="rect"
            fullWidth
            loading={loading}
            disabled={!password || password !== confirmPassword}
            onClick={handleFinalSubmit}
            className="mt-2"
          >
            Змінити пароль
          </Button>
        </div>

        <OrDivider />

        <Button
          variant="auth-outline"
          size="lg"
          shape="rect"
          fullWidth
          onClick={handleResend}
        >
          Отримайте новий код
        </Button>

        <BottomLink />
      </div>
    </div>
  );
}
