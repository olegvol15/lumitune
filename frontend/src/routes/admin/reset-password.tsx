import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import LogoIcon from "../../components/ui/LogoIcon";
import { useAdminAuthStore } from "../../store/adminAuthStore";

export const Route = createFileRoute("/admin/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const resetPassword = useAdminAuthStore((s) => s.resetPassword);

  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== repeat) {
      setError("Passwords do not match");
      return;
    }
    const email = sessionStorage.getItem("reset_email") ?? "";
    const code = sessionStorage.getItem("reset_code") ?? "";
    if (!email || !code) {
      setError("Session expired. Please start again.");
      return;
    }
    setLoading(true);
    const result = await resetPassword(email, code, password);
    if (result.ok) {
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_code");
      navigate({ to: "/admin/login" });
      return;
    }

    setError(result.error ?? "Failed to reset password");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1c2330] flex items-center justify-center px-4">
      <div className="w-full max-w-[360px] bg-[#1e2840] rounded-xl px-10 py-10">
        <div className="flex justify-center mb-8">
          <LogoIcon className="w-16 h-auto" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white text-sm font-medium mb-1.5">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full bg-[#19233a] border border-[#2a3a54] rounded-md px-3 py-2.5 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#4a7ea0] transition-colors"
            />
          </div>

          <div className="mb-5">
            <label className="block text-white text-sm font-medium mb-1.5">
              Repeat Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••••••••"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full bg-[#19233a] border border-[#2a3a54] rounded-md px-3 py-2.5 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#4a7ea0] transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs mb-3 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md text-sm font-semibold text-white bg-[#4a7ea0] hover:bg-[#3d6d8e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Log In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
