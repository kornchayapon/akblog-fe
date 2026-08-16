/**
 * `data` shapes (examples):
 * - Blog published: `{ blogId, slug | blogSlug, blogUrl? }` — front links use `/blogs/{slug}`.
 */
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export interface PaginatedNotifications {
  results: Notification[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}
