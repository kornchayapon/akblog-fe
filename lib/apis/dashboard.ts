import apiClient from '../axios/axios';

import { handleApiError } from '../functions/handle-api-error';

/** One day in the user-growth series; `date` is a calendar day in UTC (YYYY-MM-DD). */
export interface UserGrowthDataPoint {
  date: string;
  newUsers: number;
  cumulativeUsers: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalBlogs: number;
  totalComments: number;
  userGrowth: UserGrowthDataPoint[];
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const res = await apiClient.get<DashboardStats>('/dashboard/stats', {
      withCredentials: true,
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      const message =
        (res.data as { message?: string } | undefined)?.message ??
        'Fetch dashboard stats error!';
      throw new Error(message);
    }

    return res.data;
  } catch (error: unknown) {
    handleApiError(error, 'Fetch dashboard stats error!');
    // Unreachable: handleApiError always throws; required for TypeScript control flow.
    throw new Error('Fetch dashboard stats error!');
  }
};
