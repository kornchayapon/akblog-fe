'use client';

import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';

import type { GuestBlogCommentsQueryKey } from '@/lib/constants/guest-blog-comments-query';
import {
  mergeGuestBlogCommentsInfiniteCache,
  normalizeCommentPayload,
} from '@/lib/functions/merge-guest-blog-comments-cache';
import { queryClient } from '@/lib/react-query/query-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002';

const WS_DISABLED =
  process.env.NEXT_PUBLIC_DISABLE_COMMENT_SOCKET === 'true';

/**
 * Subscribes to `/blog-comments` for a blog post (no JWT). Updates the infinite
 * comments query cache when peers create, update, or delete comments.
 *
 * Uses `setTimeout(0)` before connecting to avoid React Strict Mode handshake issues.
 */
export function useBlogCommentsSocket(
  blogId: number | undefined,
  queryKey: GuestBlogCommentsQueryKey | undefined,
  enabled: boolean,
): void {
  useEffect(() => {
    if (WS_DISABLED || !enabled || !blogId || !queryKey) return undefined;

    let activeSocket: Socket | null = null;

    const invalidate = (): void => {
      void queryClient.invalidateQueries({ queryKey });
    };

    const ensureCacheThenMerge = (
      run: () => void,
    ): void => {
      const data = queryClient.getQueryData(queryKey);
      if (!data) {
        invalidate();
        return;
      }
      run();
    };

    const timeoutId = window.setTimeout(() => {
      const socket = io(`${WS_URL}/blog-comments`, {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      });

      socket.on('connect', () => {
        socket.emit('joinBlog', { blogId });
      });

      socket.on('commentCreated', (raw: unknown) => {
        const c = normalizeCommentPayload(raw);
        if (!c) {
          invalidate();
          return;
        }
        ensureCacheThenMerge(() => {
          mergeGuestBlogCommentsInfiniteCache(queryClient, queryKey, {
            type: 'upsert',
            comment: c,
          });
        });
      });

      socket.on('commentUpdated', (raw: unknown) => {
        const c = normalizeCommentPayload(raw);
        if (!c) {
          invalidate();
          return;
        }
        ensureCacheThenMerge(() => {
          mergeGuestBlogCommentsInfiniteCache(queryClient, queryKey, {
            type: 'upsert',
            comment: c,
          });
        });
      });

      socket.on('commentDeleted', (raw: unknown) => {
        if (
          typeof raw !== 'object' ||
          raw === null ||
          typeof (raw as { commentId?: unknown }).commentId !== 'number'
        ) {
          invalidate();
          return;
        }
        const { commentId } = raw as { commentId: number };
        ensureCacheThenMerge(() => {
          mergeGuestBlogCommentsInfiniteCache(queryClient, queryKey, {
            type: 'delete',
            commentId,
          });
        });
      });

      activeSocket = socket;
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      if (activeSocket) {
        activeSocket.emit('leaveBlog', { blogId });
        activeSocket.disconnect();
      }
    };
  }, [blogId, enabled, queryKey]);
}
