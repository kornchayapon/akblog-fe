'use client';

import type { KeyboardEvent, ReactNode } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  Bell,
  BookOpen,
  FileText,
  UserPlus,
  ShieldCheck,
  GraduationCap,
  CreditCard,
  MessageCircle,
  ChevronRight,
  Trash2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/interfaces/notification';

/** Align API casing (e.g. `USER_REGISTERED`) with routing and `typeConfig` keys. */
function normalizeNotificationType(type: string): string {
  return type.trim().toLowerCase();
}

/** Public blog read URL: `/blogs/{slug}` — same as `(front)/blogs/[slug]`. */
function getBlogReadPath(data: Record<string, unknown> | null): string | undefined {
  if (!data) return undefined;

  const slugValue = data.slug ?? data.blogSlug;
  if (typeof slugValue === 'string') {
    const slug = slugValue.trim();
    if (slug.length > 0) {
      return `/blogs/${slug}`;
    }
  }

  const blogUrl = data.blogUrl;
  if (typeof blogUrl === 'string' && blogUrl.length > 0) {
    try {
      const pathname = new URL(blogUrl).pathname;
      if (pathname.startsWith('/blogs/')) {
        const rest = pathname.slice('/blogs/'.length);
        if (rest.length > 0 && !rest.includes('/')) {
          return `/blogs/${rest}`;
        }
      }
    } catch {
      if (blogUrl.startsWith('/blogs/')) {
        const rest = blogUrl.slice('/blogs/'.length).split('?')[0];
        if (rest.length > 0 && !rest.includes('/')) {
          return `/blogs/${rest}`;
        }
      }
    }
  }

  return undefined;
}

/* ─── Resolve notification link by type + variant (backend data structure) ─── */

export function getNotificationLink(
  notification: Notification,
  variant: 'member' | 'admin',
): string | undefined {
  const data = notification.data;
  const type = normalizeNotificationType(notification.type);

  const isBlogType = type === 'blog' || type === 'blog_published';

  if (variant === 'member') {
    if (isBlogType) {
      return getBlogReadPath(data);
    }
    if (type === 'user_registered' || type === 'email_verified') {
      return '/admin/users';
    }
    /* if (type === 'article') {
      const contentId = data?.contentId;
      if (typeof contentId === 'number') return `/articles/${contentId}`;
    } */
    /* if (type === 'course') {
      const contentId = data?.contentId;
      if (typeof contentId === 'number') return `/course/${contentId}`;
    }
    if (type === 'enrollment') {
      const contentUrl = data?.contentUrl;
      if (typeof contentUrl === 'string') return contentUrl;
    } */
    const contentUrl = data?.contentUrl;
    if (typeof contentUrl === 'string') return contentUrl;
    return undefined;
  }

  if (variant === 'admin') {
    if (isBlogType) {
      const fromSlug = getBlogReadPath(data);
      if (fromSlug) return fromSlug;
      const blogId = data?.blogId;
      if (typeof blogId === 'number') return `/admin/blogs/update/${blogId}`;
      return undefined;
    }
    if (type === 'user_registered' || type === 'email_verified') return '/admin/users';
    if (type === 'enrollment') return '/admin/enrolls';
    return undefined;
  }

  return undefined;
}

/* ─── Icon & color map per notification type ─── */

const typeConfig: Record<
  string,
  { icon: ReactNode; bgClass: string }
> = {
  system: {
    icon: <Bell className='h-4 w-4 text-slate-600 dark:text-slate-300' />,
    bgClass: 'bg-slate-100 dark:bg-slate-800',
  },
  course: {
    icon: <BookOpen className='h-4 w-4 text-emerald-700 dark:text-emerald-400' />,
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/30',
  },
  article: {
    icon: <FileText className='h-4 w-4 text-blue-600 dark:text-blue-400' />,
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
  },
  blog: {
    icon: <FileText className='h-4 w-4 text-blue-600 dark:text-blue-400' />,
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
  },
  blog_published: {
    icon: <FileText className='h-4 w-4 text-blue-600 dark:text-blue-400' />,
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
  },
  payment: {
    icon: <CreditCard className='h-4 w-4 text-green-600 dark:text-green-400' />,
    bgClass: 'bg-green-50 dark:bg-green-900/30',
  },
  enrollment: {
    icon: <GraduationCap className='h-4 w-4 text-purple-600 dark:text-purple-400' />,
    bgClass: 'bg-purple-50 dark:bg-purple-900/30',
  },
  user_registered: {
    icon: <UserPlus className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />,
    bgClass: 'bg-indigo-50 dark:bg-indigo-900/30',
  },
  email_verified: {
    icon: <ShieldCheck className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />,
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/30',
  },
  chat: {
    icon: <MessageCircle className='h-4 w-4 text-sky-600 dark:text-sky-400' />,
    bgClass: 'bg-sky-50 dark:bg-sky-900/30',
  },
};

const defaultConfig = {
  icon: <Bell className='h-4 w-4 text-slate-500 dark:text-slate-400' />,
  bgClass: 'bg-slate-100 dark:bg-slate-800',
};

/* ─── Component ─── */

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: number) => void;
  /** member = card style with optional link; admin = compact list row */
  variant?: 'member' | 'admin';
  /** Called when user clicks delete. When provided, a delete button is shown. */
  onDelete?: (id: number) => void;
  /** Id of the notification currently being deleted (shows loading on that row). */
  deletingId?: number | null;
  /** e.g. close popover after open/open link — header panel only */
  onDismiss?: () => void;
}

export function NotificationItem({
  notification,
  onRead,
  variant = 'admin',
  onDelete,
  deletingId = null,
  onDismiss,
}: NotificationItemProps) {
  const isUnread = !notification.readAt;
  const normalizedType = normalizeNotificationType(notification.type);
  const config = typeConfig[normalizedType] ?? defaultConfig;
  const href = getNotificationLink(notification, variant);

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: enUS,
  });

  const handleClick = () => {
    if (isUnread) {
      onRead(notification.id);
    }
    onDismiss?.();
  };

  const ariaLabel = `${notification.title}${isUnread ? ' (Unread)' : ''}`;

  const handlePrimaryKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  /* ─── Shell (card / row) + primary target must not wrap <button> (delete) ─── */
  const shellClass = cn(
    'w-full min-w-0 flex items-start',
    variant === 'member' &&
      cn(
        'relative rounded-xl border',
        isUnread
          ? 'border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-800/30 dark:bg-emerald-950/15'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
        'hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5 dark:hover:border-emerald-700',
      ),
    variant === 'admin' &&
      cn(
        'rounded-lg',
        isUnread ? 'bg-emerald-50/35 dark:bg-emerald-950/15' : '',
        'hover:bg-slate-50 dark:hover:bg-slate-800/60',
      ),
  );

  const primaryClass = cn(
    'flex flex-1 min-w-0 items-start gap-3 text-left transition-all duration-200 outline-none',
    variant === 'member' ? 'p-4' : 'px-4 py-3',
    'focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-1',
  );

  const mainContent = (
    <>
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
          config.bgClass,
        )}
      >
        {config.icon}
      </div>

      <div className='flex-1 min-w-0 overflow-hidden'>
        <p
          className={cn(
            'text-sm line-clamp-1 wrap-break-word',
            isUnread
              ? 'font-semibold text-slate-900 dark:text-white'
              : 'font-medium text-slate-600 dark:text-slate-300',
          )}
        >
          {notification.title}
        </p>
        {notification.message && (
          <p className='text-xs text-slate-500 dark:text-slate-400 line-clamp-2 wrap-break-word mt-0.5 leading-relaxed'>
            {notification.message}
          </p>
        )}
        <p className='text-[11px] text-slate-400 dark:text-slate-500 mt-1'>
          {timeAgo}
        </p>
      </div>

      {variant === 'member' && href && (
        <ChevronRight className='h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5' />
      )}

      {isUnread && (
        <span
          className={cn(
            'shrink-0 rounded-full bg-emerald-500',
            variant === 'member'
              ? 'absolute top-3 h-2.5 w-2.5 ring-2 ring-white dark:ring-slate-900'
              : 'mt-2 h-2 w-2',
            variant === 'member' && (onDelete ? 'right-12' : 'right-3'),
          )}
          aria-hidden
        />
      )}
    </>
  );

  const deleteControl =
    onDelete ? (
      <button
        type='button'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(notification.id);
        }}
        disabled={deletingId === notification.id}
        className={cn(
          'shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50',
          variant === 'member' && 'absolute top-3 right-3',
          variant === 'admin' && 'self-start py-3 pr-4',
        )}
        aria-label='Delete notification'
      >
        {deletingId === notification.id ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <Trash2 className='h-4 w-4' />
        )}
      </button>
    ) : null;

  const primary =
    href ? (
      <Link
        href={href}
        className={primaryClass}
        onClick={handleClick}
        aria-label={ariaLabel}
      >
        {mainContent}
      </Link>
    ) : (
      <div
        role='button'
        tabIndex={0}
        className={primaryClass}
        onClick={handleClick}
        onKeyDown={handlePrimaryKeyDown}
        aria-label={ariaLabel}
      >
        {mainContent}
      </div>
    );

  return (
    <div className={shellClass}>
      {primary}
      {deleteControl}
    </div>
  );
}
