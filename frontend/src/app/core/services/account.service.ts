import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  role: 'CUSTOMER' | 'AGENT';
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly API = 'http://localhost:8080/api/account';

  constructor(private http: HttpClient) {}

  getMe(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.API}/me`);
  }

  requestEmailChange(newEmail: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API}/email/request-change`, { newEmail });
  }

  confirmEmailChange(code: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API}/email/confirm-change`, { code });
  }

  requestPasswordChange(currentPassword: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API}/password/request-change`, { currentPassword });
  }

  confirmPasswordChange(code: string, newPassword: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API}/password/confirm-change`, { code, newPassword });
  }
}
