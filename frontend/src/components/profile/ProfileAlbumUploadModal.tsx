import { useEffect, useState } from 'react';
import type { ProfileAlbumUploadModalProps } from '../../types/profile/profile.types';
import { fileToDataUrl } from '../../utils/file.utils';
import { formatDuration } from '../../utils/format';
import Button from '../ui/Button';
import SongCoverImage from '../ui/SongCoverImage';
import ProfileCreatorModal from './ProfileCreatorModal';
import ProfileSelectField from './ProfileSelectField';
import ProfileUploadZone from './ProfileUploadZone';

export default function ProfileAlbumUploadModal({
  open,
  tracks,
  fallbackCover,
  onClose,
  onSave,
}: ProfileAlbumUploadModalProps) {
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState(fallbackCover);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setCoverImage(fallbackCover);
    setCoverFile(null);
    setSelectedTrackIds(tracks[0] ? [tracks[0].id] : []);
  }, [fallbackCover, open, tracks]);

  const selectedTracks = tracks.filter((track) => selectedTrackIds.includes(track.id));

  return (
    <ProfileCreatorModal open={open} title="Завантаження альбому" onClose={onClose}>
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
            <label className="block text-[11px] font-semibold text-[#d8ecf8]">Додати треки</label>
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
                  <div className="truncate text-[10px] font-semibold text-white">{track.title}</div>
                  <div className="truncate text-[8px] text-[#bfd0db]">{track.artistName}</div>
                </div>
                <span className="text-[9px] text-[#b5c8d7]">{formatDuration(track.duration)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <ProfileSelectField
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

        <ProfileUploadZone
          label="Обкладинка"
          sublabel="Зображення"
          compact
          onSelect={async (file) => {
            setCoverFile(file);
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
                title: title || 'Новий альбом',
                coverImage,
                coverFile,
                trackIds: selectedTrackIds,
              })
            }
            className="rounded-[7px] bg-[#80c8eb] px-2 py-2 text-[10px] font-semibold text-[#123042] hover:bg-[#93d3f1]"
          >
            Опублікувати
          </Button>
        </div>
      </div>
    </ProfileCreatorModal>
  );
}
