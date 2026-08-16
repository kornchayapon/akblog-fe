'use client';

import { useState } from 'react';
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../hooks/use-notifications';
import { NotificationItem } from '../components/notification-item';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

interface NotificationsHistoryViewProps {
  /** Optional title (hidden when empty) */
  title?: string;
  /** member = full-width beautiful layout; admin = compact card layout */
  variant?: 'member' | 'admin';
}

export function NotificationsHistoryView({
  title = 'Notifications',
  variant = 'admin',
}: NotificationsHistoryViewProps) {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading, isFetching, isError, error } = useNotifications(
    page,
    PAGE_SIZE,
    unreadOnly,
  );
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = data?.results ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const totalItems = meta?.totalItems ?? 0;
  const currentPage = meta?.currentPage ?? 1;
  const hasUnread = notifications.some((n) => !n.readAt);
  const showPagination = totalPages > 1;

  const handleMarkAsRead = (id: number) => markAsRead.mutate(id);
  const handleMarkAllAsRead = () => markAllAsRead.mutate();

  /* ─── Filter buttons (shared controls; layout differs for member vs admin) ─── */
  const markAllClass =
    'rounded-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50';

  const filterChips = (
    <>
      <Button
        variant={!unreadOnly ? 'default' : 'outline'}
        size='sm'
        className={
          !unreadOnly
            ? 'rounded-full bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
            : 'rounded-full'
        }
        onClick={() => {
          setUnreadOnly(false);
          setPage(1);
        }}
      >
        All
      </Button>
      <Button
        variant={unreadOnly ? 'default' : 'outline'}
        size='sm'
        className={
          unreadOnly
            ? 'rounded-full bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
            : 'rounded-full'
        }
        onClick={() => {
          setUnreadOnly(true);
          setPage(1);
        }}
      >
        Unread
      </Button>
    </>
  );

  const markAllButton = (extraClass?: string) =>
    hasUnread ? (
      <Button
        variant='ghost'
        size='sm'
        className={cn(markAllClass, extraClass)}
        onClick={handleMarkAllAsRead}
        disabled={markAllAsRead.isPending}
      >
        <Check className='h-4 w-4 mr-1' />
        Mark all as read
      </Button>
    ) : null;

  const memberFilterRow = (
    <div className='flex min-w-0 flex-wrap items-center gap-2'>
      {filterChips}
      {markAllButton('ml-auto')}
    </div>
  );

  const adminFilterRow = (
    <div className='flex min-w-0 w-full justify-end sm:w-auto sm:flex-1'>
      <div className='flex min-w-0 max-w-full flex-wrap items-center justify-end gap-2'>
        {filterChips}
        {markAllButton()}
      </div>
    </div>
  );

  /* ─── Loading / Error / Empty / List content ─── */
  const content = (
    <>
      {isLoading ? (
        <div className='flex flex-col items-center justify-center py-20'>
          <Loader2 className='h-8 w-8 animate-spin text-emerald-500 mb-4' />
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            Loading notifications...
          </p>
        </div>
      ) : isError ? (
        <div className='flex flex-col items-center justify-center py-20 px-4 text-center'>
          <div className='w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4'>
            <Bell className='h-8 w-8 text-red-400 dark:text-red-500' />
          </div>
          <p className='text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'>
            Unable to load notifications
          </p>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {(error as Error)?.message ?? 'Please try again'}
          </p>
        </div>
      ) : notifications.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
          <div className='w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4'>
            <Inbox className='h-8 w-8 text-slate-400 dark:text-slate-500' />
          </div>
          <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
            {unreadOnly
              ? 'No unread notifications'
              : 'No notifications yet'}
          </p>
          <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
            {unreadOnly
              ? 'Try viewing the "All" tab instead'
              : 'When new notifications arrive, they will appear here'}
          </p>
        </div>
      ) : (
        <>
          <div
            className={
              variant === 'member'
                ? 'flex flex-col gap-0.5 p-4'
                : 'flex flex-col gap-0.5'
            }
          >
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
              />
            ))}
          </div>

          {/* Pagination */}
          {showPagination && (
            <>
              <Separator />
              <div className='flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3'>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  Page {currentPage} of {totalPages} ({totalItems} items)
                </p>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='rounded-xl h-8'
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1 || isFetching}
                  >
                    <ChevronLeft className='h-4 w-4 mr-1' />
                    Previous
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='rounded-xl h-8'
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages || isFetching}
                  >
                    Next
                    <ChevronRight className='h-4 w-4 ml-1' />
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );

  /* ─── Member variant layout ─── */
  if (variant === 'member') {
    return (
      <div className='space-y-5'>
        {memberFilterRow}

        <Card className='rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden'>
          <CardContent className='p-0'>{content}</CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Admin variant layout ─── */
  return (
    <div className='min-w-0 max-w-full px-4 lg:px-6'>
      <Card className='rounded-2xl overflow-hidden'>
        <CardHeader className='flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-x-4'>
          {title && (
            <CardTitle className='flex min-w-0 items-center gap-2 text-lg'>
              <Bell className='h-5 w-5 shrink-0 text-emerald-500' />
              <span className='truncate'>{title}</span>
            </CardTitle>
          )}
          {adminFilterRow}
        </CardHeader>
        <Separator />
        <CardContent className='p-0'>{content}</CardContent>
      </Card>
    </div>
  );
}
