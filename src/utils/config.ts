export const Config = {
  STRAPI_API_TOKEN: process.env.EXPO_PUBLIC_STRAPI_API_TOKEN,
  STRAPI_URL_BASE: process.env.EXPO_PUBLIC_STRAPI_URL_BASE,
  DEFAULT_PAGE_SIZE: process.env.EXPO_PUBLIC_DEFAULT_PAGE_SIZE,
  DISCOGS_KEY: process.env.EXPO_PUBLIC_DISCOGS_KEY,
  DISCOGS_SECRET: process.env.EXPO_PUBLIC_DISCOGS_SECRET,
};

// Cover Art API URLs (public APIs, no authentication needed except Discogs)
export const CoverArtAPIs = {
  ITUNES_SEARCH: 'https://itunes.apple.com/search',
  MUSICBRAINZ_SEARCH: 'https://musicbrainz.org/ws/2/recording/',
  COVERART_ARCHIVE: 'https://coverartarchive.org/release',
  DISCOGS_SEARCH: 'https://api.discogs.com/database/search',
};
