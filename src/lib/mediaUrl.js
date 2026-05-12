const NEXT_PUBLIC_API_BASE_URL_IMAGE =
  import.meta.env.NEXT_PUBLIC_API_BASE_URL_IMAGE || '';
const MEDIA_BASE_URL = import.meta.env.VITE_API_MEDIA_URL || '';
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export function resolveMediaUrl(path) {
  if (!path) return '';

  const value = String(path).trim();
  if (!value) return '';

  if (
    value.startsWith('data:') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:')
  ) {
    return value;
  }

  const baseUrl =
    NEXT_PUBLIC_API_BASE_URL_IMAGE || MEDIA_BASE_URL || API_BASE_URL;

  if (!baseUrl) {
    return value;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = value.startsWith('/') ? value : `/${value}`;

  return `${normalizedBase}${normalizedPath}`;
}
