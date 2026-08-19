import BlogCardSkeleton from '@/modules/guest/home/components/blog-card-skeleton';

const BlogSearchLoading = () => (
  <div className="relative min-h-screen pt-25">
    <div
      className='pointer-events-none absolute inset-x-0 top-0 h-70 bg-linear-to-b from-primary/7 via-background to-transparent'
      aria-hidden
    />
    <div className='relative container mx-auto px-4 pb-20 lg:px-6'>
      <div className='mb-8 h-5 w-48 animate-pulse rounded-md bg-muted' />
      <div className='mb-10 max-w-2xl space-y-3'>
        <div className='h-4 w-32 animate-pulse rounded-md bg-muted' />
        <div className='h-10 w-full max-w-md animate-pulse rounded-md bg-muted' />
        <div className='h-4 w-full max-w-lg animate-pulse rounded-md bg-muted' />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <BlogCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  </div>
);

export default BlogSearchLoading;
