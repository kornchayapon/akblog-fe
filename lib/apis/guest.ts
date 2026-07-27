import apiClient from "../axios/axios";

import { PublishStatusEnum } from "../enums/publish-status.enum";
import { GuestBlogsResponse } from "../interfaces/guest-blogs";

import { handleApiError } from "../functions/handle-api-error";

// get front all blogs
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