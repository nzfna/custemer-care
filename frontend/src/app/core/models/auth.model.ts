export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'AGENT';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface CurrentUser {
  token: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'AGENT';
}
