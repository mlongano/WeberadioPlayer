// Strapi v5 native format (flat, no attributes wrapper, no data wrapper on relations)

export type ImageQuery = {
  id: number;
  url: string;
  caption: string | null;
  hash: string;
  ext: string;
  width: number;
  height: number;
  size: number;
};

type AudioQuery = {
  id: number;
  caption: string | null;
  url: string;
};

export type SchoolQuery = {
  id: number;
  name: string;
  short_name: string;
  slug: string;
  description?: string;
};

type PodcastQuery = {
  id: number;
  title: string;
  slug: string;
  date: string;
  description: string;
  schools: SchoolQuery[];
  cover: ImageQuery | null;
};

// Strapi v5 returns flat episode objects
export type EpisodeQuery = {
  id: number;
  title: string;
  slug: string;
  date: string;
  description: string;
  episode_number: number;
  spreaker_id: number | null;
  spreaker_limited: boolean;
  tags: TagQuery[];
  cover: ImageQuery | null;
  audio: AudioQuery | null;
  schools: SchoolQuery[];
  podcast: PodcastQuery | null;
};

export type Episode = {
  id: number;
  title: string;
  slug: string;
  date: string;
  description: string;
  episode_number: number;
  spreaker_id: number | null;
  spreaker_limited: boolean;
  tags: string[];
  coverImageUrl: string;
  audioUrl: string;
  schools: School[];
  podcast: Podcast;
};

export type School = {
  id: number;
  name: string;
  short_name: string;
  slug: string;
};

export type Podcast = {
  id: number;
  title: string;
  slug: string;
  date: string;
  description: string;
  schools: School[];
  coverImageUrl: string;
};

/** Generic Strapi query object passed to strapiFetch */
export type StrapiQuery = Record<string, unknown>;

/** Generic Strapi v5 list response */
export interface StrapiResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/** Tag entry in Strapi v5 response */
export type TagQuery = {
  id: number;
  name: string;
};

/** Post attributes from Strapi v5 (flat) */
export type PostAttributes = {
  title: string;
  article: string;
  slug: string;
  subtitle: string;
  date: string;
  image: ImageQuery | null;
};

/** Post entry from Strapi v5 (flat, no attributes wrapper) */
export type PostQuery = {
  id: number;
  title: string;
  article: string;
  slug: string;
  subtitle: string;
  date: string;
  image: ImageQuery | null;
};

/** School with its latest episode (used in podcasts screen) */
export interface SchoolLastEpisode {
  school: {
    name: string;
    short_name: string;
    slug: string;
    description?: string;
  };
  episode: EpisodeQuery | null;
}
