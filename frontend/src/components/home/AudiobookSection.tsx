import { useNavigate } from '@tanstack/react-router';
import { formatLongDuration } from '../../utils/format';
import { useAudiobooksQuery } from '../../hooks/audiobooks';

export default function AudiobookSection() {
  const navigate = useNavigate();
  const { data: audiobooks = [] } = useAudiobooksQuery();

  return (
    <section className="mb-10">
      <h2 className="text-white font-bold text-lg mb-5">
        Нові релізи <span className="text-[#1CA2EA]">Аудиокниг</span>
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
              <p className="text-white/25 text-xs mt-1">{book.chapterCount} розділів</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
