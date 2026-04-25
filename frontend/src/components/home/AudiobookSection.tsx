import { useNavigate } from '@tanstack/react-router';
import { formatLongDuration } from '../../utils/format';
import { useAudiobooksQuery } from '../../hooks/audiobooks';
import { useI18n } from '../../lib/i18n';

export default function AudiobookSection() {
  const navigate = useNavigate();
  const { data: audiobooks = [], isLoading } = useAudiobooksQuery();
  const { copy } = useI18n();

  if (isLoading) {
    return (
      <section className="mb-10">
        <h2 className="text-white font-bold text-lg mb-5">
          {copy.home.newAudiobookBefore} <span className="text-[#1CA2EA]">{copy.home.newAudiobookAccent}</span>
        </h2>

        <div className="bg-[#0a1929] border border-[#1a3050] rounded-xl overflow-hidden">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`flex gap-5 p-5 animate-pulse ${i > 1 ? 'border-t border-[#1a3050]' : ''}`}
            >
              <div className="w-44 h-44 rounded-lg bg-white/10 flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-3 py-1">
                <div className="h-4 w-2/3 rounded bg-white/10" />
                <div className="h-3 w-1/3 rounded bg-white/10" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-white/10" />
                  <div className="h-3 w-5/6 rounded bg-white/10" />
                  <div className="h-3 w-2/3 rounded bg-white/10" />
                </div>
                <div className="h-3 w-1/4 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (audiobooks.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <h2 className="text-white font-bold text-lg mb-5">
        {copy.home.newAudiobookBefore} <span className="text-[#1CA2EA]">{copy.home.newAudiobookAccent}</span>
      </h2>

      <div className="bg-[#0a1929] border border-[#1a3050] rounded-xl overflow-hidden">
        {audiobooks.map((book, i) => (
          <div
            key={book.id}
            onClick={() => navigate({ to: '/audiobook/$id', params: { id: book.id } })}
            className={`flex gap-5 p-5 hover:bg-white/5 cursor-pointer transition-colors ${
              i > 0 ? 'border-t border-[#1a3050]' : ''
            }`}
          >
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-44 h-44 rounded-lg object-contain bg-black/10 flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              {/* Title · Author */}
              <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                <p className="text-white text-base font-bold">{book.title}</p>
                <span className="text-white/30 text-sm">·</span>
                <p className="text-white/60 text-sm">{book.author}</p>
              </div>

              {/* Genre — plain text, no chip */}
              <p className="text-white/50 text-xs font-medium mb-2">{book.genre}</p>

              {/* Description — more lines visible */}
              <p className="text-white/30 text-xs leading-relaxed line-clamp-3 mb-3">
                {book.description}
              </p>

              {/* Date + Duration on separate lines */}
              <p className="text-white/25 text-xs">{book.publishedAt}</p>
              <p className="text-white/25 text-xs">{formatLongDuration(book.duration)}</p>
              <p className="text-white/25 text-xs mt-1">{book.chapterCount} {copy.common.chapters}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
