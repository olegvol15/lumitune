import { ChevronDown, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import authApi from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";
import { formatDuration } from "../../utils/format";
import Button from "../ui/Button";
import SongCoverImage from "../ui/SongCoverImage";
import type { CreatorAlbum, CreatorTrack, TrackModalMode } from "./types";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function SelectField({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full appearance-none rounded-[8px] border border-[#587c98] bg-[#497086] px-3 pr-8 text-[12px] text-[#e7f3fa] outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a8c1d4]"
      />
    </div>
  );
}

function UploadZone({
  label,
  sublabel,
  onSelect,
  compact = false,
}: {
  label: string;
  sublabel: string;
  onSelect: (file: File) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={[
          "flex w-full flex-col items-center justify-center rounded-[10px] border border-dashed border-[#4f7592] text-[#6b8ca8] transition hover:bg-[#294455]",
          compact ? "h-[78px]" : "h-[98px]",
        ].join(" ")}
      >
        <Upload size={compact ? 18 : 22} />
        <span className="mt-1.5 text-[12px]">{label}</span>
        <span className="mt-1 text-[9px] opacity-70">{sublabel}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={compact ? "image/*" : "audio/*,image/*"}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
        }}
      />
    </>
  );
}

function BaseCreatorModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[272px] rounded-[18px] bg-[#233b47] px-6 py-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:max-w-[300px]">
        <div className="mb-5 flex items-start justify-between">
          <h3 className="text-[14px] font-semibold text-[#eaf6ff]">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            shape="pill"
            onClick={onClose}
            className="!h-6 !w-6 !rounded-full !p-0 !text-[#9fc4df] hover:!bg-white/5"
          >
            <X size={14} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function TrackEditorModal({
  open,
  mode,
  initialTrack,
  fallbackCover,
  genres,
  moods,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: TrackModalMode;
  initialTrack?: CreatorTrack;
  fallbackCover: string;
  genres: string[];
  moods: string[];
  onClose: () => void;
  onSave: (track: CreatorTrack) => void;
}) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [coverImage, setCoverImage] = useState(fallbackCover);
  const [audioFileName, setAudioFileName] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initialTrack) {
      setTitle(initialTrack.title);
      setGenre(initialTrack.genre);
      setMood(initialTrack.mood);
      setCoverImage(initialTrack.albumCover);
      setAudioFileName(initialTrack.audioFileName || initialTrack.title);
      return;
    }

    setTitle("");
    setGenre("");
    setMood("");
    setCoverImage(fallbackCover);
    setAudioFileName("");
  }, [fallbackCover, initialTrack, open]);

  if (!open) return null;

  return (
    <BaseCreatorModal
      title={mode === "create" ? "Завантаження треку" : "Редагування треку"}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-[#d8ecf8]">
            Назва треку
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Назва треку"
            className="h-8 w-full rounded-[7px] border border-[#5f84a0] bg-[#4a7187] px-3 text-[11px] text-[#ebf5fb] outline-none placeholder:text-[#b8cedd]/50"
          />
        </div>

        <UploadZone
          label="Перетягніть аудіофайл або завантажте"
          sublabel={audioFileName || "Аудіо"}
          onSelect={(file) => setAudioFileName(file.name)}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[#d8ecf8]">
              Жанр
            </label>
            <SelectField
              value={genre}
              options={genres}
              placeholder="Жанр"
              onChange={setGenre}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[#d8ecf8]">
              Настрій
            </label>
            <SelectField
              value={mood}
              options={moods}
              placeholder="Настрій"
              onChange={setMood}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            variant="auth-outline"
            size="sm"
            shape="rect"
            onClick={onClose}
            className="rounded-[7px] border-[#31566f] bg-[#163342] px-2 py-2 text-[10px] text-[#9fc8e0] hover:bg-[#1b3d4f]"
          >
            Зберегти як чернетку
          </Button>
          <Button
            variant="primary"
            size="sm"
            shape="rect"
            onClick={() =>
              onSave({
                id: initialTrack?.id || `creator-track-${Date.now()}`,
                title: title || "Новий трек",
                artistName: initialTrack?.artistName || "OLEH",
                albumCover: coverImage,
                duration: initialTrack?.duration || 182,
                genre: genre || genres[0],
                mood: mood || moods[0],
                audioFileName,
                releaseDate: initialTrack?.releaseDate || "12.11.2012",
                likes: initialTrack?.likes || 235,
              })
            }
            className="rounded-[7px] bg-[#80c8eb] px-2 py-2 text-[10px] font-semibold text-[#123042] hover:bg-[#93d3f1]"
          >
            {mode === "create" ? "Опублікувати" : "Зберегти"}
          </Button>
        </div>
      </div>
    </BaseCreatorModal>
  );
}

export function AlbumUploadModal({
  open,
  tracks,
  fallbackCover,
  onClose,
  onSave,
}: {
  open: boolean;
  tracks: CreatorTrack[];
  fallbackCover: string;
  onClose: () => void;
  onSave: (album: CreatorAlbum) => void;
}) {
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState(fallbackCover);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setCoverImage(fallbackCover);
    setSelectedTrackIds(tracks[0] ? [tracks[0].id] : []);
  }, [fallbackCover, open, tracks]);

  if (!open) return null;

  const selectedTracks = tracks.filter((track) => selectedTrackIds.includes(track.id));

  return (
    <BaseCreatorModal title="Завантаження альбому" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-[#d8ecf8]">
            Назва альбому
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Назва альбому"
            className="h-8 w-full rounded-[7px] border border-[#5f84a0] bg-[#4a7187] px-3 text-[11px] text-[#ebf5fb] outline-none placeholder:text-[#b8cedd]/50"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-[11px] font-semibold text-[#d8ecf8]">
              Додати треки
            </label>
            <span className="text-[12px] text-[#9ec7df]">+</span>
          </div>
          <div className="space-y-1.5">
            {selectedTracks.map((track, index) => (
              <div
                key={track.id}
                className="grid grid-cols-[14px_28px_minmax(0,1fr)_30px] items-center gap-2 rounded-[8px] bg-[#35576a] px-2 py-1.5"
              >
                <span className="text-[10px] text-white">{index + 1}</span>
                <SongCoverImage
                  src={track.albumCover}
                  alt={track.title}
                  className="h-7 w-7 rounded-md object-cover"
                />
                <div className="min-w-0">
                  <div className="truncate text-[10px] font-semibold text-white">
                    {track.title}
                  </div>
                  <div className="truncate text-[8px] text-[#bfd0db]">
                    {track.artistName}
                  </div>
                </div>
                <span className="text-[9px] text-[#b5c8d7]">
                  {formatDuration(track.duration)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <SelectField
              value=""
              options={tracks.map((track) => track.title)}
              placeholder="Додати трек"
              onChange={(value) => {
                const match = tracks.find((track) => track.title === value);
                if (match && !selectedTrackIds.includes(match.id)) {
                  setSelectedTrackIds((prev) => [...prev, match.id]);
                }
              }}
            />
          </div>
        </div>

        <UploadZone
          label="Обкладинка"
          sublabel="Зображення"
          compact
          onSelect={async (file) => {
            const dataUrl = await fileToDataUrl(file);
            setCoverImage(dataUrl);
          }}
        />

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            variant="auth-outline"
            size="sm"
            shape="rect"
            onClick={onClose}
            className="rounded-[7px] border-[#31566f] bg-[#163342] px-2 py-2 text-[10px] text-[#9fc8e0] hover:bg-[#1b3d4f]"
          >
            Зберегти як чернетку
          </Button>
          <Button
            variant="primary"
            size="sm"
            shape="rect"
            onClick={() =>
              onSave({
                id: `creator-album-${Date.now()}`,
                title: title || "Новий альбом",
                coverImage,
                trackIds: selectedTrackIds,
              })
            }
            className="rounded-[7px] bg-[#80c8eb] px-2 py-2 text-[10px] font-semibold text-[#123042] hover:bg-[#93d3f1]"
          >
            Опублікувати
          </Button>
        </div>
      </div>
    </BaseCreatorModal>
  );
}

export function EditProfileModal({
  open,
  fallbackAvatar,
  fallbackCover,
  onClose,
}: {
  open: boolean;
  fallbackAvatar: string;
  fallbackCover: string;
  onClose: () => void;
}) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(
    user?.bio ||
      "Вітаю всіх! Дякую, що завітали на мою сторінку. Тут ви знайдете мою музику, емоції та натхнення.",
  );
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture && user.profilePicture !== "default-avatar.png"
      ? user.profilePicture
      : fallbackAvatar,
  );
  const [coverImage, setCoverImage] = useState(user?.coverImage || fallbackCover);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    setDisplayName(user.displayName || "");
    setBio(
      user.bio ||
        "Вітаю всіх! Дякую, що завітали на мою сторінку. Тут ви знайдете мою музику, емоції та натхнення.",
    );
    setProfilePicture(
      user.profilePicture && user.profilePicture !== "default-avatar.png"
        ? user.profilePicture
        : fallbackAvatar,
    );
    setCoverImage(user.coverImage || fallbackCover);
  }, [fallbackAvatar, fallbackCover, open, user]);

  if (!open || !user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const { data } = await authApi.updateProfile({
        displayName,
        bio,
        profilePicture,
        coverImage,
      });
      setUser(data.user);
      onClose();
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Не вдалося оновити профіль");
    } finally {
      setIsSaving(false);
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
              <Upload size={18} />
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
              <span className="mb-2 block text-[15px] font-semibold text-[#e5f2fc]">
                Нікнейм
              </span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="h-[56px] w-full rounded-[16px] border border-[#6e96b5] bg-[#587b93] px-4 text-[15px] text-[#e7f5ff] outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[15px] font-semibold text-[#e5f2fc]">
                Опис
              </span>
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
                loading={isSaving}
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
