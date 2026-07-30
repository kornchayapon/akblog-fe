import apiClient from "../axios/axios";

import { PublishStatusEnum } from "../enums/publish-status.enum";

import { GuestBlogsResponse } from "../interfaces/guest-blogs";

import { handleApiError } from "../functions/handle-api-error";
import { Blog, BlogDetail } from "../interfaces/blog";

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
  const trimmed = slug.trim();
  if (!trimmed) return null;

  // console.log('slug :', trimmed);
  // console.log('slug en:', encodeURIComponent(trimmed));
  

  try {
    const res = await apiClient.get(
      `/guest/blogs/${trimmed}`,
      {
        withCredentials: true,
        validateStatus: () => true,
      },
    );

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