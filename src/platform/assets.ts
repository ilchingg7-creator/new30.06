export function resolveAssetUrl(path: string, baseUrl = import.meta.env.BASE_URL): string {
  const portableBase = baseUrl === '/' ? './' : baseUrl;
  const base = portableBase.endsWith('/') ? portableBase : `${portableBase}/`;

  return `${base}${path.replace(/^\.?\//, '')}`;
}
