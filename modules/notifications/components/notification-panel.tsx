'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNotificationStore } from '../stores/notification-store';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../hooks/use-notifications';
import { NotificationItem } from './notification-item';

/**
 * Dropdown panel that displays the notification list.
 * Renders inside a Popover from NotificationBell.
 */
interface NotificationPanelProps {
  /** member = user/guest navbar; admin = admin sidebar header */
  variant?: 'member' | 'admin';
}

export function NotificationPanel({ variant = 'member' }: NotificationPanelProps) {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setPanelOpen = useNotificationStore((s) => s.setPanelOpen);
  const panelRef = useRef<HTMLDivElement>(null);

  const historyHref =
    variant === 'admin' ? '/admin/notifications' : '/notifications';

  // Fetch latest notifications when panel mounts
  const { data, isLoading } = useNotifications(1, 20);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = data?.results ?? [];

  // Focus panel on open
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <div
      ref={panelRef}
      role='dialog'
      aria-label='Notifications'
      tabIndex={-1}
      className='flex max-h-[min(480px,85vh)] w-[min(400px,calc(100vw-2rem))] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5 focus-visible:outline-none dark:border-slate-800 dark:bg-slate-950 dark:ring-white/10 dark:shadow-black/40'
    >
      <div
        className='h-0.5 w-full shrink-0 bg-linear-to-r from-emerald-500/90 via-emerald-400/50 to-transparent dark:from-emerald-400/80 dark:via-emerald-500/40'
        aria-hidden
      />

      {/* Header */}
      <div className='flex min-w-0 shrink-0 flex-wrap items-start justify-between gap-x-3 gap-y-2 px-4 pb-3 pt-3.5'>
        <div className='min-w-0 flex-1'>
          <div className='flex min-w-0 items-center gap-2'>
            <h2 className='truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50'>
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className='flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold tabular-nums text-white shadow-sm ring-2 ring-white dark:ring-slate-950'>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <p className='mt-0.5 text-xs text-slate-500 dark:text-slate-400'>
            {variant === 'admin'
              ? 'Team and platform updates'
              : 'Recent activity for your account'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant='ghost'
            size='sm'
            className='h-8 shrink-0 gap-1.5 rounded-full px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300'
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
          >
            <Check className='h-3.5 w-3.5 shrink-0' strokeWidth={2.5} />
            <span className='whitespace-nowrap'>Mark all read</span>
          </Button>
        )}
      </div>

      <Separator className='shrink-0 bg-slate-100 dark:bg-slate-800' />

      {/* Native scroll in a flex-1 min-h-0 region — avoids Radix Viewport + max-h overlap with footer */}
      <div
        className='min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]'
        role='region'
        aria-label='Recent notifications'
      >
        {isLoading ? (
          <div className='flex min-h-48 flex-col items-center justify-center gap-2 py-14'>
            <Loader2
              className='h-6 w-6 animate-spin text-emerald-500'
              aria-hidden
            />
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Loading…
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className='flex min-h-48 flex-col items-center justify-center px-4 py-14 text-center'>
            <div className='mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800/80'>
              <Bell className='h-7 w-7 text-slate-400 dark:text-slate-500' />
            </div>
            <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
              You&apos;re all caught up
            </p>
            <p className='mt-1 max-w-[240px] text-xs leading-relaxed text-slate-500 dark:text-slate-400'>
              New alerts will show up here when there&apos;s something to review.
            </p>
          </div>
        ) : (
          <div className='flex flex-col gap-0.5 p-0.5'>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleMarkAsRead}
                onDelete={(id) => deleteNotification.mutate(id)}
                deletingId={
                  deleteNotification.isPending
                    ? deleteNotification.variables ?? null
                    : null
                }
                variant={variant}
                onDismiss={() => setPanelOpen(false)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer — shrink-0 + opaque bg so it stays below the scroll viewport, never on top of rows */}
      {notifications.length > 0 && (
        <div className='shrink-0 border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950'>
          <div className='p-2'>
            <Button
              variant='outline'
              asChild
              className='h-9 w-full border-emerald-200/80 bg-emerald-50/50 text-sm font-semibold text-emerald-900 shadow-none hover:bg-emerald-100/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-950/70'
              onClick={() => setPanelOpen(false)}
            >
              <Link href={historyHref} className='inline-flex items-center gap-2'>
                View full history
                <ArrowRight className='h-4 w-4 opacity-70' aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
