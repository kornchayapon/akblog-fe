/**
 * Converts a URL slug (e.g. "web-development") into a readable title
 * ("Web Development"). Works with both hyphen and underscore separators.
 */
export function formatSlugTitle(slug: string, fallback = 'Untitled'): string {
  const raw = slug.trim();
  if (!raw) return fallback;

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  return decoded
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
