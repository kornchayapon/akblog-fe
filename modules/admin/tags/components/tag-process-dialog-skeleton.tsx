'use client'

import { Skeleton } from '@/components/ui/skeleton';

const TagProcessDialogSkeleton = () => {
  return (
    <div className='grid gap-4 py-4'>
      {/* name */}
      <div className='grid gap-3'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-10 w-full' />
      </div>

      {/* Footer buttons */}
      <div className='flex justify-end gap-2 pt-2'>
        <Skeleton className='h-10 w-24' />
        <Skeleton className='h-10 w-32' />
      </div>
    </div>
  );
};

export default TagProcessDialogSkeleton;
