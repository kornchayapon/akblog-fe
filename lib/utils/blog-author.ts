import type { BlogAuthor } from '@/lib/interfaces/blog';
import { getUserAvatarSrc } from '@/lib/utils/user-avatar-src';

export function getBlogAuthorDisplayName(author: BlogAuthor): string {
  return [author.firstName, author.lastName].filter(Boolean).join(' ').trim();
}

export function getBlogAuthorAvatarSrc(author: BlogAuthor): string {
  return getUserAvatarSrc(author);
}

export function getBlogAuthorInitials(author: BlogAuthor): string {
  const first = author.firstName?.charAt(0).toUpperCase() ?? '';
  const last = author.lastName?.charAt(0).toUpperCase() ?? '';
  const pair = `${first}${last}`;
  if (pair) return pair;
  if (first) return first;
  return '?';
}

export function getBlogAuthorAvatarColorClass(authorId: number): string {
  const palette = [
    'bg-emerald-100 text-emerald-800',
    'bg-sky-100 text-sky-800',
    'bg-violet-100 text-violet-800',
    'bg-amber-100 text-amber-800',
    'bg-rose-100 text-rose-800',
    'bg-teal-100 text-teal-800',
  ];
  return palette[authorId % palette.length] ?? palette[0];
}
