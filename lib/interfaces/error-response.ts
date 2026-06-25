export interface ErrorResponse {
  response: {
    data: {
      error: string;
      message: string;
      statusCode: number;
    };
  };
}

