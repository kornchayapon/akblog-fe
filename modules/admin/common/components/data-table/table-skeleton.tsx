'use client'

import { Skeleton } from '@/components/ui/skeleton';

const TableSkeleton = () => {
  return (
    <div className='p-6 space-y-4'>
    {/* Header/Controls Area Skeleton */}
    <div className='flex justify-between items-center'>
      <Skeleton className='h-8 w-[150px]' />
      <Skeleton className='h-8 w-[200px]' />
    </div>

    {/* Table Area Skeleton */}
    <div className='rounded-lg border'>
      <div className='p-4 bg-muted/50 border-b flex space-x-2'>
        {/* Table Header Row Skeleton */}
        <Skeleton className='h-6 w-12 rounded-sm' />
        <Skeleton className='h-6 w-20 rounded-sm' />
        <Skeleton className='h-6 w-24 rounded-sm' />
        <Skeleton className='h-6 w-32 rounded-sm' />
        <Skeleton className='h-6 w-16 rounded-sm ml-auto' />
      </div>

      {/* Table Body Rows Skeleton */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className='p-4 border-b flex items-center space-x-2'>
          <Skeleton className='h-12 w-20' />
          <div className='space-y-2 flex-1'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </div>
          <Skeleton className='h-8 w-16 ml-auto' />
        </div>
      ))}
    </div>

    {/* Pagination Skeleton */}
    <div className='flex justify-end'>
      <Skeleton className='h-8 w-[300px]' />
    </div>
  </div>
  )
}

export default TableSkeleton