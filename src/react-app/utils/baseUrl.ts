export const BASE_URL = '';

export async function ensureApiBaseUrl(): Promise<string> {
  return BASE_URL;
}

export function getApiBaseUrl(): string {
  return BASE_URL;
}

export function buildApiUrl(endpoint: string): URL {
  const fallbackOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  return new URL(endpoint, fallbackOrigin);
}

export function getFullUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  try {
    if (typeof window !== 'undefined') {
      return new URL(url, window.location.origin).toString();
    }
    return url.startsWith('/') ? url : `/${url}`;
  } catch (error) {
    console.error('URL格式错误:', error);
    return url;
  }
}
