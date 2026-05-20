import { resolveApiBaseUrl } from './restaurant';

/** Absolute URL for a member avatar path from the API. */
export function resolveAvatarUrl(path?: string | null): string | undefined {
  if (!path?.trim()) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const base = resolveApiBaseUrl().replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
