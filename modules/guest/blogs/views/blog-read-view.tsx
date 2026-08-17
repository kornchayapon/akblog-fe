'use client';

import { type ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { useQuery } from '@tanstack/react-query';

import { fetchGuestBlogBySlug } from '@/lib/apis/guest';
import {
  estimateReadingMinutesFromHtml,
  formatBlogPublishedLong,
} from '@/lib/utils/blog-read';
import { cn } from '@/lib/utils';

import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';

import ErrorCard from '@/modules/admin/common/components/error-card';
import BlogArticleHtml from '../components/blog-article-html';
import { BlogAuthorAvatar } from '../../common/components/blog-author-avatar';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import BlogAdjacentNav from '../components/blog-adjacent-nav';
import Comment from '../components/comment';

type BlogReadViewProps = Readonly<{
  slug: string;
}>;

const chipClassName =
  'inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary';

const tagPillClassName =
  'rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted';

const BlogReadView = ({ slug }: BlogReadViewProps): ReactElement => {
  const {
    data: blogsData,
    isPending: isBlogPending,
    isError: isBlogError,
    error: blogError,
  } = useQuery({
    queryKey: ['guest-blog', slug],
    queryFn: () => fetchGuestBlogBySlug(slug),
    enabled: !!slug?.trim(),
  });

  if (isBlogPending) {
    return (
      <div className='relative mx-auto max-w-3xl px-4 pb-20 pt-24 sm:px-6 lg:px-8'>
        <div className='space-y-5'>
          <Skeleton className='h-9 w-40 rounded-full' />
          <Skeleton className='h-5 w-56 rounded-full' />
          <Skeleton className='h-12 w-full rounded-xl' />
          <Skeleton className='h-6 w-72 rounded-xl' />
        </div>
      </div>
    );
  }

  if (isBlogError) {
    return (
      <div className='mt-20'>
        <ErrorCard
          title='An error occurred'
          message={blogError?.message ?? 'Failed to load article'}
        />
      </div>
    );
  }

  if (!blogsData) {
    return (
      <div className='mx-auto max-w-3xl px-4 pb-20 pt-24 text-center sm:px-6 lg:px-8'>
        <p className='text-lg font-semibold text-foreground'>
          Article not found
        </p>
        <p className='mt-2 text-sm text-muted-foreground'>
          The article may be removed or unpublished.
        </p>
      </div>
    );
  }

  const { currentBlog, prevBlog, nextBlog } = blogsData;

  if (!currentBlog) {
    return (
      <div className='mx-auto max-w-3xl px-4 pb-20 pt-24 text-center sm:px-6 lg:px-8'>
        <p className='text-lg font-semibold text-foreground'>
          Article not found
        </p>
        <p className='mt-2 text-sm text-muted-foreground'>
          The article may be removed or unpublished.
        </p>
      </div>
    );
  }

  const authorName = [currentBlog.author.firstName, currentBlog.author.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const displayAuthor = authorName || currentBlog.author.firstName || 'Author';

  const publishedLabel = formatBlogPublishedLong(currentBlog.publishedOn);
  const readMinutes = estimateReadingMinutesFromHtml(currentBlog.content);

  const heroImageSrc =
    currentBlog.thumbnail?.path?.trim() ||
    currentBlog.pictures?.[0]?.path?.trim() ||
    '';
  const showHeroImage = heroImageSrc.length > 0;
  const heroImageAlt = currentBlog.title
    ? `Featured image for ${currentBlog.title}`
    : 'Featured image';

  const articleHeaderInner = (
    <>
      <div className='space-y-4'>
        <h1 className='text-balance font-serif text-3xl font-medium italic leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl sm:leading-[1.12]'>
          {currentBlog.title}
        </h1>

        <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <BlogAuthorAvatar
              author={currentBlog.author}
              size='sm'
              className='ring-2 ring-card'
            />
            <div className='leading-tight'>
              <div className='text-sm font-semibold text-foreground'>
                {displayAuthor}
              </div>
              <div className='text-xs text-muted-foreground'>Author</div>
            </div>
          </div>

          <Separator orientation='vertical' className='hidden h-8 sm:block' />

          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm'>
            <time dateTime={currentBlog.publishedOn ?? undefined}>
              {publishedLabel}
            </time>
            <span className='text-border'>•</span>
            <span className='inline-flex items-center gap-1.5'>
              <Clock className='h-4 w-4 text-muted-foreground' aria-hidden />
              {readMinutes} min read
            </span>
          </div>
        </div>
      </div>

      {currentBlog.tags.length > 0 ? (
        <div className='flex flex-wrap gap-2 pt-2'>
          {currentBlog.tags.map((tag) => (
            <Link href={`/blogs/tag/${tag.slug}`} key={tag.id}>
              <span className={tagPillClassName}>{tag.name}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );

  return (
    <div className='relative pt-16'>
      <div
        className='pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-linear-to-b from-primary/8 via-background to-transparent'
        aria-hidden
      />
      <div className='relative mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-12'>
        <div className='mb-8 flex flex-col gap-6'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <Link
              href='/'
              className={cn(
                'group inline-flex items-center gap-2 rounded-md text-sm font-semibold text-muted-foreground',
                'transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
              <span className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-transform group-hover:-translate-x-0.5'>
                <ArrowLeft className='h-4 w-4' aria-hidden />
              </span>
              Back to stories
            </Link>

            <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
              <Link href={`/blogs/category/${currentBlog.category.slug}`}>
                <span className={chipClassName}>
                  <Sparkles className='h-3.5 w-3.5' aria-hidden />
                  {currentBlog.category.name}
                </span>
              </Link>
            </div>
          </div>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href='/'>Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className='max-w-[min(52ch,72vw)] truncate font-medium'>
                  {currentBlog.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <header className='space-y-6'>
          {showHeroImage ? (
            <div className='mt-2'>
              <div className='relative aspect-16/10 overflow-hidden rounded-2xl bg-muted md:aspect-2/1'>
                <Image
                  src={heroImageSrc}
                  alt={heroImageAlt}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, 48rem'
                  priority
                />
                <div
                  className='pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent'
                  aria-hidden
                />
              </div>
              <div className='relative z-10 -mt-10 px-0 sm:-mt-14 sm:px-1'>
                <div className='rounded-2xl bg-card p-6 shadow-[0_28px_70px_-24px_rgba(15,118,110,0.22)] sm:p-8 md:p-10'>
                  <div className='space-y-5'>{articleHeaderInner}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className='mt-2 rounded-2xl bg-card p-6 shadow-md sm:p-8 md:p-10'>
              <div className='space-y-5'>{articleHeaderInner}</div>
            </div>
          )}
        </header>

        <Separator className='my-10 bg-border/80' />

        <article className='pb-6'>
          <BlogArticleHtml html={currentBlog.content} />
        </article>

        <Separator className='my-10 bg-border/80' />

        <footer className='rounded-3xl bg-card p-6 shadow-md shadow-primary/6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-start gap-4'>
              <BlogAuthorAvatar
                author={currentBlog.author}
                size='lg'
                className='ring-2 ring-primary/15'
              />
              <div className='space-y-1'>
                <div className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                  Written by
                </div>
                <div className='text-lg font-semibold text-foreground'>
                  {displayAuthor}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {currentBlog.category.description}
                </div>
              </div>
            </div>

            <div className='flex flex-col items-start gap-2 sm:items-end'>
              <div className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                Topic
              </div>
              <div className='text-sm font-semibold text-foreground'>
                {currentBlog.category.name}
              </div>
            </div>
          </div>

          {!isBlogPending && (
            <>
              <Separator className='my-8 bg-border/80' />
              <BlogAdjacentNav
                previous={prevBlog}
                next={nextBlog}
              />
            </>
          )}
        </footer>

        {!isBlogPending && (
          <Comment blogId={currentBlog.id} />
        )}
      </div>
    </div>
  );
};

export default BlogReadView;
