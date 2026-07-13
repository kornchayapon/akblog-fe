'use client'

import { Skeleton } from '@/components/ui/skeleton';

export const SubmitBlogSkeleton = () => {
  return (
    <div className='p-6 space-y-6'>
      {/* Title */}
      <Skeleton className='h-6 w-40' />

      {/* Breadcrumb */}
      <Skeleton className='h-4 w-64' />

      {/* Title input */}
      <div className='space-y-2'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-10 w-full' />
      </div>

      {/* Selects */}
      <div className='grid xl:grid-cols-3 gap-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 w-full' />
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className='space-y-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-125 w-full rounded-md' />
      </div>

      {/* Buttons */}
      <div className='flex justify-end gap-2'>
        <Skeleton className='h-10 w-24' />
        <Skeleton className='h-10 w-32' />
      </div>
    </div>
  );
};
