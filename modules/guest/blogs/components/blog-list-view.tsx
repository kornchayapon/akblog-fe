'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ArrowLeft, Newspaper, Tag } from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

import { GUEST_BLOGS_KEY } from '@/lib/constants/query-key';
import { PublishStatusEnum } from '@/lib/enums/publish-status.enum';
import type { GuestBlogsResponse } from '@/lib/interfaces/guest-blogs';
import { fetchBlogsByCategory, fetchBlogsByTag } from '@/lib/apis/guest';
import { formatSlugTitle } from '@/lib/utils/format-slug-title';
import { cn } from '@/lib/utils';


import ErrorCard from '@/modules/admin/common/components/error-card';
import BlogCard from '../../home/components/blog-card';
import BlogCardSkeleton from '../../home/components/blog-card-skeleton';

import { useInfiniteScroll } from '../../common/hooks/use-infinite-scroll';

export type BlogListType = 'category' | 'tag';

interface BlogListViewProps {
  type: BlogListType;
  slug: string;
}

const PAGE_SIZE = 4;
const SKELETON_COUNT = 6;

const COPY = {
  category: {
    fallback: 'Category',
    queryKey: (slug: string) => [GUEST_BLOGS_KEY, 'category', slug],
    fetchFn: fetchBlogsByCategory,
    subtitle: 'Published posts filed under this category.',
    emptyTitle: 'No posts in this category yet',
    emptyBody:
      'There are no published blogs here right now. Browse the homepage to discover other stories.',
    icon: Newspaper,
  },
  tag: {
    fallback: 'Tag',
    queryKey: (slug: string) => [GUEST_BLOGS_KEY, 'tag', slug],
    fetchFn: fetchBlogsByTag,
    subtitle: 'Published posts filed under this tag.',
    emptyTitle: 'No posts with this tag yet',
    emptyBody:
      'There are no published blogs here right now. Browse the homepage to discover other stories.',
    icon: Tag,
  },
} as const;

const BlogListView = ({ type, slug }: BlogListViewProps) => {
  const loadMoreRef = useRef<HTMLDivElement>(null!);
  const config = COPY[type];
  const title = formatSlugTitle(slug, config.fallback);
  const EmptyIcon = config.icon;

  const {
    data: blogsData,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<GuestBlogsResponse, Error>({
    queryKey: config.queryKey(slug),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      config.fetchFn({
        page: typeof pageParam === 'number' ? pageParam : 1,
        limit: PAGE_SIZE,
        withDeleted: false,
        status: PublishStatusEnum.PUBLISHED,
        slug,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta) return undefined;

      const { currentPage, totalPages } = lastPage.meta as {
        currentPage?: number;
        totalPages?: number;
      };

      if (
        typeof currentPage !== 'number' ||
        typeof totalPages !== 'number' ||
        totalPages <= 0
      ) {
        return undefined;
      }

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  useInfiniteScroll(loadMoreRef, () => fetchNextPage(), !!hasNextPage);

  const allBlogs = blogsData?.pages.flatMap((page) => page.results) ?? [];
  const errorMessage = error?.message ?? `Failed to fetch blogs by ${type}`;
  const isEmpty = !isPending && !isError && allBlogs.length === 0;
  const showLoadMoreRegion = allBlogs.length > 0 || isFetchingNextPage;

  return (
    <div className="relative min-h-screen pt-25">
      <div
        className='pointer-events-none absolute inset-x-0 top-0 h-70 bg-linear-to-b from-primary/7 via-background to-transparent'
        aria-hidden
      />

      <div className="relative container mx-auto px-4 pb-20 lg:px-6">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[min(100%,12rem)] truncate capitalize sm:max-w-md">
                {title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="mb-10 max-w-2xl">
          <Link
            href="/"
            className={cn(
              'group mb-4 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-muted-foreground',
              'transition-colors hover:text-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            <ArrowLeft
              className="size-4 transition-transform group-hover:-translate-x-0.5"
              aria-hidden
            />
            All blogs
          </Link>
          <h1 className='font-serif text-3xl font-medium italic tracking-tight text-foreground sm:text-4xl md:text-5xl'>
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {config.subtitle}
          </p>
        </header>

        {isError ? (
          <ErrorCard title="An error occurred" message={errorMessage} />
        ) : isPending && allBlogs.length === 0 ? (
          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10'>
            {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
              <BlogCardSkeleton key={idx} />
            ))}
          </div>
        ) : isEmpty ? (
          <div
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80',
              'bg-muted/40 px-6 py-16 text-center sm:py-20',
            )}
            role="status"
            aria-live="polite"
          >
            <div className='mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <EmptyIcon className='size-7' aria-hidden />
            </div>
            <h2 className='text-lg font-semibold text-foreground sm:text-xl'>
              {config.emptyTitle}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {config.emptyBody}
            </p>
            <Button asChild className="mt-8" variant="default">
              <Link href="/">Go to homepage</Link>
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10'>
            {allBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>

      {showLoadMoreRegion && (
        <div
          ref={loadMoreRef}
          className="h-12 mb-20 flex items-center justify-center text-sm text-muted-foreground"
        >
          {isFetchingNextPage
            ? 'Loading more...'
            : !hasNextPage
              ? 'You have reached the end'
              : ''}
        </div>
      )}
    </div>
  );
};

export default BlogListView;
