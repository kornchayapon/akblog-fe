export const handleApiError = (error: unknown, defaultMessage: string) => {
  const err = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  const message =
    err.response?.data?.message || err.message || defaultMessage
  throw new Error(message);
};
