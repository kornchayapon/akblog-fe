import apiClient from "../axios/axios";

import { handleApiError } from "../functions/handle-api-error";

import { PublishStatusEnum } from "../enums/publish-status.enum";

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

// update blog
export type UpdateBlogPayload = {
  blogId: number | null;
  title?: string | null;
  content?: string | null;
  category?: number | null;
  status?: PublishStatusEnum | null;  
  tags?: number[] | null;
  thumbnail?: number | null;
  pictures?: number[] | null;
};

export const updateBlog = async ({
  payload,
}: {
  payload: UpdateBlogPayload;
}) => {
  if (!payload.blogId) {
    throw new Error('Blog ID is required!');
  }

  try {
    const res = await apiClient.patch('/blogs', payload, {
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Update blog error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[UPDATE_BLOG]: ', res.data);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Update blog error!');
  }
};

// fetch blog
export const fetchBlog = async ({
  blogId,
  signal,
}: {
  blogId?: number | null;
  signal?: AbortSignal;
}) => {
  if (!blogId) {
    throw new Error('Blog ID is required!');
  }

  try {
    const res = await apiClient.get(`/blogs/${blogId}`, {
      signal,
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch blog by ID error!';
      throw new Error(message);
    }

    console.log('[FETCH_BLOG]: ', res.data);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Fetch blog by ID error!');
  }
};

// soft delete
export const softDeleteBlog = async ({ blogId }: { blogId: number | null }) => {
  if (!blogId) throw new Error('Blog ID is required');

  try {
    const res = await apiClient.delete(`/blogs/${blogId}`);

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch blogs error!';
      throw new Error(message);
    }

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Soft delete blog error!');
  }
};

// restore blog
export const restoreBlog = async ({ blogId }: { blogId: number | null }) => {
  if (!blogId) throw new Error('Blog ID is required');

  try {
    const res = await apiClient.patch(`/blogs/${blogId}/restore`);

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch blogs error!';
      throw new Error(message);
    }

    return res.data;
  } catch (error) {
    handleApiError(error, 'Restore blog error!');
  }
};

// permanent delete blog
export const deletePermanentBlog = async ({
  blogId,
}: {
  blogId: number | null;
}) => {
  if (!blogId) throw new Error('Blog ID is required');

  try {
    const res = await apiClient.delete(`/blogs/${blogId}/permanent`, {
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

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Permanent delete blog error!');
  }
};

// update blog status
export const updateBlogStatus = async ({
  blogId,
  status,
}: {
  blogId: number;
  status: PublishStatusEnum;
}) => {
  if (!blogId) {
    throw new Error('Blog ID is required!');
  }

  try {
    const res = await apiClient.patch(`/blogs/${blogId}/status`, { status }, {
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Update blog status error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[UPDATE_BLOG_STATUS]: ', res.data);
    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Update blog status error!');
  }
};