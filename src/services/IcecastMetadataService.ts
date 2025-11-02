/**
 * IcecastMetadataService
 *
 * Enriches ICY metadata from the stream with cover art
 * This service ONLY handles cover art fetching, not metadata extraction
 * Metadata comes directly from TrackPlayer's ICY metadata events
 */

import { Config, CoverArtAPIs } from '../utils/config';

export interface SongMetadata {
  title: string;
  artist: string;
  album?: string;
  year?: string;
  coverUrl?: string;
  listeners?: number;
}

class IcecastMetadataService {
  private lastMetadata: SongMetadata | null = null;
  private coverCache: Map<string, string | null> = new Map();
  private listeners: ((metadata: SongMetadata) => void)[] = [];

  /**
   * Parse ICY metadata title format: "Title - Artist - Year - Album"
   */
  parseIcyTitle(rawTitle: string): Partial<SongMetadata> {
    const parts = rawTitle.split(' - ').map(part => part.trim());

    return {
      title: parts[0] || '',
      artist: parts[1] || '',
      year: parts[2] || '',
      album: parts[3] || '',
    };
  }

  /**
   * Process ICY metadata and enrich with cover art
   */
  async processIcyMetadata(rawTitle: string): Promise<SongMetadata> {
    const parsed = this.parseIcyTitle(rawTitle);

    // Create cache key
    const cacheKey = `${parsed.title}-${parsed.artist}`.toLowerCase();

    // Check cache first
    let coverUrl = this.coverCache.get(cacheKey);

    // Fetch cover if not cached
    if (coverUrl === undefined) {
      coverUrl = await this.fetchCoverArt(
        parsed.artist || '',
        parsed.title || '',
        parsed.album || ''
      );

      // Cache the result (even if null)
      this.coverCache.set(cacheKey, coverUrl);

      // Limit cache size
      if (this.coverCache.size > 100) {
        const firstKey = this.coverCache.keys().next().value;
        if (firstKey) {
          this.coverCache.delete(firstKey);
        }
      }
    }

    const metadata: SongMetadata = {
      title: parsed.title || '',
      artist: parsed.artist || '',
      album: parsed.album || '',
      year: parsed.year || '',
      coverUrl: coverUrl || 'https://webe.radio/images/logo-light.png',
      listeners: 0,
    };

    this.lastMetadata = metadata;
    this.notifyListeners(metadata);

    return metadata;
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(metadata: SongMetadata) {
    console.log(`IcecastMetadataService: Notifying ${this.listeners.length} listeners with:`, metadata);
    this.listeners.forEach(listener => {
      try {
        listener(metadata);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }

  /**
   * Fetch cover art from various sources with three-tier fallback
   */
  private async fetchCoverArt(
    artist: string,
    title: string,
    album: string
  ): Promise<string | null> {
    // Try iTunes first (fastest, ~200ms)
    const iTunesCover = await this.fetchITunesCover(artist, title);
    if (iTunesCover) {
      console.log('Cover found via iTunes API');
      return iTunesCover;
    }

    // Try MusicBrainz second (slower, ~800ms)
    const musicBrainzCover = await this.fetchMusicBrainzCover(artist, title);
    if (musicBrainzCover) {
      console.log('Cover found via MusicBrainz API');
      return musicBrainzCover;
    }

    // Try Discogs as final fallback (slowest, ~1000ms, requires auth)
    const discogsCover = await this.fetchDiscogsCover(artist, title);
    if (discogsCover) {
      console.log('Cover found via Discogs API');
      return discogsCover;
    }

    console.log('No cover found for:', artist, '-', title);
    return null;
  }

  /**
   * Fetch cover from iTunes API
   */
  private async fetchITunesCover(artist: string, title: string): Promise<string | null> {
    try {
      const query = `${title} ${artist}`.trim();
      const url = `${CoverArtAPIs.ITUNES_SEARCH}?term=${encodeURIComponent(query)}&media=music&limit=1`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const artworkUrl = data.results[0].artworkUrl100;
        if (artworkUrl) {
          // Get higher resolution (600x600)
          return artworkUrl.replace('100x100', '600x600');
        }
      }
    } catch (error) {
      console.log('iTunes API error:', error);
    }
    return null;
  }

  /**
   * Fetch cover from MusicBrainz/Cover Art Archive
   */
  private async fetchMusicBrainzCover(artist: string, title: string): Promise<string | null> {
    try {
      // Search for recording
      const searchUrl = `${CoverArtAPIs.MUSICBRAINZ_SEARCH}?query=artist:"${encodeURIComponent(artist)}" AND recording:"${encodeURIComponent(title)}"&fmt=json&limit=1`;

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'WeBeRadioApp/1.0 ( https://webe.radio )',
        },
      });

      const data = await response.json();

      if (data.recordings && data.recordings.length > 0) {
        const recording = data.recordings[0];
        const releaseId = recording.releases?.[0]?.id;

        if (releaseId) {
          // Try to get cover art
          const coverUrl = `${CoverArtAPIs.COVERART_ARCHIVE}/${releaseId}/front-500`;

          // Check if cover exists
          const coverResponse = await fetch(coverUrl, { method: 'HEAD' });
          if (coverResponse.ok) {
            return coverUrl;
          }
        }
      }
    } catch (error) {
      console.log('MusicBrainz API error:', error);
    }
    return null;
  }

  /**
   * Fetch cover from Discogs API (requires authentication)
   */
  private async fetchDiscogsCover(artist: string, title: string): Promise<string | null> {
    // Check for required credentials
    const discogsKey = Config.DISCOGS_KEY;
    const discogsSecret = Config.DISCOGS_SECRET;

    if (!discogsKey || !discogsSecret) {
      console.log('Discogs API credentials not configured');
      return null;
    }

    try {
      // Search by artist and track
      const query = `${CoverArtAPIs.DISCOGS_SEARCH}?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&type=release&per_page=1`;

      const response = await fetch(query, {
        headers: {
          'Authorization': `Discogs key=${discogsKey}, secret=${discogsSecret}`,
          'User-Agent': 'WeBeRadioApp/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Discogs API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return null;
      }

      // Filter results for quality
      const validReleases = data.results.filter((item: any) => {
        // Skip Russian releases (often have quality issues)
        if (item.country === 'Russia') return false;

        // Skip unofficial releases
        if (item.title?.includes('Unofficial Release')) return false;

        // Skip placeholder images
        if (item.cover_image?.endsWith('spacer.gif')) return false;

        return true;
      });

      if (validReleases.length === 0) {
        return null;
      }

      const coverImage = validReleases[0].cover_image;
      console.log('Discogs cover found:', coverImage, '-', validReleases[0].title);

      return coverImage;

    } catch (error) {
      console.log('Discogs API error:', error);
      return null;
    }
  }

  /**
   * Get last known metadata
   */
  getLastMetadata(): SongMetadata | null {
    return this.lastMetadata;
  }

  /**
   * Add listener for metadata updates
   */
  addListener(callback: (metadata: SongMetadata) => void) {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   */
  removeListener(callback: (metadata: SongMetadata) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.coverCache.clear();
  }
}

export const icecastMetadataService = new IcecastMetadataService();
