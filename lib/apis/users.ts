import apiClient from '../axios/axios';

import { handleApiError } from '../functions/handle-api-error';

export const fetchMe = async () => {
  try {
    const { data } = await apiClient.get('/auth/me');

    return data;
  } catch {
    return null;
  }
};

export type FetchUsersParams = Readonly<{
  page: number;
  limit: number;
  withDeleted?: boolean;
}>;

// get all user
export const fetchUsers = async ({
  page,
  limit,
  withDeleted,
}: FetchUsersParams) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      withDeleted: String(withDeleted),
    });

    const res = await apiClient.get(`/users?${params.toString()}`, {
      withCredentials: true,
      validateStatus: () => true, // don't reply throw error, I will handle later
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch users error!';
      throw new Error(message);
    }

    // Success Response
    console.log('[FETCH_USERS]: ', res.data);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Fetch users error!');
  }
};

// create user
export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
};

export const createUser = async ({
  payload,
}: {
  payload: CreateUserPayload;
}) => {
  try {
    const res = await apiClient.post('/users', payload);

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch users error!';
      throw new Error(message);
    }

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Create user error!');
  }
};
