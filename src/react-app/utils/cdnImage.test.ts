import { describe, expect, it } from 'vitest';
import { discreteThumbnailWidth, thumbnailSrc, THUMB_WIDTHS } from './cdnImage';

describe('discreteThumbnailWidth', () => {
  it('quantizes to 400, 800, or 1200', () => {
    expect(discreteThumbnailWidth(100)).toBe(400);
    expect(discreteThumbnailWidth(300)).toBe(800);
    expect(discreteThumbnailWidth(800)).toBe(1200);
  });
});

describe('thumbnailSrc', () => {
  it('builds srcset from original with only 400/800/1200', () => {
    const { src, srcSet } = thumbnailSrc('https://r2.example.com/original/landscape/a.jpg', 300, false);
    expect(src).toContain('/cdn-cgi/image/');
    expect(src).toContain('width=800');
    expect(src).toContain('quality=75');
    expect(src).toContain('/original/landscape/a.jpg');
    for (const width of THUMB_WIDTHS) {
      expect(srcSet).toContain(`${width}w`);
    }
  });

  it('does not transform GIFs', () => {
    const { src, srcSet } = thumbnailSrc('https://r2.example.com/original/landscape/a.gif', 300, true);
    expect(src).toBe('https://r2.example.com/original/landscape/a.gif');
    expect(srcSet).toBe('');
  });
});
