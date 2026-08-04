import apiClient from '../axios/axios';

import { PublishStatusEnum } from '../enums/publish-status.enum';

import { GuestBlogsResponse } from '../interfaces/guest-blogs';

import { handleApiError } from '../functions/handle-api-error';
import { BlogDetail } from '../interfaces/blog';

// get guest all blogs
export const fetchGuestBlogs = async ({
  page,
  limit,
  withDeleted = true,
  status,
}: {
  page: number;
  limit: number;
  withDeleted?: boolean;
  status?: PublishStatusEnum | null;
}): Promise<GuestBlogsResponse> => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      withDeleted: String(withDeleted),
    });

    if (status) params.set('status', status);

    const res = await apiClient.get(`/guest/blogs?${params.toString()}`, {
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch blogs error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[FETCH_BLOGS]: ', res.data);
    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Fetch blogs error!');
  }

  // handleApiError always throws; this is only for exhaustiveness.
  throw new Error('Fetch blogs error!');
};

/** Single published blog by slug (public guest). Proxies to GET /api/guest/blogs/:slug. */
export const fetchGuestBlogBySlug = async (
  slug: string,
): Promise<BlogDetail | null> => {
  try {
    const res = await apiClient.get(`/guest/blogs/${slug}`, {
      withCredentials: true,
      validateStatus: () => true,
    });

    if (res.status === 404) return null;

    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch blog by slug error';
      throw new Error(message);
    }

    // Success Response
    console.log('[GUEST_BLOG_DETAIL]: ', res.data);

    return res.data as BlogDetail;
  } catch (error: unknown) {
    handleApiError(error, 'Fetch blog by slug error');
  }

  throw new Error('Fetch blog by slug error');
};

// fetch blogs by category slug
export const fetchBlogsByCategory = async ({
  page,
  limit,
  withDeleted = true,
  status,
  slug,
}: {
  page: number;
  limit: number;
  withDeleted?: boolean;
  status?: PublishStatusEnum | null;
  slug: string;
}): Promise<GuestBlogsResponse> => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      withDeleted: String(withDeleted),
    });    

    if (status) params.set('status', status);

    // send request to server
    const res = await apiClient.get(
      `/guest/${slug}/categories?${params.toString()}`,
      {
        withCredentials: true,
        validateStatus: () => true,
      },
    );

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch blogs error!';
      throw new Error(message);
    }    

    // Success Response
    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Fetch blogs by category error');
  }

  throw new Error('Fetch blogs by category error');
};

// fetch blogs by tag slug
export const fetchBlogsByTag = async ({
  page,
  limit,
  withDeleted = true,
  status,
  slug,
}: {
  page: number;
  limit: number;
  withDeleted?: boolean;
  status?: PublishStatusEnum | null;
  slug: string;
}): Promise<GuestBlogsResponse> => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      withDeleted: String(withDeleted),
    });

    if (status) params.set('status', status);

    // send request to server
    const res = await apiClient.get(
      `/guest/${slug}/tags?${params.toString()}`,
      {
        withCredentials: true,
        validateStatus: () => true,
      },
    );

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch blogs error!';
      throw new Error(message);
    }

    // Success Response
    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Fetch blogs by tag error');
  }

  throw new Error('Fetch blogs by tag error');
};

export type GuestBlogSearchSortOrder = 'ASC' | 'DESC';

export type FetchGuestBlogsSearchParams = Readonly<{
  search: string;
  page: number;
  limit: number;
  status?: PublishStatusEnum | null;
  sortBy?: string;
  orderBy?: GuestBlogSearchSortOrder;
}>;

/** Keyword search via Nest GET /blogs (proxied when `search` is set). */
export const fetchGuestBlogsSearch = async ({
  search,
  page,
  limit,
  status = PublishStatusEnum.PUBLISHED,
  sortBy = 'updatedAt',
  orderBy = 'DESC',
}: FetchGuestBlogsSearchParams): Promise<GuestBlogsResponse> => {
  const trimmed = search.trim();
  if (!trimmed) {
    throw new Error('Search query cannot be empty');
  }

  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search: trimmed,
      sortBy,
      orderBy,
    });

    if (status) params.set('status', status);

    const res = await apiClient.get(`/guest/blogs?${params.toString()}`, {
      withCredentials: true,
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Search blogs error!';
      throw new Error(message);
    }

    return res.data as GuestBlogsResponse;
  } catch (error: unknown) {
    handleApiError(error, 'Search blogs error!');
  }

  throw new Error('Search blogs error!');
};