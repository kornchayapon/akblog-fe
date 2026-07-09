'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AccessDenied = () => {
  return (
    <div className='flex min-h-[80vh] flex-col items-center justify-center p-4 text-center'>
      <div className='mb-6 rounded-full bg-destructive/10 p-6'>
        <ShieldAlert className='h-16 w-16 text-destructive' />
      </div>

      <h1 className='mb-2 text-4xl font-bold tracking-tight text-foreground'>
        Access Denied
      </h1>

      <p className='mb-8 max-w-md text-lg text-muted-foreground'>
        Sorry, you do not have permission to access the admin panel.
        If you believe this is a mistake,
        please contact the administrator to request access.
      </p>

      <div className='flex flex-wrap items-center justify-center gap-4'>
        <Button
          variant='outline'
          onClick={() => window.history.back()}
          className='gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Go Back
        </Button>

        <Link href='/'>
          <Button className='gap-2 bg-primary text-primary-foreground hover:bg-primary/90'>
            <Home className='h-4 w-4' />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
