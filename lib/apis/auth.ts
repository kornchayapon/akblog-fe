import apiClient from '../axios/axios';

export type ResetPasswordRequestPayload = { email: string };

export async function resetPasswordRequest(
  payload: ResetPasswordRequestPayload,
) {
  const { data } = await apiClient.post('/auth/resetPasswordRequest', payload);
  return data;
}

export type ResetPasswordTokenVerifyPayload = { token: string };

export async function resetPasswordTokenVerify(
  payload: ResetPasswordTokenVerifyPayload,
) {
  const { data } = await apiClient.post(
    '/auth/resetPasswordTokenVerify',
    payload,
  );
  return data;
}

export type ResetPasswordPayload = { token: string; password: string };

export async function resetPassword(payload: ResetPasswordPayload) {
  const { data } = await apiClient.post('/auth/resetPassword', payload);
  return data;
}