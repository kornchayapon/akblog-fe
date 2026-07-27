'use client';

import { Skeleton } from '@/components/ui/skeleton';
import type { ReactElement } from 'react';

const HeroSectionSkeleton = (): ReactElement => {
  return (
    <section className='relative mb-12 border-b border-border/30 py-12 md:mb-24 md:py-20'>
      <div className='mx-auto max-w-4xl text-center'>
        <Skeleton className='mx-auto mb-6 h-3 w-32 rounded-md' />
        <Skeleton className='mx-auto mb-8 h-24 w-full max-w-3xl rounded-lg md:h-32 lg:h-36' />
        <div className='mx-auto mb-10 max-w-2xl space-y-3'>
          <Skeleton className='h-6 w-full rounded-md' />
          <Skeleton className='mx-auto h-6 w-5/6 rounded-md' />
        </div>
        <div className='flex flex-col items-center gap-8'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-10 rounded-full' />
            <div className='space-y-2 text-left'>
              <Skeleton className='h-3 w-28 rounded-md' />
              <Skeleton className='h-2 w-40 rounded-md' />
            </div>
          </div>
          <Skeleton className='h-12 w-48 rounded-full' />
        </div>
      </div>
      <div className='mx-auto mt-16 max-w-5xl md:mt-20'>
        <Skeleton className='aspect-[21/9] w-full rounded-2xl' />
      </div>
    </section>
  );
};

export default HeroSectionSkeleton;
