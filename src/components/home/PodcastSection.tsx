import { podcasts } from "../../data/podcasts";
import { formatLongDuration } from "../../utils/format";

export default function PodcastSection() {
  return (
    <section className="mb-10">
      <h2 className="text-[#DFF4FF] font-bold text-2xl lg:text-3xl tracking-tight mb-5">
        Нові релізи <span className="text-[#3EA9FF]">подкастів</span>
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {podcasts.map((podcast) => (
          <div
            key={podcast.id}
            className="bg-gradient-to-b from-[#102845] to-[#0A1E3A] rounded-xl px-4 py-4 border border-[#1F3F63]/80 hover:border-[#2E5D8F] transition-colors"
          >
            <div className="mb-4">
              <h3 className="text-white text-lg font-bold leading-tight">
                {podcast.title}
              </h3>
              <p className="text-[#8FA8C5] text-sm mt-1 leading-none">
                {podcast.podcastName} <span className="text-[#6C87A8]">·</span>{" "}
                <span className="text-[#C4D7EC]">
                  Consectetur adipiscing elit quisque faucib...
                </span>
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
                {podcast.publishedAt} • {formatLongDuration(podcast.duration)} •{" "}
                {podcast.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
