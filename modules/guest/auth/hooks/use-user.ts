'use client';

import { useEffect, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { authStore } from '../stores/auth-store';

import { User } from '@/lib/interfaces/user';

import { USER_PROFILE_KEY } from '@/lib/constants/query-key';
import { checkAxiosError } from '@/lib/functions/check-axios-error';
import { fetchMe } from '@/lib/apis/users';
import { queryClient } from '@/lib/react-query/query-client';

import { toast } from 'sonner';

export const useUser = () => {
  const clearAuth = authStore((state) => state.clearAuth);
  const storeUser = authStore((state) => state.user);
  const setUser = authStore((state) => state.setUser);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useQuery<User | null>({
      queryKey: [USER_PROFILE_KEY],
      queryFn: async () => {
        try {
          return await fetchMe();
        } catch (error: unknown) {
          if (checkAxiosError(error)) {
            const errorData = error.response.data;
            console.log('[useUser Query]: ', errorData);
            toast.error(errorData.message);

            clearAuth();
            return null;
          }

          throw error;
        }
      },

      // Only run if token exists to avoid unnecessary requests
      // enabled: !!accessToken,
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 60, // 1 hour

      retry: (failureCount, error: unknown) => {
        // Skip retry on 401 as interceptor handles refresh logic
        if (checkAxiosError(error) && error.response.status === 401)
          return false;
        return failureCount < 2;
      },
    });

  const invalidateUser = () => {
    queryClient.invalidateQueries({ queryKey: [USER_PROFILE_KEY] });
  };
  

  const user = useMemo(() => {
    return data ?? storeUser ?? null;
  }, [data, storeUser]);

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, setUser]);

  return {
    user,
    isLoading,
    isFetching, // Useful for background refresh loading states
    isError,
    error,
    refetch,
    invalidateUser,

    // Authentication status based on profile data
    isAuthenticated: !!user,
    isAuthHydrated: authStore((state) => state.isHydrated),
  };
};
