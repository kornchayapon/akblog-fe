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

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Create user error!');
  }
};

// get user by id
interface FetchUserParams {
  userId?: number | null;
  signal?: AbortSignal;
}

export const fetchUser = async ({ userId, signal }: FetchUserParams) => {
  if (!userId) throw new Error('User ID is required');

  try {
    const res = await apiClient.get(`/users/${userId}`, { signal });

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Fetch user by ID error!');
  }
};

// update user
export type UpdateUserPayload = {
  userId: number | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  password?: string | null;
  role?: string | null;
  avatar?: number | null;
  active?: boolean | null;
};

// update user
export const updateUser = async ({
  payload,
}: {
  payload: UpdateUserPayload;
}) => {
  if (!payload.userId) {
    throw new Error('User ID is required!');
  }

  try {
    const res = await apiClient.patch(`/users`, payload);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Update user error!');
  }
};

// update user status
export type UpdateUserStatusPayload = {
  userId: number | null;
  active?: boolean | null;
};

// update user
export const updateUserStatus = async ({
  payload,
}: {
  payload: UpdateUserPayload;
}) => {
  if (!payload.userId) {
    throw new Error('User ID is required!');
  }

  console.log('[update user status api]:', `/users/${payload.userId}/status`);
  

  try {
    const res = await apiClient.patch(`/users/${payload.userId}/status`, payload);

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Update user status error!');
  }
};

// soft delete
export const softDeleteUser = async ({ userId }: { userId: number | null }) => {
  if (!userId) throw new Error('User ID is required');

  try {
    const res = await apiClient.delete(`/users/${userId}`);

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch users error!';
      throw new Error(message);
    }

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Soft delete user error!');
  }
};

// restore user
export const restoreUser = async ({ userId }: { userId: number | null }) => {
  if (!userId) throw new Error('User ID is required');

  try {
    const res = await apiClient.patch(`/users/${userId}/restore`);

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch users error!';
      throw new Error(message);
    }

    return res.data;
  } catch (error) {
    handleApiError(error, 'Restore user error!');
  }
};

// permanent delete user
export const deletePermanentUser = async ({
  userId,
}: {
  userId: number | null;
}) => {
  if (!userId) throw new Error('User ID is required');

  try {
    const res = await apiClient.delete(`/users/${userId}/permanent`, {
      withCredentials: true,
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch users error!';
      throw new Error(message);
    }

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Permanent delete user error!');
  }
};
