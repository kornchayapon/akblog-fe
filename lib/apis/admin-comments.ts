import apiClient from '../axios/axios';
import { handleApiError } from '../functions/handle-api-error';
import type { AdminCommentsResponse } from '../interfaces/admin-comment';

export type FetchAdminCommentsParams = Readonly<{
  page: number;
  limit: number;
  sortBy?: string;
  orderBy?: 'ASC' | 'DESC';
  withDeleted?: boolean;
  /** Keyword search; omit or empty after trim = no filter (backend). */
  search?: string;
}>;

export const fetchAdminComments = async ({
  page,
  limit,
  sortBy,
  orderBy,
  withDeleted,
  search,
}: FetchAdminCommentsParams): Promise<AdminCommentsResponse> => {
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

    const trimmedSearch = search?.trim() ?? '';
    if (trimmedSearch.length > 0) {
      params.set('search', trimmedSearch);
    }

    const res = await apiClient.get(`/comments/all?${params.toString()}`, {
      withCredentials: true,
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch admin comments error!';
      throw new Error(message);
    }

    console.log('comment', res.data);
    

    return res.data as AdminCommentsResponse;
  } catch (error: unknown) {
    handleApiError(error, 'Fetch admin comments error!');
    throw error;
  }
};

export const softDeleteAdminComment = async ({
  commentId,
}: Readonly<{ commentId: number }>): Promise<void> => {
  try {
    const res = await apiClient.delete(`/comments/item/${commentId}`, {
      withCredentials: true,
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Soft delete comment error!';
      throw new Error(message);
    }
  } catch (error: unknown) {
    handleApiError(error, 'Soft delete comment error!');
    throw error;
  }
};

export const restoreAdminComment = async ({
  commentId,
}: Readonly<{ commentId: number }>): Promise<void> => {
  try {
    const res = await apiClient.patch(
      `/comments/item/${commentId}/restore`,
      undefined,
      {
        withCredentials: true,
        validateStatus: () => true,
      },
    );

    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Restore comment error!';
      throw new Error(message);
    }
  } catch (error: unknown) {
    handleApiError(error, 'Restore comment error!');
    throw error;
  }
};
