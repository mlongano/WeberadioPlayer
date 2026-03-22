import { icecastMetadataService } from '../IcecastMetadataService';

describe('parseIcyTitle', () => {
  it('parses 4-part format: Title - Artist - Year - Album', () => {
    const result = icecastMetadataService.parseIcyTitle('Jump - Van Halen - 1984 - 1984');
    expect(result).toEqual({
      title: 'Jump',
      artist: 'Van Halen',
      year: '1984',
      album: '1984',
    });
  });

  it('parses title-only input', () => {
    const result = icecastMetadataService.parseIcyTitle('WeBe Radio');
    expect(result).toEqual({
      title: 'WeBe Radio',
      artist: '',
      year: '',
      album: '',
    });
  });

  it('parses 2-part input (title + artist)', () => {
    const result = icecastMetadataService.parseIcyTitle('Bohemian Rhapsody - Queen');
    expect(result).toEqual({
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      year: '',
      album: '',
    });
  });

  it('handles extra hyphens in title', () => {
    const result = icecastMetadataService.parseIcyTitle('Rock \'n\' Roll - Led Zeppelin - 1971 - Led Zeppelin IV');
    expect(result.title).toBe("Rock 'n' Roll");
    expect(result.artist).toBe('Led Zeppelin');
    expect(result.year).toBe('1971');
    expect(result.album).toBe('Led Zeppelin IV');
  });

  it('trims whitespace from parts', () => {
    const result = icecastMetadataService.parseIcyTitle('  Hello  -  World  ');
    expect(result.title).toBe('Hello');
    expect(result.artist).toBe('World');
  });
});

describe('listener notification', () => {
  afterEach(() => {
    icecastMetadataService.clearCache();
  });

  it('notifies added listener on processIcyMetadata', async () => {
    const callback = jest.fn();
    icecastMetadataService.addListener(callback);

    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ results: [] }),
      ok: true,
    }) as jest.Mock;

    await icecastMetadataService.processIcyMetadata('Test Song - Test Artist - 2024 - Test Album');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Song',
        artist: 'Test Artist',
        year: '2024',
        album: 'Test Album',
      }),
    );

    icecastMetadataService.removeListener(callback);
  });

  it('does not notify after removeListener', async () => {
    const callback = jest.fn();
    icecastMetadataService.addListener(callback);
    icecastMetadataService.removeListener(callback);

    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ results: [] }),
      ok: true,
    }) as jest.Mock;

    await icecastMetadataService.processIcyMetadata('Another - Song');

    expect(callback).not.toHaveBeenCalled();
    icecastMetadataService.clearCache();
  });
});

describe('cache behavior', () => {
  afterEach(() => {
    icecastMetadataService.clearCache();
  });

  it('uses cached cover on second call with same title', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({
        results: [{ artworkUrl100: 'https://example.com/art100x100.jpg' }],
      }),
      ok: true,
    });
    global.fetch = fetchMock as jest.Mock;

    const result1 = await icecastMetadataService.processIcyMetadata('Cached Song - Cached Artist');
    const fetchCountAfterFirst = fetchMock.mock.calls.length;

    const result2 = await icecastMetadataService.processIcyMetadata('Cached Song - Cached Artist');

    expect(result1.coverUrl).toBe(result2.coverUrl);
    expect(fetchMock.mock.calls.length).toBe(fetchCountAfterFirst);
  });
});
