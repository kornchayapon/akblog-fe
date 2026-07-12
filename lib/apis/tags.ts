import apiClient from '../axios/axios';

import { handleApiError } from '../functions/handle-api-error';

// get all tags
export type FetchTagsParams = Readonly<{
  page?: number;
  limit?: number;
  withDeleted?: boolean;
  /** Keyword search; omit or empty after trim = no filter (backend). */
  search?: string;
}>;

export const fetchTags = async ({
  page = 1,
  limit = 1000,
  withDeleted = false,
  search,
}: FetchTagsParams = {}) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      withDeleted: String(withDeleted),
    });

    const trimmedSearch = search?.trim() ?? '';
    if (trimmedSearch.length > 0) {
      params.set('search', trimmedSearch);
    }

    const res = await apiClient.get(`/tags?${params.toString()}`, {
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch tags error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[FETCH_TAGS]: ', res.data);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Fetch tags error!');
  }
};

// get tag by id
interface FetchTagParams {
  tagId: number | null;
  signal?: AbortSignal;
}

export const fetchTag = async ({ tagId, signal }: FetchTagParams) => {
  if (!tagId) throw new Error('Tag ID is required xxx');

  try {
    const res = await apiClient.get(`/tags/${tagId}`, {
      signal,
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch tag error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[FETCH_TAG]: ', res.data);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Fetch tag by ID error!');
  }
};

// create tag
export type CreateTagPayload = {
  name: string;
  description?: string;
};

export const createTag = async ({ payload }: { payload: CreateTagPayload }) => {
  try {
    const res = await apiClient.post('/tags', payload, {
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Create tag error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[CREATE_TAG]: ', res.data);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Create tag error!');
  }
};

// update tag
export type UpdateTagPayload = {
  tagId: number | null;
  name?: string | null;
  description?: string | null;
};

export const updateTag = async ({ payload }: { payload: UpdateTagPayload }) => {
  if (!payload.tagId) throw new Error('Tag ID is required!');

  try {
    const res = await apiClient.patch('/tags', payload, {
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Update tag error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[UPDATE_TAG]: ', res.data);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Update tag error!');
  }
};

// Permanent tag delete
export const deletePermanentTag = async ({
  tagId,
}: {
  tagId: number | null;
}) => {
  if (!tagId) throw new Error('Tag ID is required!');

  try {
    const res = await apiClient.delete(`/tags/${tagId}/permanent`, {
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Permanent delete tag error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[DELETE_TAG]: ', res.data);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Permanent delete tag error!');
  }
};
