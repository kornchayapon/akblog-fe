import apiClient from "../axios/axios";

export const fetchMe = async () => {
  try {
    const { data } = await apiClient.get('/auth/me');

    return data;
  } catch {
    return null;
  }
};