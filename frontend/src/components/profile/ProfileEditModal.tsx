import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useUpdateProfileMutation } from '../../hooks/auth';
import type { ProfileEditModalProps } from '../../types/profile/profile.types';
import { useAuthStore } from '../../store/authStore';
import { fileToDataUrl } from '../../utils/file.utils';
import Button from '../ui/Button';

export default function ProfileEditModal({
  open,
  fallbackAvatar,
  fallbackCover,
  onClose,
}: ProfileEditModalProps) {
  const user = useAuthStore((state) => state.user);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(
    user?.bio ||
      'Вітаю всіх! Дякую, що завітали на мою сторінку. Тут ви знайдете мою музику, емоції та натхнення.'
  );
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture && user.profilePicture !== 'default-avatar.png'
      ? user.profilePicture
      : fallbackAvatar
  );
  const [coverImage, setCoverImage] = useState(user?.coverImage || fallbackCover);
  const [error, setError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const updateProfileMutation = useUpdateProfileMutation();

  useEffect(() => {
    if (!open || !user) return;
    setDisplayName(user.displayName || '');
    setBio(
      user.bio ||
        'Вітаю всіх! Дякую, що завітали на мою сторінку. Тут ви знайдете мою музику, емоції та натхнення.'
    );
    setProfilePicture(
      user.profilePicture && user.profilePicture !== 'default-avatar.png'
        ? user.profilePicture
        : fallbackAvatar
    );
    setCoverImage(user.coverImage || fallbackCover);
  }, [fallbackAvatar, fallbackCover, open, user]);

  if (!open || !user) return null;

  const handleSave = async () => {
    setError(null);

    try {
      await updateProfileMutation.mutateAsync({
        displayName,
        bio,
        profilePicture,
        coverImage,
      });
      onClose();
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? 'Не вдалося оновити профіль');
    }
  };

  return (
    <div className="fixed inset-0 z-[84] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[700px] rounded-[22px] bg-[#233b47] px-8 py-7 shadow-[0_24px_64px_rgba(0,0,0,0.36)]">
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-white">
            Редагування профіля
          </h2>
          <Button
            variant="ghost"
            size="sm"
            shape="pill"
            onClick={onClose}
            className="!h-7 !w-7 !rounded-full !p-0 !text-[#9fd5e8] hover:!bg-white/5"
          >
            <X size={16} />
          </Button>
        </div>

        <div className="grid gap-7 lg:grid-cols-[150px_minmax(0,1fr)]">
          <div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="overflow-hidden rounded-full shadow-[0_14px_30px_rgba(0,0,0,0.28)]"
            >
              <img
                src={profilePicture}
                alt={displayName}
                className="h-[118px] w-[118px] rounded-full object-cover"
              />
            </button>

            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="mt-6 flex h-[72px] w-[138px] flex-col items-center justify-center rounded-[12px] border border-dashed border-[#6f9abe] bg-[#1d3240] text-[#7ea3c4] transition hover:bg-[#274355]"
            >
              <span className="text-[18px]">↑</span>
              <span className="mt-1.5 text-[12px]">Обкладинка</span>
            </button>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setProfilePicture(await fileToDataUrl(file));
              }}
            />
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setCoverImage(await fileToDataUrl(file));
              }}
            />
          </div>

          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-[15px] font-semibold text-[#e5f2fc]">Нікнейм</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="h-[56px] w-full rounded-[16px] border border-[#6e96b5] bg-[#587b93] px-4 text-[15px] text-[#e7f5ff] outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[15px] font-semibold text-[#e5f2fc]">Опис</span>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={4}
                className="w-full rounded-[16px] border border-[#6e96b5] bg-[#587b93] px-4 py-3 text-[13px] italic leading-7 text-[#e7f5ff] outline-none"
              />
            </label>

            {error ? <p className="text-xs text-red-200">{error}</p> : null}

            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                shape="rect"
                loading={updateProfileMutation.isPending}
                onClick={() => void handleSave()}
                className="min-w-[146px] rounded-[12px] bg-[#7bc7ea] px-6 py-2.5 text-[14px] font-semibold text-[#0d2330] hover:bg-[#90d5f3]"
              >
                Зберегти
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
