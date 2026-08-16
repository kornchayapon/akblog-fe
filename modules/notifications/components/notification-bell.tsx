'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '../stores/notification-store';
import { useUnreadCount } from '../hooks/use-notifications';
import { NotificationPanel } from './notification-panel';

interface NotificationBellProps {
  /** Adjust icon colour when over a dark hero section */
  isDarkHeader?: boolean;
  /** member = user/guest navbar; admin = admin sidebar header. Affects notification link targets. */
  variant?: 'member' | 'admin';
  /** Optional extra class names */
  className?: string;
}

/**
 * Notification bell icon with unread badge.
 * Opens a Popover with the NotificationPanel on click.
 */
export function NotificationBell({
  isDarkHeader = false,
  variant = 'member',
  className,
}: NotificationBellProps) {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const isPanelOpen = useNotificationStore((s) => s.isPanelOpen);
  const setPanelOpen = useNotificationStore((s) => s.setPanelOpen);

  // Fetch initial unread count
  useUnreadCount();

  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <Popover open={isPanelOpen} onOpenChange={setPanelOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          aria-expanded={isPanelOpen}
          aria-haspopup='dialog'
          className={cn(
            'relative size-10 shrink-0 rounded-full transition-colors duration-200',
            isDarkHeader
              ? 'text-white hover:bg-white/15 focus-visible:ring-white/40'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-slate-950',
            className,
          )}
        >
          <Bell
            className={cn(
              'size-[22px]',
              unreadCount > 0 && 'text-emerald-600 dark:text-emerald-400',
            )}
            strokeWidth={unreadCount > 0 ? 2.25 : 2}
            aria-hidden
          />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums leading-none text-white shadow-md',
                isDarkHeader
                  ? 'bg-emerald-400 text-slate-950 ring-2 ring-white/20'
                  : 'bg-emerald-500 ring-2 ring-white dark:bg-emerald-500 dark:ring-slate-950',
              )}
              aria-hidden
            >
              {displayCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align='end'
        sideOffset={10}
        collisionPadding={16}
        className='w-auto max-w-[calc(100vw-2rem)] min-w-0 border-0 bg-transparent p-0 shadow-none'
      >
        <NotificationPanel variant={variant} />
      </PopoverContent>
    </Popover>
  );
}
