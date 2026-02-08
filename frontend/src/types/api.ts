export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}