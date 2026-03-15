import { useEffect, useState } from 'react';
import type { ProfileTrackEditorModalProps } from '../../types/profile/profile.types';
import Button from '../ui/Button';
import ProfileCreatorModal from './ProfileCreatorModal';
import ProfileSelectField from './ProfileSelectField';
import ProfileUploadZone from './ProfileUploadZone';

export default function ProfileTrackEditorModal({
  open,
  mode,
  initialTrack,
  fallbackCover,
  genres,
  moods,
  onClose,
  onSave,
}: ProfileTrackEditorModalProps) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [coverImage, setCoverImage] = useState(fallbackCover);
  const [audioFileName, setAudioFileName] = useState('');

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

    setTitle('');
    setGenre('');
    setMood('');
    setCoverImage(fallbackCover);
    setAudioFileName('');
  }, [fallbackCover, initialTrack, open]);

  if (!open) return null;

  return (
    <ProfileCreatorModal
      title={mode === 'create' ? 'Завантаження треку' : 'Редагування треку'}
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

        <ProfileUploadZone
          label="Перетягніть аудіофайл або завантажте"
          sublabel={audioFileName || 'Аудіо'}
          onSelect={(file) => setAudioFileName(file.name)}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[#d8ecf8]">Жанр</label>
            <ProfileSelectField
              value={genre}
              options={genres}
              placeholder="Жанр"
              onChange={setGenre}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[#d8ecf8]">Настрій</label>
            <ProfileSelectField
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
                title: title || 'Новий трек',
                artistName: initialTrack?.artistName || 'OLEH',
                albumCover: coverImage,
                duration: initialTrack?.duration || 182,
                genre: genre || genres[0],
                mood: mood || moods[0],
                audioFileName,
                releaseDate: initialTrack?.releaseDate || '12.11.2012',
                likes: initialTrack?.likes || 235,
              })
            }
            className="rounded-[7px] bg-[#80c8eb] px-2 py-2 text-[10px] font-semibold text-[#123042] hover:bg-[#93d3f1]"
          >
            {mode === 'create' ? 'Опублікувати' : 'Зберегти'}
          </Button>
        </div>
      </div>
    </ProfileCreatorModal>
  );
}
