import axios, {
  type AxiosError,
  type AxiosResponse,
} from 'axios';
import { ErrorResponse } from '../interfaces/error-response';

export function checkAxiosError(
  error: unknown,
): error is AxiosError<ErrorResponse['response']['data']> & {
  response: AxiosResponse<ErrorResponse['response']['data']>;
} {
  return (
    axios.isAxiosError<ErrorResponse['response']['data']>(error) &&
    !!error.response
  );
}
