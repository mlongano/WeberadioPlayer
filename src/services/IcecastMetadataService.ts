/**
 * IcecastMetadataService
 *
 * Enriches ICY metadata from the stream with cover art
 * This service ONLY handles cover art fetching, not metadata extraction
 * Metadata comes directly from TrackPlayer's ICY metadata events
 */

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
   * Fetch cover art from various sources
   */
  private async fetchCoverArt(
    artist: string,
    title: string,
    album: string
  ): Promise<string | null> {
    // Try iTunes first (fastest)
    const iTunesCover = await this.fetchITunesCover(artist, title);
    if (iTunesCover) return iTunesCover;

    // Try MusicBrainz
    const musicBrainzCover = await this.fetchMusicBrainzCover(artist, title);
    if (musicBrainzCover) return musicBrainzCover;

    return null;
  }

  /**
   * Fetch cover from iTunes API
   */
  private async fetchITunesCover(artist: string, title: string): Promise<string | null> {
    try {
      const query = `${title} ${artist}`.trim();
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`;

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
      const searchUrl = `https://musicbrainz.org/ws/2/recording/?query=artist:"${encodeURIComponent(artist)}" AND recording:"${encodeURIComponent(title)}"&fmt=json&limit=1`;

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
          const coverUrl = `https://coverartarchive.org/release/${releaseId}/front-500`;

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
