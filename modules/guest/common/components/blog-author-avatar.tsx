'use client';

import type { ReactElement } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { BlogAuthor } from '@/lib/interfaces/blog';
import { cn } from '@/lib/utils';
import {
  getBlogAuthorAvatarColorClass,
  getBlogAuthorDisplayName,
  getBlogAuthorInitials,
} from '@/lib/utils/blog-author';

const SIZE_CLASS = {
  xs: 'size-6',
  sm: 'size-9',
  md: 'size-10',
  lg: 'size-12',
} as const;

const FALLBACK_TEXT_CLASS: Record<keyof typeof SIZE_CLASS, string> = {
  xs: 'text-[9px] font-semibold leading-none',
  sm: 'text-xs font-semibold',
  md: 'text-xs font-semibold',
  lg: 'text-sm font-semibold',
};

export type BlogAuthorAvatarSize = keyof typeof SIZE_CLASS;

type BlogAuthorAvatarProps = Readonly<{
  author: BlogAuthor;
  size?: BlogAuthorAvatarSize;
  className?: string;
}>;

export function BlogAuthorAvatar({
  author,
  size = 'md',
  className,
}: BlogAuthorAvatarProps): ReactElement {
  const src = author.avatar?.path;
  const displayName =
    getBlogAuthorDisplayName(author) || author.firstName || 'Author';
  const initials = getBlogAuthorInitials(author);
  const colorClass = getBlogAuthorAvatarColorClass(author.id);

  return (
    <Avatar className={cn(SIZE_CLASS[size], className)}>
      {src ? (
        <AvatarImage
          src={src}
          alt={displayName ? `${displayName} avatar` : 'Author avatar'}
        />
      ) : null}
      <AvatarFallback className={cn(FALLBACK_TEXT_CLASS[size], colorClass)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
