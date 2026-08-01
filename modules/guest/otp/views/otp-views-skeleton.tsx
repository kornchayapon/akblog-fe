'use client';

const OtpSkeleton = () => {
  return (
    <div className='relative flex min-h-screen items-center justify-center bg-background px-4 py-12'>
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -right-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary/6 blur-[120px]' />
        <div className='absolute -bottom-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-primary/5 blur-[120px]' />
      </div>

      <div className='relative w-full max-w-md animate-pulse'>
        <div className='overflow-hidden rounded-[2.5rem] border border-border/60 bg-card shadow-2xl shadow-primary/10'>
          <div className='space-y-6 p-10 pb-6 text-center'>
            <div className='mx-auto h-16 w-16 rounded-3xl bg-muted' />

            <div className='flex flex-col items-center space-y-3'>
              <div className='h-8 w-40 rounded-xl bg-muted' />
              <div className='h-4 w-64 rounded-lg bg-muted' />
            </div>
          </div>

          <div className='space-y-10 px-10 pb-10'>
            <div className='flex flex-col items-center space-y-4'>
              <div className='flex justify-center gap-3'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className='h-14 w-12 rounded-2xl bg-muted' />
                ))}
              </div>
              <div className='h-3 w-48 rounded-lg bg-muted' />
            </div>

            <div className='space-y-4'>
              <div className='mx-auto h-4 w-32 rounded-lg bg-muted' />
              <div className='h-14 w-full rounded-2xl bg-muted' />
              <div className='mx-auto h-4 w-24 rounded-lg bg-muted pt-2' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpSkeleton;
