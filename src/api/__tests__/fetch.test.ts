import { flattenEpisode } from '../fetch';
import { EpisodeQuery } from '../types';

jest.mock('../../utils/config', () => ({
  Config: {
    STRAPI_URL_BASE: 'https://api.test.com',
  },
}));

const mockEpisodeQuery: EpisodeQuery = {
  id: 42,
  title: 'Test Episode',
  slug: 'test-episode',
  date: '2024-06-15',
  description: 'A test episode description',
  episode_number: 3,
  spreaker_id: null,
  spreaker_limited: false,
  tags: [
    { id: 1, name: 'music' },
    { id: 2, name: 'interview' },
  ],
  cover: {
    id: 10,
    url: '/uploads/cover.jpg',
    caption: null,
    hash: 'cover_hash',
    ext: '.jpg',
    width: 800,
    height: 800,
    size: 120,
  },
  audio: {
    id: 20,
    caption: null,
    url: '/uploads/episode.mp3',
  },
  schools: [
    {
      id: 100,
      name: 'Scuola Test',
      short_name: 'ST',
      slug: 'scuola-test',
    },
  ],
  podcast: {
    id: 200,
    title: 'Test Podcast',
    slug: 'test-podcast',
    date: '2024-01-01',
    description: 'Podcast desc',
    schools: [
      {
        id: 100,
        name: 'Scuola Test',
        short_name: 'ST',
        slug: 'scuola-test',
      },
    ],
    cover: {
      id: 30,
      url: '/uploads/podcast-cover.jpg',
      caption: null,
      hash: 'pc_hash',
      ext: '.jpg',
      width: 600,
      height: 600,
      size: 80,
    },
  },
};

describe('flattenEpisode', () => {
  it('maps EpisodeQuery to flat Episode structure', () => {
    const result = flattenEpisode(mockEpisodeQuery);

    expect(result.id).toBe(42);
    expect(result.title).toBe('Test Episode');
    expect(result.slug).toBe('test-episode');
    expect(result.date).toBe('2024-06-15');
    expect(result.description).toBe('A test episode description');
    expect(result.episode_number).toBe(3);
    expect(result.spreaker_id).toBeNull();
    expect(result.spreaker_limited).toBe(false);
  });

  it('extracts tag names from nested structure', () => {
    const result = flattenEpisode(mockEpisodeQuery);
    expect(result.tags).toEqual(['music', 'interview']);
  });

  it('constructs full URLs using Config.STRAPI_URL_BASE', () => {
    const result = flattenEpisode(mockEpisodeQuery);
    expect(result.coverImageUrl).toBe('https://api.test.com/uploads/cover.jpg');
    expect(result.audioUrl).toBe('https://api.test.com/uploads/episode.mp3');
  });

  it('flattens schools from Strapi wrapper format', () => {
    const result = flattenEpisode(mockEpisodeQuery);
    expect(result.schools).toEqual([
      { id: 100, name: 'Scuola Test', short_name: 'ST', slug: 'scuola-test' },
    ]);
  });

  it('flattens nested podcast with its own schools', () => {
    const result = flattenEpisode(mockEpisodeQuery);
    expect(result.podcast.id).toBe(200);
    expect(result.podcast.title).toBe('Test Podcast');
    expect(result.podcast.coverImageUrl).toBe('https://api.test.com/uploads/podcast-cover.jpg');
    expect(result.podcast.schools).toEqual([
      { id: 100, name: 'Scuola Test', short_name: 'ST', slug: 'scuola-test' },
    ]);
  });
});
