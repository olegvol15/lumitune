import { Album, SavedAlbum } from '../models/album.model';
import { Song } from '../models/song.model';
import { ServiceError } from '../types/error/service-error';
import { ensureObjectId } from '../utils/mongoose.utils';
import type {
  AlbumCreateInput,
  AlbumDetailResult,
  AlbumListResult,
  AlbumUpdateInput,
} from '../types/album/album-service.types';
import { safeUnlink } from '../utils/file.utils';

async function hydrateTracks(trackIds: string[]) {
  if (trackIds.length === 0) {
    return [];
  }

  const tracks = await Song.find({ _id: { $in: trackIds } }).populate('albumId', 'title artistName coverImage');
  const trackById = new Map(tracks.map((track) => [String(track._id), track]));

  return trackIds
    .map((trackId) => trackById.get(trackId))
    .filter((track): track is NonNullable<typeof track> => Boolean(track));
}

async function validateTracksForAlbum(
  trackIds: string[],
  ownerUserId?: string
) {
  const uniqueTrackIds = Array.from(new Set(trackIds.filter(Boolean)));
  uniqueTrackIds.forEach((trackId) => ensureObjectId(trackId, 'trackId'));

  const tracks = await Song.find({ _id: { $in: uniqueTrackIds } });
  if (tracks.length !== uniqueTrackIds.length) {
    throw new ServiceError(404, 'One or more tracks were not found');
  }

  if (ownerUserId) {
    const invalidTrack = tracks.find((track) => String(track.uploadedBy) !== ownerUserId);
    if (invalidTrack) {
      throw new ServiceError(403, 'You can only attach your own uploaded tracks');
    }
  }

  const normalizedArtists = new Set(
    tracks.map((track) => track.artist.trim().toLowerCase()).filter(Boolean)
  );
  if (normalizedArtists.size > 1) {
    throw new ServiceError(400, 'Albums can only contain tracks from one artist');
  }

  return tracks;
}

async function recalculateAlbumStats(albumId: string) {
  const album = await Album.findById(albumId);
  if (!album) return;
  const orderedTracks = await hydrateTracks(album.trackIds.map((trackId) => String(trackId)));
  const totalDuration = orderedTracks.reduce((sum, track) => sum + track.duration, 0);
  const trackCount = orderedTracks.length;

  await Album.findByIdAndUpdate(albumId, { totalDuration, trackCount });
}

async function syncAlbumTracks(
  albumId: string,
  title: string,
  trackIds: string[],
  previousTrackIds: string[]
) {
  const nextTrackIdSet = new Set(trackIds);
  const previousTrackIdSet = new Set(previousTrackIds);

  const removedTrackIds = previousTrackIds.filter((trackId) => !nextTrackIdSet.has(trackId));
  const addedTrackIds = trackIds.filter((trackId) => !previousTrackIdSet.has(trackId));

  if (removedTrackIds.length > 0) {
    await Song.updateMany(
      { _id: { $in: removedTrackIds }, albumId },
      { $unset: { albumId: 1 } }
    );
  }

  if (trackIds.length > 0) {
    await Song.updateMany(
      { _id: { $in: trackIds } },
      { albumId, album: title }
    );
  }

  if (addedTrackIds.length > 0) {
    const affectedAlbums = await Album.find({
      _id: { $ne: albumId },
      trackIds: { $in: addedTrackIds },
    }).select('_id');

    await Album.updateMany(
      { _id: { $ne: albumId }, trackIds: { $in: addedTrackIds } },
      { $pull: { trackIds: { $in: addedTrackIds } } }
    );

    await Promise.all(affectedAlbums.map((item) => recalculateAlbumStats(String(item._id))));
  }

  await recalculateAlbumStats(albumId);
}

export const albumService = {
  async listAlbums(userId?: string, ownerUserId?: string): Promise<AlbumListResult> {
    const filter = ownerUserId ? { artistUserId: ownerUserId } : {};
    const albums = await Album.find(filter).sort({ createdAt: -1 });

    if (!userId) {
      return { albums, savedIds: [] };
    }

    const savedRecords = await SavedAlbum.find({ userId }).select('albumId');
    return {
      albums,
      savedIds: savedRecords.map((record) => String(record.albumId)),
    };
  },

  async getAlbumById(albumId: string, userId?: string): Promise<AlbumDetailResult> {
    ensureObjectId(albumId, 'albumId');
    const album = await Album.findById(albumId);
    if (!album) {
      throw new ServiceError(404, 'Album not found');
    }

    const tracks = await hydrateTracks(album.trackIds.map((trackId) => String(trackId)));
    const saved = userId
      ? Boolean(await SavedAlbum.exists({ userId, albumId }))
      : false;

    return { album, tracks, saved };
  },

  async createAlbum(input: AlbumCreateInput) {
    const trackIds = Array.from(new Set((input.trackIds ?? []).filter(Boolean)));
    if (trackIds.length === 0) {
      throw new ServiceError(400, 'Albums must include at least one track');
    }
    const tracks = await validateTracksForAlbum(trackIds, input.ownerUserId);
    const artistName = input.artistName?.trim() || tracks[0]?.artist?.trim();

    if (!artistName) {
      throw new ServiceError(400, 'Artist name is required');
    }

    const album = await Album.create({
      title: input.title.trim(),
      artistName,
      ...(input.ownerUserId ? { artistUserId: input.ownerUserId } : {}),
      ...(input.description ? { description: input.description.trim() } : {}),
      ...(input.genre ? { genre: input.genre.trim() } : {}),
      ...(input.coverImage ? { coverImage: input.coverImage } : {}),
      ...(input.releaseDate ? { releaseDate: new Date(input.releaseDate) } : {}),
      trackIds,
      trackCount: tracks.length,
      totalDuration: tracks.reduce((sum, track) => sum + track.duration, 0),
    });

    await syncAlbumTracks(String(album._id), album.title, trackIds, []);

    return { album };
  },

  async updateAlbum(albumId: string, input: AlbumUpdateInput, ownerUserId?: string) {
    ensureObjectId(albumId, 'albumId');
    const existing = await Album.findById(albumId);
    if (!existing) {
      throw new ServiceError(404, 'Album not found');
    }

    if (ownerUserId && String(existing.artistUserId) !== ownerUserId) {
      throw new ServiceError(403, 'You can only edit your own albums');
    }

    const nextTrackIds =
      input.trackIds !== undefined
        ? Array.from(new Set(input.trackIds.filter(Boolean)))
        : existing.trackIds.map((trackId) => String(trackId));
    if (nextTrackIds.length === 0) {
      throw new ServiceError(400, 'Albums must include at least one track');
    }
    const tracks = await validateTracksForAlbum(nextTrackIds, ownerUserId || undefined);

    const title = input.title?.trim() || existing.title;
    const artistName = input.artistName?.trim() || tracks[0]?.artist?.trim() || existing.artistName;

    if (!artistName) {
      throw new ServiceError(400, 'Artist name is required');
    }

    if (
      input.coverImage &&
      typeof existing.coverImage === 'string' &&
      existing.coverImage.startsWith('uploads/')
    ) {
      safeUnlink(existing.coverImage);
    }

    const album = await Album.findByIdAndUpdate(
      albumId,
      {
        title,
        artistName,
        ...(input.description !== undefined ? { description: input.description.trim() } : {}),
        ...(input.genre !== undefined ? { genre: input.genre.trim() } : {}),
        ...(input.coverImage ? { coverImage: input.coverImage } : {}),
        ...(input.releaseDate !== undefined
          ? { releaseDate: input.releaseDate ? new Date(input.releaseDate) : null }
          : {}),
        trackIds: nextTrackIds,
      },
      { new: true }
    );

    if (!album) {
      throw new ServiceError(404, 'Album not found');
    }

    await syncAlbumTracks(
      albumId,
      title,
      nextTrackIds,
      existing.trackIds.map((trackId) => String(trackId))
    );

    return { album };
  },

  async deleteAlbum(albumId: string, ownerUserId?: string) {
    ensureObjectId(albumId, 'albumId');
    const album = await Album.findById(albumId);
    if (!album) {
      throw new ServiceError(404, 'Album not found');
    }

    if (ownerUserId && String(album.artistUserId) !== ownerUserId) {
      throw new ServiceError(403, 'You can only delete your own albums');
    }

    await Promise.all([
      Song.updateMany({ albumId }, { $unset: { albumId: 1 } }),
      SavedAlbum.deleteMany({ albumId }),
    ]);

    if (typeof album.coverImage === 'string' && album.coverImage.startsWith('uploads/')) {
      safeUnlink(album.coverImage);
    }

    await Album.findByIdAndDelete(albumId);
  },

  async listSavedAlbums(userId: string) {
    const saved = await SavedAlbum.find({ userId }).sort({ savedAt: -1 }).populate('albumId');
    return { albums: saved.map((record) => record.albumId) };
  },

  async saveAlbum(userId: string, albumId: string) {
    ensureObjectId(albumId, 'albumId');
    const album = await Album.findById(albumId);
    if (!album) {
      throw new ServiceError(404, 'Album not found');
    }

    await SavedAlbum.findOneAndUpdate(
      { userId, albumId },
      { savedAt: new Date() },
      { upsert: true }
    );

    return { saved: true };
  },

  async unsaveAlbum(userId: string, albumId: string) {
    ensureObjectId(albumId, 'albumId');
    await SavedAlbum.findOneAndDelete({ userId, albumId });
    return { saved: false };
  },
};
