export function resolveAssetPath(path: string): string {
  if (!path.startsWith('/')) {
    return path;
  }

  const baseUrl = import.meta.env.BASE_URL ?? '/';
  const normalizedBase = baseUrl === '/' ? '' : baseUrl.replace(/\/+$/, '');
  if (!normalizedBase) {
    return path;
  }

  // Prevent adding the base path twice when values are already normalized.
  if (path === normalizedBase || path.startsWith(`${normalizedBase}/`)) {
    return path;
  }

  return `${normalizedBase}${path}`;
}

