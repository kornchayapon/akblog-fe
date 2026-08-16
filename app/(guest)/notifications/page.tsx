'use client';

import { Bell, ArrowRight } from 'lucide-react';

import { useUser } from '@/modules/guest/auth/hooks/use-user';
import { AuthCallout } from '@/modules/guest/common/components/auth-callout';
import Loading from '@/modules/guest/common/components/loading';
import { NotificationsHistoryView } from '@/modules/notifications/views/notifications-history-view';

export default function NotificationsPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-linear-to-b from-slate-50 to-white pt-24 pb-20 dark:from-slate-950 dark:to-slate-900'>
        <div className='container mx-auto max-w-lg px-4 lg:px-6'>
          <AuthCallout
            icon={Bell}
            title='Sign in required'
            description='Sign in to view your notifications and stay up to date.'
            actionHref='/'
            actionLabel={
              <>
                Back to home
                <ArrowRight className='ml-2 size-4' aria-hidden />
              </>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-linear-to-b from-slate-50 to-white pt-20 pb-16 dark:from-slate-950 dark:to-slate-900 lg:pt-24'>
      <div className='container mx-auto max-w-3xl px-4 lg:px-6'>
        <header className='mb-10 border-b border-slate-200/80 pb-8 dark:border-slate-800'>
          <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-5'>
            <span className='flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-500/10'>
              <Bell className='size-7' strokeWidth={1.75} />
            </span>
            <div className='min-w-0 flex-1 space-y-1'>
              <h1 className='text-balance text-3xl font-semibold tracking-tight text-slate-900 dark:text-white'>
                Notifications
              </h1>
              <p className='text-pretty text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
                Your activity, updates, and messages in one place.
              </p>
            </div>
          </div>
        </header>

        <NotificationsHistoryView title='' variant='member' />
      </div>
    </div>
  );
}
