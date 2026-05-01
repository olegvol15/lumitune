import { useState } from 'react';
import type { CreatorTrack, ProfileTrackEditorModalProps } from '../../types/profile/profile.types';
import { useI18n } from '../../lib/i18n';
import Button from '../ui/Button';
import ProfileCreatorModal from './ProfileCreatorModal';
import ProfileSelectField from './ProfileSelectField';
import ProfileUploadZone from './ProfileUploadZone';

export default function ProfileTrackEditorModal({
  open,
  mode,
  initialTrack,
  fallbackCover,
  artistName,
  genres,
  moods,
  onClose,
  onSave,
}: ProfileTrackEditorModalProps) {
  const { copy } = useI18n();

  return (
    <ProfileCreatorModal
      open={open}
      title={mode === 'create' ? copy.profile.uploadTrackTitle : copy.profile.editTrackTitle}
      onClose={onClose}
    >
      {open && (
        <ProfileTrackEditorFields
          key={`${mode}-${initialTrack?.id ?? 'new'}`}
          mode={mode}
          initialTrack={initialTrack}
          fallbackCover={fallbackCover}
          artistName={artistName}
          genres={genres}
          moods={moods}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </ProfileCreatorModal>
  );
}

function ProfileTrackEditorFields({
  mode,
  initialTrack,
  fallbackCover,
  artistName,
  genres,
  moods,
  onClose,
  onSave,
}: {
  mode: ProfileTrackEditorModalProps['mode'];
  initialTrack?: CreatorTrack;
  fallbackCover: string;
  artistName: string;
  genres: string[];
  moods: string[];
  onClose: () => void;
  onSave: ProfileTrackEditorModalProps['onSave'];
}) {
  const { copy } = useI18n();
  const [title, setTitle] = useState(initialTrack?.title ?? '');
  const [genre, setGenre] = useState(initialTrack?.genre ?? '');
  const [mood, setMood] = useState(initialTrack?.mood ?? '');
  const [coverImage] = useState(initialTrack?.albumCover ?? fallbackCover);
  const [audioFileName, setAudioFileName] = useState(initialTrack?.audioFileName || initialTrack?.title || '');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile] = useState<File | null>(null);

  return (
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-[#d8ecf8]">
            {copy.profile.trackTitle}
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={copy.profile.trackTitle}
            className="h-8 w-full rounded-[7px] border border-[#5f84a0] bg-[#4a7187] px-3 text-[11px] text-[#ebf5fb] outline-none placeholder:text-[#b8cedd]/50"
          />
        </div>

        <ProfileUploadZone
          label={copy.profile.dragAudio}
          sublabel={audioFileName || copy.profile.audio}
          onSelect={(file) => {
            setAudioFile(file);
            setAudioFileName(file.name);
          }}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[#d8ecf8]">
              {copy.common.genre}
            </label>
            <ProfileSelectField
              value={genre}
              options={genres}
              placeholder={copy.common.genre}
              onChange={setGenre}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[#d8ecf8]">
              {copy.common.mood}
            </label>
            <ProfileSelectField
              value={mood}
              options={moods}
              placeholder={copy.common.mood}
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
            {copy.profile.saveAsDraft}
          </Button>
          <Button
            variant="primary"
            size="sm"
            shape="rect"
            onClick={() =>
              onSave({
                id: initialTrack?.id,
                title: title || copy.profile.newTrack,
                artistName: initialTrack?.artistName || artistName,
                albumCover: coverImage,
                genre: genre || '',
                mood: mood || '',
                audioFile,
                audioFileName,
                coverFile,
                releaseDate: initialTrack?.releaseDate || new Date().toLocaleDateString(),
                plays: initialTrack?.plays || 0,
              })
            }
            className="rounded-[7px] bg-[#80c8eb] px-2 py-2 text-[10px] font-semibold text-[#123042] hover:bg-[#93d3f1]"
          >
            {mode === 'create' ? copy.profile.publish : copy.common.save}
          </Button>
        </div>
      </div>
  );
}
