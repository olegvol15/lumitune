import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, KeyRound, Mail, Save, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminUpdatePasswordMutation } from '../../hooks/admin-auth';
import { useAdminAuthStore } from '../../store/adminAuthStore';

export const Route = createFileRoute('/admin/settings')({ component: AdminSettingsPage });

const labelClass = 'block text-[#7a8faa] text-xs font-medium mb-1.5';
const inputClass =
  'w-full bg-[#19233a] border border-[#2a3a52] rounded-lg py-3 pl-3.5 pr-11 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#3dc9b0] transition-colors';

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  autoComplete: string;
};

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
  autoComplete,
}: PasswordFieldProps) {
  const ToggleIcon = visible ? EyeOff : Eye;

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
          autoComplete={autoComplete}
          spellCheck={false}
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
        />
        <button
          type="button"
          onClick={onToggleVisible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a8faa] transition-colors hover:text-white"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          <ToggleIcon size={17} />
        </button>
      </div>
    </div>
  );
}

function AdminSettingsPage() {
  const navigate = useNavigate();
  const admin = useAdminAuthStore((state) => state.admin);
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const isBootstrapped = useAdminAuthStore((state) => state.isBootstrapped);
  const updatePasswordMutation = useAdminUpdatePasswordMutation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isBootstrapped && !isAuthenticated) navigate({ to: '/admin/login' });
  }, [isAuthenticated, isBootstrapped, navigate]);

  if (!isBootstrapped || !isAuthenticated) return null;

  const isSaving = updatePasswordMutation.isPending;

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      setSuccess(null);
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      setSuccess(null);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password confirmation does not match');
      setSuccess(null);
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await updatePasswordMutation.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated successfully');
    } catch (mutationError) {
      const errorWithMessage = mutationError as { response?: { data?: { message?: string } }; message?: string };
      setError(errorWithMessage.response?.data?.message ?? errorWithMessage.message ?? 'Failed to update password');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-5 flex items-center gap-2">
        <Settings size={18} className="text-[#3dc9b0]" />
        <div>
          <h1 className="text-xl font-semibold text-white">Settings</h1>
          <p className="text-sm text-[#7a8faa]">Manage admin account security</p>
        </div>
      </div>

      <div className="grid w-full max-w-7xl gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="self-start rounded-2xl border border-[#2a3a52] bg-[#1e2638] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Mail size={16} className="text-[#3dc9b0]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8ea4c2]">Admin Account</h2>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Signed in email</p>
          <p className="mt-2 break-all text-base font-semibold text-white">{admin?.email ?? 'Unknown admin'}</p>
        </section>

        <section className="rounded-2xl border border-[#2a3a52] bg-[#1e2638] p-6">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound size={16} className="text-[#3dc9b0]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8ea4c2]">Change Password</h2>
          </div>

          <form
            id="admin-password-form"
            className="grid gap-4 lg:grid-cols-2"
            autoComplete="off"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <div className="lg:col-span-2">
              <PasswordField
                label="Current password *"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showCurrentPassword}
                onToggleVisible={() => setShowCurrentPassword((value) => !value)}
                autoComplete="off"
              />
            </div>

            <PasswordField
              label="New password *"
                value={newPassword}
              onChange={setNewPassword}
              visible={showNewPassword}
              onToggleVisible={() => setShowNewPassword((value) => !value)}
              autoComplete="off"
            />

            <PasswordField
              label="Confirm new password *"
                value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showConfirmPassword}
              onToggleVisible={() => setShowConfirmPassword((value) => !value)}
              autoComplete="off"
            />
          </form>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-4">
            {error && <p className="text-xs text-red-400">{error}</p>}
            {success && <p className="text-xs text-[#3dc9b0]">{success}</p>}
            </div>

            <button
              type="submit"
              form="admin-password-form"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#3dc9b0] px-6 py-3 text-sm font-semibold text-[#1a2030] transition-colors hover:bg-[#35b09a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={15} />
              {isSaving ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
