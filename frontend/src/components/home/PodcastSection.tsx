import { Link } from '@tanstack/react-router';
import { usePodcastsQuery } from '../../hooks/podcasts';
import { formatLongDuration } from '../../utils/format';
import { useI18n } from '../../lib/i18n';

export default function PodcastSection() {
  const { data: podcasts = [], isLoading } = usePodcastsQuery();
  const { copy, language } = useI18n();

  if (isLoading) {
    return (
      <section className="mb-10">
        <h2 className="text-[#DFF4FF] font-bold text-2xl lg:text-3xl tracking-tight mb-5">
          {copy.home.newPodcastBefore} <span className="text-[#3EA9FF]">{copy.home.newPodcastAccent}</span>
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gradient-to-b from-[#102845] to-[#0A1E3A] rounded-xl px-4 py-4 border border-[#1F3F63]/80 animate-pulse h-[420px]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (podcasts.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <h2 className="text-[#DFF4FF] font-bold text-2xl lg:text-3xl tracking-tight mb-5">
        {copy.home.newPodcastBefore} <span className="text-[#3EA9FF]">{copy.home.newPodcastAccent}</span>
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {podcasts.slice(0, 3).map((podcast) => {
          const latestEpisode = podcast.episodes?.[0];
          return (
            <Link
              key={podcast.id}
              to="/podcast/$id"
              params={{ id: podcast.id }}
              className="bg-gradient-to-b from-[#102845] to-[#0A1E3A] rounded-xl px-4 py-4 border border-[#1F3F63]/80 hover:border-[#2E5D8F] transition-colors block"
            >
              <div className="mb-4">
                <h3 className="text-white text-lg font-bold leading-tight">{podcast.title}</h3>
                <p className="text-[#8FA8C5] text-sm mt-1 leading-none">
                  {podcast.author}
                  {podcast.category && (
                    <>
                      {' '}
                      <span className="text-[#6C87A8]">·</span>{' '}
                      <span className="text-[#C4D7EC]">{podcast.category}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="rounded-lg overflow-hidden mb-4">
                <img
                  src={podcast.coverUrl}
                  alt={podcast.title}
                  className="w-full h-[260px] object-cover"
                />
              </div>

              <div className="h-[120px] overflow-hidden">
                <p className="text-[#C2D2E8] text-sm leading-[1.45]">
                  {latestEpisode && (
                    <>
                      {new Date(latestEpisode.publishedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'uk-UA', {
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      • {formatLongDuration(latestEpisode.duration)} •{' '}
                    </>
                  )}
                  {podcast.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
