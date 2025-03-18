// src/types/api.ts
export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
  }
  
  export interface ApiError {
    message: string;
    code?: string;
    details?: any;
  }
  
  export interface PaginatedResult<T> {
    data: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  }