import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQueries } from '@tanstack/react-query';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Mic, Search, UserRound } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useAudiobooksQuery } from '../../hooks/audiobooks';
import { usePodcastsQuery } from '../../hooks/podcasts';
import { formatLongDuration } from '../../utils/format';
import type { Audiobook, Podcast } from '../../types';
import podcastsApi from '../../api/podcastsApi';

export const Route = createFileRoute('/admin/authors')({ component: AdminAuthorsPage });

const thClass =
  'px-3 py-3 text-left text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
const thCenterClass =
  'px-3 py-3 text-center text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
const tdClass = 'px-3 py-3 text-sm text-white whitespace-nowrap';
const tdMutedCenter = 'px-3 py-3 text-sm text-[#7a8faa] whitespace-nowrap text-center';

type DerivedAuthor = {
  key: string;
  name: string;
  podcasts: Podcast[];
  audiobooks: Audiobook[];
  podcastCount: number;
  audiobookCount: number;
  totalItems: number;
  totalChapterCount: number;
  titleIndex: string[];
  coverUrl?: string;
};

function normalizeAuthorName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function deriveAuthors(podcasts: Podcast[], audiobooks: Audiobook[]) {
  const map = new Map<string, DerivedAuthor>();

  const ensureAuthor = (name: string, coverUrl?: string) => {
    const normalized = normalizeAuthorName(name);
    if (!normalized) return null;

    const existing = map.get(normalized);
    if (existing) {
      if (!existing.coverUrl && coverUrl) existing.coverUrl = coverUrl;
      return existing;
    }

    const next: DerivedAuthor = {
      key: normalized,
      name: name.trim(),
      podcasts: [],
      audiobooks: [],
      podcastCount: 0,
      audiobookCount: 0,
      totalItems: 0,
      totalChapterCount: 0,
      titleIndex: [],
      coverUrl,
    };
    map.set(normalized, next);
    return next;
  };

  podcasts.forEach((podcast) => {
    const author = ensureAuthor(podcast.author, podcast.coverUrl);
    if (!author) return;
    author.podcasts.push(podcast);
    author.podcastCount += 1;
    author.totalItems += 1;
    author.titleIndex.push(podcast.title);
  });

  audiobooks.forEach((audiobook) => {
    const author = ensureAuthor(audiobook.author, audiobook.coverUrl);
    if (!author) return;
    author.audiobooks.push(audiobook);
    author.audiobookCount += 1;
    author.totalItems += 1;
    author.totalChapterCount += audiobook.chapterCount;
    author.titleIndex.push(audiobook.title);
  });

  return Array.from(map.values()).sort((left, right) => left.name.localeCompare(right.name));
}

function AuthorDetailsPanel({ author }: { author: DerivedAuthor }) {
  const navigate = useNavigate();
  const podcastDetails = useQueries({
    queries: author.podcasts.map((podcast) => ({
      queryKey: ['podcast', 'detail', podcast.id],
      queryFn: () => podcastsApi.getById(podcast.id),
    })),
  });

  const podcastItems = author.podcasts.map((podcast, index) => ({
    podcast,
    detail: podcastDetails[index]?.data,
    isLoading: podcastDetails[index]?.isLoading ?? false,
    error:
      podcastDetails[index]?.error instanceof Error ? podcastDetails[index].error.message : null,
  }));

  const totalEpisodeCount = podcastItems.reduce(
    (sum, item) => sum + (item.detail?.episodes?.length ?? 0),
    0
  );

  return (
    <tr>
      <td colSpan={6} className="px-0 pb-0">
        <div className="mx-3 mb-3 overflow-hidden rounded-xl border border-[#2a3a52] bg-[#151d2e]">
          <div className="flex items-center justify-between border-b border-[#2a3a52] px-4 py-2.5">
            <div>
              <span className="text-[#7a8faa] text-xs font-semibold uppercase tracking-wide">
                Author Overview — {author.name}
              </span>
              <p className="mt-1 text-xs text-[#5f7391]">
                {author.totalItems} items · {author.podcastCount} podcasts · {author.audiobookCount} audiobooks · {totalEpisodeCount} episodes · {author.totalChapterCount} chapters
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate({ to: '/admin/podcasts' })}
                className="flex items-center gap-1.5 rounded-lg bg-[#253050] px-3 py-1.5 text-xs font-semibold text-[#d8e4f2] transition-colors hover:bg-[#304066]"
              >
                <Mic size={13} />
                Podcasts
              </button>
              <button
                onClick={() => navigate({ to: '/admin/audiobooks' })}
                className="flex items-center gap-1.5 rounded-lg bg-[#3dc9b0] px-3 py-1.5 text-xs font-semibold text-[#1a2030] transition-colors hover:bg-[#35b09a]"
              >
                <BookOpen size={13} />
                Audiobooks
              </button>
            </div>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-[#2a3a52] bg-[#19233a]">
              <div className="border-b border-[#2a3a52] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Podcasts</p>
              </div>
              {author.podcasts.length === 0 ? (
                <div className="px-4 py-4 text-sm text-[#7a8faa]">No podcasts for this author.</div>
              ) : (
                <div className="divide-y divide-[#2a3a52]">
                  {podcastItems.map(({ podcast, detail, isLoading, error }) => (
                    <div key={podcast.id} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={podcast.coverUrl}
                          alt={podcast.title}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">{podcast.title}</p>
                              <p className="mt-1 truncate text-xs text-[#7a8faa]">
                                {podcast.category || 'No category'}
                              </p>
                            </div>
                            <button
                              onClick={() => navigate({ to: '/admin/podcasts' })}
                              className="rounded-lg border border-[#2a3a52] px-2.5 py-1 text-xs font-semibold text-[#d8e4f2] transition-colors hover:bg-[#253050]"
                            >
                              Manage
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-3 text-xs text-[#5f7391]">
                            <span>
                              {isLoading
                                ? 'Loading episodes…'
                                : error
                                  ? error
                                  : `${detail?.episodes?.length ?? 0} episodes`}
                            </span>
                            {detail?.episodes?.length ? (
                              <span>
                                {formatLongDuration(
                                  detail.episodes.reduce((sum, episode) => sum + episode.duration, 0)
                                )}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-[#2a3a52] bg-[#19233a]">
              <div className="border-b border-[#2a3a52] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Audiobooks</p>
              </div>
              {author.audiobooks.length === 0 ? (
                <div className="px-4 py-4 text-sm text-[#7a8faa]">No audiobooks for this author.</div>
              ) : (
                <div className="divide-y divide-[#2a3a52]">
                  {author.audiobooks.map((audiobook) => (
                    <div key={audiobook.id} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={audiobook.coverUrl}
                          alt={audiobook.title}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">{audiobook.title}</p>
                              <p className="mt-1 truncate text-xs text-[#7a8faa]">
                                {audiobook.genre || 'No genre'}
                              </p>
                            </div>
                            <button
                              onClick={() => navigate({ to: '/admin/audiobooks' })}
                              className="rounded-lg border border-[#2a3a52] px-2.5 py-1 text-xs font-semibold text-[#d8e4f2] transition-colors hover:bg-[#253050]"
                            >
                              Manage
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-3 text-xs text-[#5f7391]">
                            <span>{audiobook.chapterCount} chapters</span>
                            <span>{formatLongDuration(audiobook.duration)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </td>
    </tr>
  );
}

function AdminAuthorsPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const isBootstrapped = useAdminAuthStore((s) => s.isBootstrapped);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isBootstrapped && !isAuthenticated) navigate({ to: '/admin/login' });
  }, [isAuthenticated, isBootstrapped, navigate]);

  const podcastsQuery = usePodcastsQuery();
  const audiobooksQuery = useAudiobooksQuery();
  const podcasts = podcastsQuery.data ?? [];
  const audiobooks = audiobooksQuery.data ?? [];

  const authors = useMemo(() => deriveAuthors(podcasts, audiobooks), [podcasts, audiobooks]);

  const filteredAuthors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return authors;

    return authors.filter((author) =>
      [author.name, ...author.titleIndex]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [authors, query]);

  const sharedAuthors = authors.filter(
    (author) => author.podcastCount > 0 && author.audiobookCount > 0
  ).length;

  if (!isBootstrapped || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <UserRound size={18} className="text-[#3dc9b0]" />
          <div>
            <h1 className="text-white font-semibold text-xl">Authors</h1>
            <p className="text-[#7a8faa] text-sm">Podcast and audiobook authors derived from existing content</p>
          </div>
        </div>

        <div className="relative w-full max-w-sm min-w-[280px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8faa]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search authors or related titles..."
            className="w-full rounded-lg border border-[#2a3a52] bg-[#1e2638] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition-colors focus:border-[#3dc9b0]"
          />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Total Authors</p>
          <p className="text-2xl font-semibold text-white">{authors.length}</p>
        </div>
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Shared Authors</p>
          <p className="text-2xl font-semibold text-white">{sharedAuthors}</p>
        </div>
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Podcast Items</p>
          <p className="text-2xl font-semibold text-white">{podcasts.length}</p>
        </div>
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Audiobook Items</p>
          <p className="text-2xl font-semibold text-white">{audiobooks.length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#2a3a52] bg-[#1e2638]">
        {(podcastsQuery.error instanceof Error || audiobooksQuery.error instanceof Error) && (
          <div className="border-b border-[#2a3a52] px-4 py-3 text-sm text-red-300">
            {podcastsQuery.error instanceof Error
              ? podcastsQuery.error.message
              : audiobooksQuery.error instanceof Error
                ? audiobooksQuery.error.message
                : null}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-[#2a3a52]">
              <tr>
                <th className={thClass}>Author</th>
                <th className={thCenterClass}>Media Mix</th>
                <th className={thCenterClass}>Podcasts</th>
                <th className={thCenterClass}>Audiobooks</th>
                <th className={thCenterClass}>Total Items</th>
                <th className={thCenterClass}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {(podcastsQuery.isLoading || audiobooksQuery.isLoading) && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[#7a8faa]">
                    Loading authors…
                  </td>
                </tr>
              )}
              {!podcastsQuery.isLoading && !audiobooksQuery.isLoading && filteredAuthors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[#7a8faa]">
                    {authors.length === 0 ? 'No authors yet.' : 'No authors match your search.'}
                  </td>
                </tr>
              )}
              {filteredAuthors.map((author) => (
                <Fragment key={author.key}>
                  <tr
                    className={`border-t border-[#2a3a52] transition-colors ${
                      expandedId === author.key ? 'bg-[#253050]' : 'hover:bg-[#253050]/50'
                    }`}
                  >
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        {author.coverUrl ? (
                          <img
                            src={author.coverUrl}
                            alt={author.name}
                            className="h-10 w-10 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#253050] text-[#d8e4f2]">
                            <UserRound size={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{author.name}</p>
                          <p className="truncate text-xs text-[#7a8faa]">
                            {author.titleIndex.slice(0, 2).join(' · ') || 'No related titles'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={tdMutedCenter}>
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#35506b] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#b9c8da]">
                        {author.podcastCount > 0 && <Mic size={12} className="text-[#3dc9b0]" />}
                        {author.audiobookCount > 0 && <BookOpen size={12} className="text-[#3dc9b0]" />}
                        {author.podcastCount > 0 && author.audiobookCount > 0
                          ? 'Both'
                          : author.podcastCount > 0
                            ? 'Podcast'
                            : 'Audiobook'}
                      </div>
                    </td>
                    <td className={tdMutedCenter}>{author.podcastCount}</td>
                    <td className={tdMutedCenter}>{author.audiobookCount}</td>
                    <td className={tdMutedCenter}>{author.totalItems}</td>
                    <td className={tdMutedCenter}>
                      <button
                        onClick={() => setExpandedId(expandedId === author.key ? null : author.key)}
                        className="mx-auto flex items-center gap-1.5 text-xs font-medium text-[#3dc9b0] transition-colors hover:text-[#35b09a]"
                      >
                        Inspect
                        {expandedId === author.key ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </td>
                  </tr>

                  {expandedId === author.key && <AuthorDetailsPanel author={author} />}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
