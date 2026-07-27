/** Long-form date for blogs headers (Thai locale). */
export function formatBlogPublishedLong(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Rough reading time from HTML body (Thai / mixed text). */
export function estimateReadingMinutesFromHtml(html: string): number {
  if (!html.trim()) return 1;
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return 1;
  const words = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return minutes;
}
