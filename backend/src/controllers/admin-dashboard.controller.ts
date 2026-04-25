import { Request, Response } from 'express';
import { Album } from '../models/album.model';
import { Audiobook } from '../models/audiobook.model';
import { Podcast } from '../models/podcast.model';
import { Song } from '../models/song.model';
import { User } from '../models/user.model';
import { getErrorMessage } from '../utils/error.utils';

type MonthlyPoint = {
  month: string;
  tracks: number;
  albums: number;
  podcasts: number;
  audiobooks: number;
};

function buildMonthBuckets(monthsBack: number) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsBack - 1), 1));

  return Array.from({ length: monthsBack }, (_, index) => {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    const month = date.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
      timeZone: 'UTC',
    });
    return { key, month, startAt: date };
  });
}

async function aggregateMonthlyCounts(model: typeof Song | typeof Album | typeof Podcast | typeof Audiobook) {
  return model.aggregate<{ _id: { year: number; month: number }; count: number }>([
    {
      $match: {
        createdAt: { $type: 'date' },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
  ]);
}

export const getAdminDashboard = async (_req: Request, res: Response) => {
  try {
    const monthBuckets = buildMonthBuckets(12);
    const firstMonthStart = monthBuckets[0]?.startAt ?? new Date();

    const [
      totalUsers,
      totalCreators,
      totalTracks,
      totalAlbums,
      totalPodcasts,
      totalAudiobooks,
      trackSeries,
      albumSeries,
      podcastSeries,
      audiobookSeries,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'creator' }),
      Song.countDocuments(),
      Album.countDocuments(),
      Podcast.countDocuments(),
      Audiobook.countDocuments(),
      Song.aggregate<{ _id: { year: number; month: number }; count: number }>([
        { $match: { createdAt: { $gte: firstMonthStart, $type: 'date' } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Album.aggregate<{ _id: { year: number; month: number }; count: number }>([
        { $match: { createdAt: { $gte: firstMonthStart, $type: 'date' } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Podcast.aggregate<{ _id: { year: number; month: number }; count: number }>([
        { $match: { createdAt: { $gte: firstMonthStart, $type: 'date' } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Audiobook.aggregate<{ _id: { year: number; month: number }; count: number }>([
        { $match: { createdAt: { $gte: firstMonthStart, $type: 'date' } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const seriesToMap = (items: { _id: { year: number; month: number }; count: number }[]) =>
      new Map(items.map((item) => [`${item._id.year}-${String(item._id.month).padStart(2, '0')}`, item.count]));

    const trackMap = seriesToMap(trackSeries);
    const albumMap = seriesToMap(albumSeries);
    const podcastMap = seriesToMap(podcastSeries);
    const audiobookMap = seriesToMap(audiobookSeries);

    const monthlyContent: MonthlyPoint[] = monthBuckets.map(({ key, month }) => ({
      month,
      tracks: trackMap.get(key) ?? 0,
      albums: albumMap.get(key) ?? 0,
      podcasts: podcastMap.get(key) ?? 0,
      audiobooks: audiobookMap.get(key) ?? 0,
    }));

    res.status(200).json({
      success: true,
      totals: {
        users: totalUsers,
        creators: totalCreators,
        tracks: totalTracks,
        albums: totalAlbums,
        podcasts: totalPodcasts,
        audiobooks: totalAudiobooks,
      },
      monthlyContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error fetching dashboard data'),
    });
  }
};
