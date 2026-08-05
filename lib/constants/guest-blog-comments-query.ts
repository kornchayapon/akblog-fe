import { GUEST_COMMENTS_KEY } from '@/lib/constants/query-key';

export const GUEST_BLOG_COMMENTS_PAGE_SIZE = 5;
export const GUEST_BLOG_COMMENTS_SORT_BY = 'updatedAt';
export const GUEST_BLOG_COMMENTS_ORDER = 'DESC' as const;

export type GuestBlogCommentsQueryKey = readonly [
  typeof GUEST_COMMENTS_KEY,
  number,
  typeof GUEST_BLOG_COMMENTS_PAGE_SIZE,
  string,
  typeof GUEST_BLOG_COMMENTS_ORDER,
];

export function getGuestBlogCommentsQueryKey(
  blogId: number,
): GuestBlogCommentsQueryKey {
  return [
    GUEST_COMMENTS_KEY,
    blogId,
    GUEST_BLOG_COMMENTS_PAGE_SIZE,
    GUEST_BLOG_COMMENTS_SORT_BY,
    GUEST_BLOG_COMMENTS_ORDER,
  ];
}
