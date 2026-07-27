'use client'

import { useRef } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';

import ErrorCard from '@/modules/admin/common/components/error-card';
import HeroSection from '../components/hero-section';
import HeroSectionSkeleton from '../components/hero-section-skeleton';
import BlogCardSkeleton from '../components/blog-card-skeleton';
import BlogCard from '../components/blog-card';

import type { GuestBlogsResponse } from '@/lib/interfaces/guest-blogs';
import { GUEST_BLOGS_KEY } from '@/lib/constants/query-key';
import { PublishStatusEnum } from '@/lib/enums/publish-status.enum';
import { fetchGuestBlogs } from '@/lib/apis/guest';
import { useInfiniteScroll } from '../../hooks/use-infinite-scroll';

const pageSize = 4;

const HomeView = () => {
  const loadMoreRef = useRef<HTMLDivElement>(null!);

  // fetch blogs with scroll loading
  const {
    data: blogsData,
    isPending: isBlogsPending,
    isError: isBlogsError,
    error: blogsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<GuestBlogsResponse, Error>({
    queryKey: [GUEST_BLOGS_KEY],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchGuestBlogs({
        page: typeof pageParam === 'number' ? pageParam : 1,
        limit: pageSize,
        withDeleted: false,
        status: PublishStatusEnum.PUBLISHED,
      }),
    getNextPageParam: (lastPage) => {
      // Prevent runtime error in case lastPage or meta is undefined
      if (!lastPage || !lastPage.meta) return undefined;

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
  const heroBlog = allBlogs[0];
  const cardBlogs = allBlogs.slice(1);
  const showHeroError = isBlogsError && !heroBlog;
  const blogsErrorMessage = blogsError?.message ?? 'Failed to fetch blogs';

  return (
    <div className='mt-25 min-h-screen'>
      <div className='container mx-auto px-4 lg:px-6'>
        {showHeroError ? (
          <ErrorCard title='An error occurred' message={blogsErrorMessage} />
        ) : heroBlog ? (
          <HeroSection data={heroBlog} />
        ) : (
          <HeroSectionSkeleton />
        )}
      </div>

      <div className='container mx-auto px-4 lg:px-6 mt-12'>
        {isBlogsError ? (
          <ErrorCard title='An error occurred' message={blogsErrorMessage} />
        ) : isBlogsPending && cardBlogs.length === 0 ? (
          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10'>
            {Array.from({ length: 6 }).map((_, idx) => (
              <BlogCardSkeleton key={idx} />
            ))}
          </div>
        ) : cardBlogs.length > 0 ? (
          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10'>
            {cardBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className='py-10 text-center text-sm text-muted-foreground'>
            {heroBlog ? 'No more blogs found.' : 'No published blogs found.'}
          </div>
        )}
      </div>

      {/* load more ref */}
      <div
        ref={loadMoreRef}
        className='h-12 mt-20 mb-20 flex items-center justify-center text-sm text-muted-foreground'
      >
        {isFetchingNextPage
          ? 'Loading more...'
          : !hasNextPage
            ? 'You have reached the end'
            : ''}
      </div>
    </div>
  );
};

export default HomeView;
