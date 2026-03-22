export type Attributes<T> = {
  data: T;
};

export type ImageQuery = {
  id: number;
  attributes: {
    url: string;
    caption: string | null;
    hash: string;
    ext: string;
    width: number;
    height: number;
    size: number;
  };
};

type AudioQuery = {
  id: number;
  attributes: {
    caption: string | null;
    url: string;
  };
};

export type SchoolQuery = {
  id: number;
  attributes: {
    name: string;
    short_name: string;
    slug: string;
    description?: string;
  };
};

type PodcastQuery = {
  id: number;
  attributes: {
    title: string;
    slug: string;
    date: string;
    description: string;
    schools: Attributes<SchoolQuery[]>;
    cover: Attributes<ImageQuery>;
  };
};

export type EpisodeAttributes = {
  title: string;
  slug: string;
  date: string;
  description: string;
  episode_number: number;
  spreaker_id: number | null;
  spreaker_limited: boolean;
  tags: Attributes<TagQuery[]>;
  cover: Attributes<ImageQuery>;
  audio: Attributes<AudioQuery>;
  schools: Attributes<SchoolQuery[]>;
  podcast: Attributes<PodcastQuery>;
};

export type EpisodeQuery = {
  id: number;
  attributes: EpisodeAttributes;
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

/** Generic Strapi list response */
export interface StrapiResponse<T> {
  data: Array<{ id: number; attributes: T }>;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/** Tag entry in Strapi response */
export type TagQuery = {
  id: number;
  attributes: { name: string };
};

/** Post attributes from Strapi */
export type PostAttributes = {
  title: string;
  article: string;
  slug: string;
  subtitle: string;
  date: string;
  image: Attributes<ImageQuery>;
};

/** Post entry from Strapi (id + attributes wrapper) */
export type PostQuery = {
  id: number;
  attributes: PostAttributes;
};

/** School with its latest episode (used in podcasts screen) */
export interface SchoolLastEpisode {
  school: {
    name: string;
    short_name: string;
    slug: string;
    description?: string;
  };
  episode: { id: number; attributes: EpisodeAttributes } | null;
}
