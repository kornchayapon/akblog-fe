import apiClient from '../axios/axios';
import { handleApiError } from '../functions/handle-api-error';
import { normalizeCommentPayload } from '../functions/merge-guest-blog-comments-cache';
import type { Comment } from '../interfaces/comment';
import type { GuestCommentsResponse } from '../interfaces/guest-comments';

export type FetchCommentsByBlogParams = Readonly<{
  blogId: number;
  page: number;
  limit: number;
  sortBy?: string;
  orderBy?: 'ASC' | 'DESC';
  withDeleted?: boolean;
}>;

// fetch comments by blog (paginated)
export const fetchCommentsByBlog = async ({
  blogId,
  page,
  limit,
  sortBy,
  orderBy,
  withDeleted,
}: FetchCommentsByBlogParams): Promise<GuestCommentsResponse> => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (sortBy?.trim()) params.set('sortBy', sortBy.trim());
    if (orderBy) params.set('orderBy', orderBy);
    if (typeof withDeleted === 'boolean') {
      params.set('withDeleted', String(withDeleted));
    }

    const res = await apiClient.get(
      `/comments/${blogId}?${params.toString()}`,
      {
        validateStatus: () => true,
      },
    );

    console.log('[FETCH COMMENT]: ', res.data);

    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch comments error!';
      throw new Error(message);
    }

    const raw = res.data as GuestCommentsResponse;
    const normalizedResults = raw.results.map(
      (item) => normalizeCommentPayload(item) ?? (item as Comment),
    );

    return {
      ...raw,
      results: normalizedResults,
    };
  } catch (error: unknown) {
    handleApiError(error, 'Fetch comments error!');
    throw error;
  }
};

// create comment
export type CreateCommentPayload = {
  content: string;
  blog: number;
  /** Parent comment id when posting a reply (Nest `parentId`). */
  parentId?: number;
};

export const createComment = async ({
  payload,
}: {
  payload: CreateCommentPayload;
}): Promise<Comment> => {
  try {
    const res = await apiClient.post('/comments', payload, {
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Create comment error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[CREATE_COMMENT]: ', res.data);

    return res.data as Comment;
  } catch (error: unknown) {
    handleApiError(error, 'Create comment error!');
    throw error;
  }
};

export type UpdateCommentPayload = {
  content: string;
  blog: number;
};

export const updateComment = async ({
  commentId,
  payload,
}: {
  commentId: number;
  payload: UpdateCommentPayload;
}): Promise<Comment> => {
  try {
    const res = await apiClient.patch(`/comments/item/${commentId}`, payload, {
      withCredentials: true,
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Update comment error!';
      throw new Error(message);
    }

    return res.data as Comment;
  } catch (error: unknown) {
    handleApiError(error, 'Update comment error!');
    throw error;
  }
};

export const deleteComment = async ({
  commentId,
}: {
  commentId: number;
}): Promise<void> => {
  try {
    const res = await apiClient.delete(`/comments/item/${commentId}`, {
      withCredentials: true,
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Delete comment error!';
      throw new Error(message);
    }
  } catch (error: unknown) {
    handleApiError(error, 'Delete comment error!');
    throw error;
  }
};
