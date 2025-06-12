export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasNext: boolean;
}

export interface ApiPaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface ApiError {
  response?: {
    data?: {
      detail?: string | string[];
      message?: string;
    };
    status?: number;
  };
  message?: string;
} 