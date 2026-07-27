/**
 * Strips HTML to plain text for excerpts (client-safe via DOMParser).
 */
export function extractPlainTextFromHtml(html: string, maxChars: number): string {
  if (!html) return '';

  if (typeof DOMParser === 'undefined') return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rawText = doc.body?.textContent ?? '';

  const normalized = rawText.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  if (normalized.length <= maxChars) return normalized;

  const clipped = normalized.slice(0, maxChars);
  return `${clipped.replace(/\s+\S*$/, '').trimEnd()}…`;
}
