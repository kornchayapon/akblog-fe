import apiClient from "../axios/axios";

import { handleApiError } from "../functions/handle-api-error";

export type AdminBlogListSortOrder = 'ASC' | 'DESC';

export type FetchAdminBlogsParams = Readonly<{
  page: number;
  limit: number;
  withDeleted?: boolean;
  /** Keyword search (Nest ILike on title, content, author names). When set, also sends sort + status bundle for admin listing. */
  search?: string;
  status?: string;
  sortBy?: string;
  order?: AdminBlogListSortOrder;
}>;

// get all blogs (admin list; optional server-side search)
export const fetchBlogs = async ({
  page,
  limit,
  withDeleted = false,
  search,
  status,
  sortBy,
  order,
}: FetchAdminBlogsParams) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      withDeleted: String(withDeleted),
    });

    const trimmedSearch = search?.trim() ?? '';
    if (trimmedSearch.length > 0) {
      params.set('search', trimmedSearch);
      params.set('sortBy', sortBy ?? 'updatedAt');
      params.set('order', order ?? 'DESC');
      params.set('status', status ?? 'all');
    }

    const res = await apiClient.get(`/blogs?${params.toString()}`, {
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
};

// create blog
export type CreateBlogPayload = {
  title: string;
  content?: string | null;
  category?: number | null;
  thumbnail?: number | null;
  pictures?: number[] | null;
  tags?: number[] | null;
};

export const createBlog = async ({
  payload,
}: {
  payload: CreateBlogPayload;
}) => {
  try {
    const res = await apiClient.post('/blogs', payload, {
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Create blog error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[CREATE_BLOG]: ', res.data);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Create blog error!');
  }
};