import { describe, expect, it } from 'vitest';
import { discreteThumbnailWidth } from './cdnImage';

describe('discreteThumbnailWidth', () => {
  it('quantizes to 400, 800, or 1200', () => {
    expect(discreteThumbnailWidth(100)).toBe(400);
    expect(discreteThumbnailWidth(300)).toBe(800);
    expect(discreteThumbnailWidth(800)).toBe(1200);
  });
});
