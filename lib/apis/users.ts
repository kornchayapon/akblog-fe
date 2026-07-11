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

// update user profile
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
