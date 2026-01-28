/**
 * API response and state type definitions
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormError {
  errors: ValidationError[];
  message?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: any;
  token?: string;
  isLoading: boolean;
  error?: string;
}

export interface CartItem {
  ticketTypeId: string;
  eventId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}
