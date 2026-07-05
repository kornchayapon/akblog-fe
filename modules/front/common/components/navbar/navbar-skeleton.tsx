'use client';

import type { ReactElement } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

const NavbarSkeleton = (): ReactElement => {
  return (
    <header
      className='fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur-xl shadow-sm'
      role='banner'
      aria-busy='true'
      aria-live='polite'
    >
      <div className='container mx-auto h-16 px-4 flex items-center justify-between gap-4'>
        <div className='flex items-center gap-4 shrink-0'>
          <Skeleton className='h-9 w-9 rounded-xl lg:hidden' />
          <Skeleton className='h-8 w-28 rounded-md' />
        </div>

        <div className='hidden lg:flex items-center grow max-w-3xl gap-8'>
          <Skeleton className='h-10 w-full max-w-sm rounded-xl' />
          <div className='flex items-center gap-3'>
            <Skeleton className='h-6 w-14 rounded-md' />
            <Skeleton className='h-6 w-24 rounded-md' />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-8 rounded-full' />
          <Skeleton className='hidden sm:block h-8 w-20 rounded-md' />
        </div>
      </div>
    </header>
  );
};

export default NavbarSkeleton;
