import { getFullUrl } from './baseUrl';

export interface CdnCgiImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif';
  fit?: 'scale-down' | 'cover' | 'contain';
}

function clampInt(value: unknown, min: number, max: number): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, Math.trunc(num)));
}

function buildOptionsString(options: CdnCgiImageOptions): string {
  const parts: string[] = [];
  if (options.width) parts.push(`width=${clampInt(options.width, 1, 4096)}`);
  if (options.height) parts.push(`height=${clampInt(options.height, 1, 4096)}`);
  parts.push(`fit=${options.fit || 'scale-down'}`);
  parts.push(`quality=${clampInt(options.quality ?? 75, 1, 100)}`);
  parts.push(`format=${options.format || 'auto'}`);
  return parts.join(',');
}

export const THUMB_QUALITY = 75;
export const THUMB_WIDTHS = [400, 800, 1200] as const;
export type ThumbWidth = (typeof THUMB_WIDTHS)[number];

export function discreteThumbnailWidth(cssPx: number): ThumbWidth {
  const requested = Math.max(1, Math.ceil(cssPx * 2));
  if (requested <= 400) return 400;
  if (requested <= 800) return 800;
  return 1200;
}

export function thumbnailOptions(width: ThumbWidth): CdnCgiImageOptions {
  return { width, quality: THUMB_QUALITY, format: 'auto', fit: 'scale-down' };
}

/** Gallery thumbs always transform the original object (not a stored WebP). */
export function thumbnailSrc(originalUrl: string, cssPx: number, isGif: boolean): {
  src: string;
  srcSet: string;
  sizes: string;
} {
  const base = getFullUrl(originalUrl);
  if (!base) return { src: '', srcSet: '', sizes: '' };
  if (isGif) return { src: base, srcSet: '', sizes: '' };

  const selected = discreteThumbnailWidth(cssPx);
  const src = toCdnCgiImageUrl(base, thumbnailOptions(selected));
  const srcSet = THUMB_WIDTHS
    .map((width) => `${toCdnCgiImageUrl(base, thumbnailOptions(width))} ${width}w`)
    .join(', ');
  const sizes = `${Math.max(1, Math.round(cssPx))}px`;
  return { src, srcSet, sizes };
}

export function previewSrc(originalUrl: string, isGif: boolean): string {
  const base = getFullUrl(originalUrl);
  if (!base) return '';
  if (isGif) return base;
  return toCdnCgiImageUrl(base, thumbnailOptions(1200));
}

export function toCdnCgiImageUrl(inputUrl: string, options: CdnCgiImageOptions): string {
  const fullUrl = getFullUrl(inputUrl);
  if (!fullUrl) return '';

  let url: URL;
  try {
    url = new URL(fullUrl);
  } catch {
    return fullUrl;
  }

  const optionsString = buildOptionsString(options);
  const prefix = '/cdn-cgi/image/';

  if (url.pathname.startsWith(prefix)) {
    const rest = url.pathname.slice(prefix.length);
    const slashIndex = rest.indexOf('/');
    if (slashIndex === -1) {
      return fullUrl;
    }
    const originPath = rest.slice(slashIndex);
    url.pathname = `${prefix}${optionsString}${originPath}`;
    return url.toString();
  }

  url.pathname = `${prefix}${optionsString}${url.pathname}`;
  return url.toString();
}

