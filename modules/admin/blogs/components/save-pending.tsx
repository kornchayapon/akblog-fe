'use client';

import { Loader2 } from 'lucide-react';

const SavePending = ({
  isSaving,
  message,
}: {
  isSaving: boolean;
  message: string;
}) => {
  if (!isSaving) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='flex items-center gap-3 rounded-lg text-white bg-black px-6 py-4 shadow-lg'>
        <Loader2 className='h-5 w-5 animate-spin' />
        <span className='text-sm font-medium'>{message}</span>
      </div>
    </div>
  );
};

export default SavePending;
