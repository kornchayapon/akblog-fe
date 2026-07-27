'use client'

import { useInfiniteQuery } from '@tanstack/react-query';

import ErrorCard from '@/modules/admin/common/components/error-card';
import HeroSection from '../components/hero-section';
import HeroSectionSkeleton from '../components/hero-section-skeleton';

import type { GuestBlogsResponse } from '@/lib/interfaces/guest-blogs';
import { GUEST_BLOGS_KEY } from '@/lib/constants/query-key';
import { PublishStatusEnum } from '@/lib/enums/publish-status.enum';
import { fetchGuestBlogs } from '@/lib/apis/guest';

const pageSize = 4;

const HomeView = () => {

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

  const allBlogs = blogsData?.pages.flatMap((page) => page.results) ?? [];
  const heroBlog = allBlogs[0];
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
    </div>
  );
};

export default HomeView;
