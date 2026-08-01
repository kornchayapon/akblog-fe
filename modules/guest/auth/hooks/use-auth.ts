import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query/query-client';

import { useAuthStore } from '../stores/auth-store';

import { toast } from 'sonner';

import apiClient from '@/lib/axios/axios';
import { User } from '@/lib/interfaces/user';
import { USER_PROFILE_KEY } from '@/lib/constants/query-key';
import { checkAxiosError } from '@/lib/functions/check-axios-error';
import { useRouter } from 'next/navigation';

type SignUpPayload = {
  firstName: string;
  email: string;
  password: string;
};

type SignInPayload = {
  email: string;
  password: string;
};

interface AuthResponse {
  access_token: string;
  user: User;
}

export const useAuth = () => {
  const { setAccessToken, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleAuthSuccess = (
    data: { access_token: string },
    message: string,
    options?: { refetchProfile?: boolean },
  ) => {
    const refetchProfile = options?.refetchProfile ?? true;
    const accessToken = data.access_token;
    if (accessToken) {
      setAccessToken(accessToken);
      if (refetchProfile) {
        queryClient.invalidateQueries({ queryKey: [USER_PROFILE_KEY] });
      }
      toast.success(message);
    } else {
      toast.error('No access token received');
    }
  };

  const signUpMutation = useMutation({
    mutationFn: (payload: SignUpPayload) =>
      // apiClient.post('/auth/signup', { name: 'hello '}).then((res) => res.data),
      apiClient.post('/auth/signup', payload).then((res) => res.data),
    onSuccess: (data: AuthResponse) => {
      handleAuthSuccess(data, 'Hi, Welcome!');
    },
    onError: (error: unknown) => {
      if (checkAxiosError(error)) {
        const errorData = error.response.data;
        console.log('[signUpMutation]: ', errorData);
        toast.error(errorData.message);
        return;
      }

      console.error('[signUpMutation_FATAL_ERROR]:', error);
      toast.error('Sign Up failed. Please try again.');
    },
  });

  const signInMutation = useMutation({
    mutationFn: (payload: SignInPayload) =>
      apiClient.post('/auth/signin', payload).then((res) => res.data),
    onSuccess: (data) => {
      handleAuthSuccess(data, 'Welcome back!');
    },
    onError: (error: unknown) => {
      if (checkAxiosError(error)) {
        const errorData = error.response.data;
        console.log('[signUpMutation]: ', errorData);
        toast.error(errorData.message);
        return;
      }

      console.error('[signInMutation_FATAL_ERROR]:', error);
      toast.error('Sign In failed. Please try again.');
    },
  });

  const signOutMutation = useMutation({
    mutationFn: () => apiClient.post('/auth/signout'),
    onSuccess: () => {
      // Clear all auth state
      clearAuth();
      // Reset all queries to initial state
      queryClient.clear();
      toast.success('Sign Out successful');
      router.push('/');
    },
    onError: (error: unknown) => {
      // Even if the server request fails, we should clear local session
      console.error(
        'Signout failed on server, clearing local session anyway.',
        error,
      );
      clearAuth();
      queryClient.clear();
      toast.success('Sign Out error, Clear Auth!');
      router.push('/');
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async ({ userId, code }: { userId: number; code: string }) => {
      const res = await apiClient.post('/auth/verify', { userId, code });
      return res.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user-profile'], updatedUser);
      toast.success('Email verification succeeded');
    },
    onError: (error: unknown) => {
      if (checkAxiosError(error)) {
        const status = error.response.status;
        // Wrong/expired OTP (or validation) — stay on the page; otp-input shows inline error.
        if (status === 400 || status === 422) {
          return;
        }
        toast.error(
          error.response.data.message ??
            'Email verification failed. Please try again.',
        );
      } else {
        toast.error('Email verification failed. Please try again.');
      }
      clearAuth();
      queryClient.clear();
      router.push('/');
    },
  });

  const resendOTPMutation = useMutation({
    mutationFn: async ({ userId }: { userId: number }) => {
      await apiClient.post('/auth/otp', { userId });
    },
    onSuccess: () => {
      toast.success('OTP sent successfully. Please check your email.');
    },
    onError: (error: unknown) => {
      if (checkAxiosError(error)) {
        const status = error.response.status;
        if (status !== 400 && status !== 429) {
          console.error('Resend OTP failed on server', error);
        }
        toast.error(
          error.response.data.message ?? 'Could not resend verification code.',
        );
      } else {
        console.error('Resend OTP failed on server', error);
        toast.error('Could not resend verification code.');
      }
      // Keep user on OTP view for recoverable resend failures (e.g., 400).
      // Auth/session cleanup is handled by axios interceptor on 401.
    },
  });

  return {
    actions: {
      signUp: signUpMutation.mutateAsync,
      signIn: signInMutation.mutateAsync,
      signOut: signOutMutation.mutateAsync,
      verifyEmail: verifyEmailMutation.mutateAsync,
      resendOTP: resendOTPMutation.mutateAsync,
    },
    status: {
      isSignUpPending: signUpMutation.isPending,
      isSignInPending: signInMutation.isPending,
      isSignOutPending: signOutMutation.isPending,
      isVerifyEmailPending: verifyEmailMutation.isPending,
      isResendOTPLoading: resendOTPMutation.isPending,
    },
  };
};
