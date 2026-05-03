import { zip, clamp, getFriendlyDate, getCover, fixEncoding } from '../helpers';

describe('zip', () => {
  it('combines equal-length prop and value arrays into an object', () => {
    const result = zip(['title', 'artist', 'year'], ['Jump', 'Van Halen', '1984']);
    expect(result).toEqual({ title: 'Jump', artist: 'Van Halen', year: '1984' });
  });

  it('returns empty object for empty inputs', () => {
    expect(zip([], [])).toEqual({});
  });

  it('maps undefined for props longer than values', () => {
    const result = zip(['a', 'b', 'c'], ['1', '2']);
    expect(result).toEqual({ a: '1', b: '2', c: undefined });
  });
});

describe('clamp', () => {
  it('returns min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('returns max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns boundary when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it('returns boundary when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('getFriendlyDate', () => {
  it('formats ISO date to Italian locale', () => {
    const result = getFriendlyDate('2024-01-15');
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/gennaio/i);
  });

  it('handles a different month', () => {
    const result = getFriendlyDate('2023-12-25');
    expect(result).toMatch(/25/);
    expect(result).toMatch(/dicembre/i);
    expect(result).toMatch(/2023/);
  });
});

describe('getCover', () => {
  it('returns empty string when cover data is missing', () => {
    expect(getCover({}, 'https://api.example.com')).toBe('');
    expect(getCover({ cover: undefined }, 'https://api.example.com')).toBe('');
    expect(getCover({ cover: null }, 'https://api.example.com')).toBe('');
  });

  it('constructs URL with small_ prefix for large images', () => {
    const attrs = {
      cover: {
        url: '/uploads/cover.jpg',
        hash: 'abc123',
        ext: '.jpg',
        width: 800,
      },
    };
    const result = getCover(attrs, 'https://api.example.com');
    expect(result).toBe('https://api.example.com/uploads/small_abc123.jpg');
  });

  it('constructs URL without prefix for small images', () => {
    const attrs = {
      cover: {
        url: '/uploads/cover.jpg',
        hash: 'abc123',
        ext: '.jpg',
        width: 300,
      },
    };
    const result = getCover(attrs, 'https://api.example.com');
    expect(result).toBe('https://api.example.com/uploads/abc123.jpg');
  });
});

describe('fixEncoding', () => {
  it('returns empty/falsy input unchanged', () => {
    expect(fixEncoding('')).toBe('');
  });

  it('returns valid UTF-8 text unchanged', () => {
    expect(fixEncoding('Hello World')).toBe('Hello World');
  });

  it('returns Italian characters unchanged when valid UTF-8', () => {
    expect(fixEncoding('caffè')).toBe('caffè');
  });
});
