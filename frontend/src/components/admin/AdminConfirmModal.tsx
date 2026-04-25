import type { ReactNode } from 'react';

type Props = {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  tone?: 'danger' | 'default';
};

export default function AdminConfirmModal({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  tone = 'danger',
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-[#1e2638] shadow-2xl">
        <div className="px-6 py-5">
          <h2 className="mb-2 text-base font-semibold text-white">{title}</h2>
          <div className="text-sm text-[#7a8faa]">{description}</div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#2a3a52] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#2a3a52] px-5 py-2 text-sm font-semibold text-white hover:bg-[#354a62] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
              tone === 'danger'
                ? 'bg-[#f07282] text-white hover:bg-[#d9606f]'
                : 'bg-[#3dc9b0] text-[#1a2030] hover:bg-[#35b09a]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
