'use client';

import { Skeleton } from '@/components/ui/skeleton';
import type { ReactElement } from 'react';

const BlogCardSkeleton = (): ReactElement => {
  return (
    <article className='group relative overflow-hidden rounded-2xl bg-card shadow-md'>
      <div className='relative aspect-16/10 overflow-hidden bg-muted'>
        <Skeleton className='h-full w-full' />
      </div>

      <div className='flex flex-col gap-4 p-5'>
        <div className='space-y-2'>
          <Skeleton className='h-3 w-20 rounded-md' />
          <Skeleton className='h-4 w-40 rounded-md' />
        </div>

        <Skeleton className='h-7 w-4/5 rounded-md' />
        <Skeleton className='h-4 w-full rounded-md' />
        <Skeleton className='h-4 w-5/6 rounded-md' />

        <div className='flex flex-wrap items-center gap-2 pt-1'>
          <Skeleton className='h-7 w-24 rounded-full' />
          <Skeleton className='h-7 w-20 rounded-full' />
        </div>

        <div className='mt-auto flex items-center justify-between gap-4 pt-2'>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-10 w-10 rounded-full' />
            <Skeleton className='h-4 w-24 rounded-md' />
          </div>
          <Skeleton className='h-9 w-28 rounded-full' />
        </div>
      </div>
    </article>
  );
};

export default BlogCardSkeleton;
