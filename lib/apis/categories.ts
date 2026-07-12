import apiClient from '../axios/axios';

import { handleApiError } from '../functions/handle-api-error';

// get all categories
export type FetchCategoriesParams = Readonly<{
  page?: number;
  limit?: number;
  withDeleted?: boolean;
  /** Keyword search; omit or empty after trim = no filter (backend). */
  search?: string;
}>;

export const fetchCategories = async ({
  page = 1,
  limit = 1000,
  withDeleted = false,
  search,
}: FetchCategoriesParams = {}) => {
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

    const res = await apiClient.get(`/categories?${params.toString()}`, {
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch categories error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[FETCH_CATEGORIES]: ', res.data);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Fetch categories error!');
  }
};

// create category
export type CreateCategoryPayload = {
  name: string;
  description?: string;
};

export const createCategory = async ({
  payload,
}: {
  payload: CreateCategoryPayload;
}) => {
  try {
    const res = await apiClient.post('/categories', payload, {
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Create category error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[CREATE_CATEGORY]: ', res.data);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Create category error!');
  }
};

// get category by id
interface FetchCategoryParams {
  categoryId: number | null;
  signal?: AbortSignal;
}

export const fetchCategory = async ({
  categoryId,
  signal,
}: FetchCategoryParams) => {
  console.log('[fetchCategory]: ', categoryId);

  if (!categoryId) throw new Error('Category ID is required xxx');

  try {
    const res = await apiClient.get(`/categories/${categoryId}`, {
      signal,
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch category error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[FETCH_CATEGORY]: ', res.data);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Fetch category by ID error!');
  }
};

// update category
export type UpdateCategoryPayload = {
  categoryId: number | null;
  name?: string | null;
  description?: string | null;
};

export const updateCategory = async ({
  payload,
}: {
  payload: UpdateCategoryPayload;
}) => {
  if (!payload.categoryId) throw new Error('Category ID is required!');

  try {
    const res = await apiClient.patch('/categories', payload, {
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Update category error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[UPDATE_CATEGORY]: ', res.data);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Update category error!');
  }
};

// Permanent category delete
export const deletePermanentCategory = async ({
  categoryId,
}: {
  categoryId: number | null;
}) => {
  if (!categoryId) throw new Error('Category ID is required!');

  try {
    const res = await apiClient.delete(`/categories/${categoryId}/permanent`, {
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Permanent delete category error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[DELETE_CATEGORY]: ', res.data);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Permanent delete category error!');
  }
};