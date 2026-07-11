import { Skeleton } from "@/components/ui/skeleton";

const UserProcessDialogSkeleton = () => {
  return (
    <div className='grid gap-4 py-4'>
      {/* Email */}
      <div className='grid gap-3'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-10 w-full' />
      </div>

      {/* Password */}
      <div className='grid gap-3'>
        <Skeleton className='h-4 w-28' />
        <Skeleton className='h-10 w-full' />
      </div>

      {/* First name */}
      <div className='grid gap-3'>
        <Skeleton className='h-4 w-28' />
        <Skeleton className='h-10 w-full' />
      </div>

      {/* Last name */}
      <div className='grid gap-3'>
        <Skeleton className='h-4 w-28' />
        <Skeleton className='h-10 w-full' />
      </div>

      {/* Role select */}
      <div className='grid gap-3'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-10 w-full' />
      </div>

      {/* Footer buttons */}
      <div className='flex justify-end gap-2 pt-2'>
        <Skeleton className='h-10 w-24' />
        <Skeleton className='h-10 w-32' />
      </div>
    </div>
  );
}

export default UserProcessDialogSkeleton