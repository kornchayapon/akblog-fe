import type { ReactElement } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ChevronLeft, ChevronRight } from 'lucide-react';

// import type { FrontBlogNavLink } from '@/lib/interfaces/blog-read-nav';
import { getBlogAuthorDisplayName } from '@/lib/utils/blog-author';
import { cn } from '@/lib/utils';
import { Blog, BlogAuthor } from '@/lib/interfaces/blog';

import { BlogAuthorAvatar } from '@/modules/guest/common/components/blog-author-avatar';

// type BlogAdjacentNavProps = Readonly<{
//   previous: FrontBlogNavLink | null;
//   next: FrontBlogNavLink | null;
// }>;

type FrontBlogNavLink = Readonly<{
  slug: string;
  title: string;
  /** Cover image URL for thumbnail, or null to use placeholder. */
  imageSrc: string | null;
  author: BlogAuthor;
}>;

type NavCardProps = Readonly<{
  kind: 'previous' | 'next';
  link: FrontBlogNavLink;
}>;

type BlogAdjacentNavProps = Readonly<{
  previous: Blog;
  next: Blog;
}>;

const NavCard = ({ kind, link }: NavCardProps): ReactElement => {
  const isPrev = kind === 'previous';
  const href = `/blogs/${encodeURIComponent(link.slug)}`;
  const label = isPrev ? 'Previous blog' : 'Next blog';
  const imageSrc = link.imageSrc?.trim() || '/images/dev-hero.jpg';
  const authorLabel =
    getBlogAuthorDisplayName(link.author) || link.author.firstName || 'Author';

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex gap-4 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/80 p-4 text-left shadow-sm transition-all',
        'hover:border-emerald-700/25 hover:bg-white hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30 focus-visible:ring-offset-2',
        !isPrev && 'sm:flex-row-reverse sm:text-right',
      )}
    >
      <div
        className={cn(
          'relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-100',
          !isPrev && 'sm:order-2',
        )}
      >
        <Image
          src={imageSrc}
          alt=''
          fill
          sizes='112px'
          className='object-cover transition-transform duration-300 group-hover:scale-105'
        />
      </div>
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col justify-center gap-1.5',
          !isPrev && 'sm:items-end',
        )}
      >
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500',
            !isPrev && 'sm:flex-row-reverse sm:justify-end',
          )}
        >
          {isPrev ? (
            <ChevronLeft
              className='h-4 w-4 shrink-0 text-emerald-700/80'
              aria-hidden
            />
          ) : (
            <ChevronRight
              className='h-4 w-4 shrink-0 text-emerald-700/80'
              aria-hidden
            />
          )}
          {label}
        </span>
        <span
          className={cn(
            'line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-emerald-900',
            !isPrev && 'sm:text-right',
          )}
        >
          {link.title}
        </span>
        <div
          className={cn(
            'mt-1 flex min-w-0 items-center gap-2',
            !isPrev && 'sm:flex-row-reverse sm:justify-end',
          )}
        >
          <BlogAuthorAvatar author={link.author} size='xs' />
          <span
            className={cn(
              'min-w-0 truncate text-xs font-medium text-neutral-600',
              !isPrev && 'sm:text-right',
            )}
          >
            {authorLabel}
          </span>
        </div>
      </div>
    </Link>
  );
};

const BlogAdjacentNav = ({
  previous,
  next,
}: BlogAdjacentNavProps): ReactElement | null => {
  if (!previous && !next) return null;

  const toNav = (blog: Blog) => {
    return {
      slug: blog.slug,
      title: blog.title,
      imageSrc:
        blog.thumbnail?.path?.trim() ||
        blog.pictures?.[0]?.path?.trim() ||
        null,
      author: blog.author,
    };
  };

  return (
    <nav
      aria-label='Adjacent articles'
      className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6'
    >
      <div className='min-w-0'>
        {previous ? <NavCard kind='previous' link={toNav(previous)} /> : null}
      </div>
      <div className='min-w-0 sm:flex sm:justify-end'>
        {next ? (
          <div className='w-full sm:max-w-none'>
            <NavCard kind='next' link={toNav(next)} />
          </div>
        ) : null}
      </div>
    </nav>
  );
};

export default BlogAdjacentNav;
