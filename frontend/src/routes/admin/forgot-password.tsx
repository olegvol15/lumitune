import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import LogoIcon from "../../components/ui/LogoIcon";
import { useAdminAuthStore } from "../../store/adminAuthStore";

export const Route = createFileRoute("/admin/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const sendResetCode = useAdminAuthStore((s) => s.sendResetCode);
  const verifyResetCode = useAdminAuthStore((s) => s.verifyResetCode);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) return;
    setError("");
    setSending(true);
    const result = await sendResetCode(email);
    setSending(false);
    if (result.ok) {
      setCodeSent(true);
      if (result.code) {
        setCode(result.code);
      }
      return;
    }

    setError(result.error ?? "Failed to send code");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await verifyResetCode(email, code);
    if (!result.ok) {
      setError(result.error ?? "Invalid code. Please try again.");
      setLoading(false);
      return;
    }

    sessionStorage.setItem("reset_email", email);
    sessionStorage.setItem("reset_code", code);
    navigate({ to: "/admin/reset-password" });
  };

  return (
    <div className="min-h-screen bg-[#1c2330] flex items-center justify-center px-4">
      <div className="w-full max-w-[360px] bg-[#1e2840] rounded-xl px-10 py-10">
        <div className="flex justify-center mb-8">
          <LogoIcon className="w-16 h-auto" />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-white text-sm font-medium mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setCodeSent(false);
                setCode("");
              }}
              autoComplete="email"
              required
              className="w-full bg-[#19233a] border border-[#2a3a54] rounded-md px-3 py-2.5 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#4a7ea0] transition-colors"
            />
          </div>

          {/* Code + Send Code */}
          <div className="mb-5">
            <label className="block text-white text-sm font-medium mb-1.5">
              Code
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="••••••••••••••••••"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full bg-[#19233a] border border-[#2a3a54] rounded-md px-3 py-2.5 pr-24 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#4a7ea0] transition-colors"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sending || codeSent || !email}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4a7ea0] hover:text-white transition-colors disabled:opacity-40 whitespace-nowrap"
              >
                {sending ? "Sending…" : codeSent ? "Sent ✓" : "Send Code"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs mb-3 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !codeSent}
            className="w-full py-2.5 rounded-md text-sm font-semibold text-white bg-[#4a7ea0] hover:bg-[#3d6d8e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
