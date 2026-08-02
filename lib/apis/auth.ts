import apiClient from '../axios/axios';

import { GithubSigninPayload, GoogleSigninPayload } from '@/modules/guest/auth/hooks/use-auth';

import { User } from '../interfaces/user';

export type ResetPasswordRequestPayload = { email: string };

export interface AuthResponse {
  access_token: string;
  user: User;
}

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

export async function githubSignin(
  payload: GithubSigninPayload,
): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/github', payload);
  return data;
}

export async function googleSignin(
  payload: GoogleSigninPayload,
): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/google', payload);
  return data;
}