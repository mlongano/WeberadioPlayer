type Attributes<T> = {
  data: T;
};

type ImageQuery = {
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

type SchoolQuery = {
  id: number;
  attributes: {
    name: string;
    short_name: string;
    slug: string;
  };
};

type PodcastQuery = {
  id: number;
  attributes: {
    title: string;
    slug: string;
    date: string;
    description: string;
    schools: Attributes<School[]>;
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
  tags: Attributes<string[]>;
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

type School = {
  id: number;
  name: string;
  short_name: string;
  slug: string;
};

type Podcast = {
  id: number;
  title: string;
  slug: string;
  date: string;
  description: string;
  schools: School[];
  coverImageUrl: string;
};
