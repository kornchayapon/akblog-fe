'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, type ReactElement } from 'react';
import { ArrowRight } from 'lucide-react';

import type { Blog } from '@/lib/interfaces/blog';
import { BlogAuthorAvatar } from '@/modules/guest/common/components/blog-author-avatar';
import { DateTimeFormat } from '@/lib/utils/date-time-format';
import { extractPlainTextFromHtml } from '@/lib/utils/extract-plain-text-from-html';

import { cn } from '@/lib/utils';

type BlogCardProps = Readonly<{
  blog: Blog;
}>;

const BlogCard = ({ blog }: BlogCardProps): ReactElement => {
  const authorName = useMemo(() => {
    const first = blog.author.firstName ?? '';
    const last = blog.author.lastName ?? '';
    return [first, last].filter(Boolean).join(' ');
  }, [blog.author.firstName, blog.author.lastName]);

  const publishedOnLabel = blog.publishedOn
    ? DateTimeFormat(blog.publishedOn)
    : '—';

  const heroImageSrc: string =
    blog.thumbnail?.path?.trim() ||
    blog.pictures?.[0]?.path?.trim() ||
    '/images/dev-hero.jpg';

  const heroImageAlt: string = blog.title
    ? `Blog thumbnail for ${blog.title}`
    : 'Blog thumbnail';

  const excerpt = useMemo(
    () => extractPlainTextFromHtml(blog.content, 170),
    [blog.content],
  );

  const visibleTags = blog.tags.slice(0, 3);
  const extraTagsCount = blog.tags.length - visibleTags.length;

  const subtleLinkClassName =
    'rounded-full border border-transparent bg-primary/5 px-3 py-1 text-sm font-medium text-primary transition-colors hover:border-primary/20 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-card shadow-[0_18px_40px_-18px_rgba(15,118,110,0.14)]',
        'transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_50px_-16px_rgba(15,118,110,0.18)]',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
      )}
    >
      <div className='relative aspect-16/10 overflow-hidden bg-muted'>
        <Link
          href={`/blogs/${blog.slug}`}
          className='absolute inset-0 block rounded-t-2xl outline-none transition-transform duration-500 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'
        >
          <Image
            src={heroImageSrc}
            fill
            sizes='(max-width: 768px) 100vw, 33vw'
            alt={heroImageAlt}
            className='object-cover transition-transform duration-500 group-hover:scale-105'
            priority
          />
        </Link>
        <div className='pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-black/5 to-transparent' />
      </div>

      <div className='flex flex-col gap-4 p-5'>
        <div>
          <Link
            href={`/blogs/category/${blog.category.slug}`}
            className='inline-block text-[10px] font-bold uppercase tracking-[0.18em] text-primary transition-colors hover:text-primary/80'
          >
            {blog.category.name}
          </Link>
          <div className='mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground'>
            <span className='font-semibold'>Published:</span>
            <span>{publishedOnLabel}</span>
          </div>
        </div>

        <h3 className='font-serif text-xl font-medium leading-snug tracking-tight text-foreground md:text-2xl'>
          <Link
            href={`/blogs/${blog.slug}`}
            className='rounded-md transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <span className='line-clamp-2'>{blog.title}</span>
          </Link>
        </h3>

        <p className='line-clamp-3 text-sm leading-relaxed text-muted-foreground'>
          {excerpt}
        </p>

        <div className='flex flex-wrap items-center gap-2 pt-1'>
          {visibleTags.length === 0 ? (
            <span className='text-sm text-muted-foreground'>(no tags)</span>
          ) : (
            visibleTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blogs/tag/${tag.slug}`}
                className={subtleLinkClassName}
              >
                {tag.name}
              </Link>
            ))
          )}
          {extraTagsCount > 0 ? (
            <span className='text-sm font-medium text-muted-foreground'>
              +{extraTagsCount} more
            </span>
          ) : null}
        </div>

        <div className='mt-auto flex items-center justify-between gap-4 pt-2'>
          <div className='flex items-center gap-3'>
            <BlogAuthorAvatar author={blog.author} size='md' />
            <span className='text-sm font-semibold text-foreground'>
              {authorName || blog.author.firstName}
            </span>
          </div>

          <Link
            href={`/blogs/${blog.slug}`}
            className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            Read
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
