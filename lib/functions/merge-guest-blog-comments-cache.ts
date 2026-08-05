import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import type { Comment, CommentParentRef, CommentUser } from '@/lib/interfaces/comment';
import type { Picture } from '@/lib/interfaces/picture';
import type { GuestCommentsResponse } from '@/lib/interfaces/guest-comments';
import type { GuestBlogCommentsQueryKey } from '@/lib/constants/guest-blog-comments-query';
import {
  GUEST_BLOG_COMMENTS_ORDER,
  GUEST_BLOG_COMMENTS_PAGE_SIZE,
  GUEST_BLOG_COMMENTS_SORT_BY,
} from '@/lib/constants/guest-blog-comments-query';

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return new Date(String(value)).toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function coercePictureId(raw: unknown): number | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && /^\d+$/.test(raw)) return parseInt(raw, 10);
  return undefined;
}

function isCloudinaryUrl(path: string): boolean {
  return /^https?:\/\/res\.cloudinary\.com\//i.test(path);
}

function parseCommentPicture(value: unknown): Picture | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (!isRecord(value)) return null;
  const pathRaw = value.path;
  if (typeof pathRaw !== 'string' || !pathRaw.trim()) return null;
  const path = pathRaw.trim();
  if (!isCloudinaryUrl(path)) return null;
  const id = coercePictureId(value.id);
  const idFinal = id ?? 0;
  const name = typeof value.name === 'string' ? value.name : '';
  const sizeRaw = value.size;
  const size =
    typeof sizeRaw === 'string'
      ? sizeRaw
      : typeof sizeRaw === 'number'
        ? String(sizeRaw)
        : '';
  const createdRaw = value.createdAt ?? value.createAt;
  const updatedRaw = value.updatedAt ?? value.updateAt;
  const createdAt =
    typeof createdRaw === 'string'
      ? createdRaw
      : createdRaw instanceof Date
        ? createdRaw.toISOString()
        : new Date().toISOString();
  const updatedAt =
    typeof updatedRaw === 'string'
      ? updatedRaw
      : updatedRaw instanceof Date
        ? updatedRaw.toISOString()
        : createdAt;
  return { id: idFinal, name, path, size, createdAt, updatedAt };
}

function pickCommentUserPicture(
  fromAvatarKey: Picture | null | undefined,
  fromPictureKey: Picture | null | undefined,
): Picture | null | undefined {
  const usePrimary =
    fromAvatarKey !== undefined && fromAvatarKey !== null ? fromAvatarKey : null;
  if (usePrimary) return usePrimary;

  const useSecondary =
    fromPictureKey !== undefined && fromPictureKey !== null
      ? fromPictureKey
      : null;
  if (useSecondary) return useSecondary;

  if (fromAvatarKey !== undefined) return fromAvatarKey;
  if (fromPictureKey !== undefined) return fromPictureKey;

  return undefined;
}

function parseCommentUser(value: unknown): CommentUser | null {
  if (!isRecord(value)) return null;
  const id = value.id;
  const firstName = value.firstName;
  if (typeof id !== 'number' || typeof firstName !== 'string') return null;
  const lastNameRaw = value.lastName;
  const lastName =
    lastNameRaw === null || typeof lastNameRaw === 'string'
      ? lastNameRaw
      : null;
  const parsedAvatarSlot = parseCommentPicture(value.avatar);
  const parsedPictureSlot = parseCommentPicture(value.picture);
  const avatar = pickCommentUserPicture(parsedAvatarSlot, parsedPictureSlot);

  const user: CommentUser = { id, firstName, lastName };
  if (avatar !== undefined) {
    user.avatar = avatar;
  }
  return user;
}

function parseParentRef(value: unknown): CommentParentRef | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) return null;
  const id = value.id;
  const content = value.content;
  if (typeof id !== 'number' || typeof content !== 'string') return null;
  const isReply = value.isReply;
  return {
    id,
    content,
    createdAt: toIsoString(value.createdAt),
    updatedAt: toIsoString(value.updatedAt),
    isReply: typeof isReply === 'boolean' ? isReply : false,
  };
}

/**
 * Normalizes a Socket.IO / REST payload into the `Comment` shape used by the blog UI.
 */
export function normalizeCommentPayload(raw: unknown): Comment | null {
  if (!isRecord(raw)) return null;
  const id = raw.id;
  const content = raw.content;
  if (typeof id !== 'number' || typeof content !== 'string') return null;
  const user = parseCommentUser(raw.user);
  if (!user) return null;
  const isReply = raw.isReply;
  return {
    id,
    content,
    createdAt: toIsoString(raw.createdAt),
    updatedAt: toIsoString(raw.updatedAt),
    parentId: parseParentRef(raw.parentId),
    isReply: typeof isReply === 'boolean' ? isReply : false,
    user,
  };
}

function compareBySort(a: Comment, b: Comment): number {
  const key = GUEST_BLOG_COMMENTS_SORT_BY;
  const av =
    key === 'updatedAt'
      ? new Date(a.updatedAt).getTime()
      : new Date(a.createdAt).getTime();
  const bv =
    key === 'updatedAt'
      ? new Date(b.updatedAt).getTime()
      : new Date(b.createdAt).getTime();
  return GUEST_BLOG_COMMENTS_ORDER === 'DESC' ? bv - av : av - bv;
}

export type MergeGuestBlogCommentsOp =
  | { type: 'upsert'; comment: Comment }
  | { type: 'delete'; commentId: number };

/**
 * Merges a realtime or mutation result into the infinite comments query cache.
 * No-ops if the query has not been loaded yet (callers may invalidate instead).
 */
export function mergeGuestBlogCommentsInfiniteCache(
  queryClient: QueryClient,
  queryKey: GuestBlogCommentsQueryKey,
  op: MergeGuestBlogCommentsOp,
): void {
  const old = queryClient.getQueryData<InfiniteData<GuestCommentsResponse>>(
    queryKey,
  );
  if (!old?.pages?.length) {
    return;
  }

  const pageSize = old.pages[0].meta.itemsPerPage ?? GUEST_BLOG_COMMENTS_PAGE_SIZE;
  const pageCount = old.pages.length;
  const capacity = pageCount * pageSize;
  const prevFlat = old.pages.flatMap((p) => p.results);

  let nextFlat: Comment[];
  let totalItems = old.pages[0].meta.totalItems;

  if (op.type === 'delete') {
    nextFlat = prevFlat.filter((c) => c.id !== op.commentId);
    totalItems = Math.max(0, totalItems - 1);
  } else {
    const had = prevFlat.some((c) => c.id === op.comment.id);
    nextFlat = prevFlat.filter((c) => c.id !== op.comment.id);
    nextFlat.push(op.comment);
    if (!had) totalItems += 1;
  }

  nextFlat.sort(compareBySort);
  const trimmed = nextFlat.slice(0, capacity);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const newPages = old.pages.map((base, i) => {
    const start = i * pageSize;
    const results = trimmed.slice(start, start + pageSize);
    return {
      ...base,
      results,
      meta: {
        ...base.meta,
        totalItems,
        totalPages,
        itemsPerPage: pageSize,
        currentPage: i + 1,
      },
    };
  });

  queryClient.setQueryData<InfiniteData<GuestCommentsResponse>>(queryKey, {
    ...old,
    pages: newPages,
  });
}
