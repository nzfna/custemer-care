import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { CreateTicketRequest, DashboardStats, PageResponse, Ticket, Comment } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly API = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getTickets(page = 0, size = 10, status?: string, priority?: string, keyword?: string): Observable<ApiResponse<PageResponse<Ticket>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status)   params = params.set('status', status);
    if (priority) params = params.set('priority', priority);
    if (keyword)  params = params.set('keyword', keyword);
    return this.http.get<ApiResponse<PageResponse<Ticket>>>(`${this.API}/tickets`, { params });
  }

  getTicketById(id: number): Observable<ApiResponse<Ticket>> {
    return this.http.get<ApiResponse<Ticket>>(`${this.API}/tickets/${id}`);
  }

  createTicket(req: CreateTicketRequest): Observable<ApiResponse<Ticket>> {
    return this.http.post<ApiResponse<Ticket>>(`${this.API}/tickets`, req);
  }

  updateStatus(id: number, status: string): Observable<ApiResponse<Ticket>> {
    return this.http.patch<ApiResponse<Ticket>>(`${this.API}/tickets/${id}/status`, { status });
  }

  claimTicket(id: number): Observable<ApiResponse<Ticket>> {
    return this.http.post<ApiResponse<Ticket>>(`${this.API}/tickets/${id}/claim`, {});
  }

  unassignTicket(id: number): Observable<ApiResponse<Ticket>> {
    return this.http.post<ApiResponse<Ticket>>(`${this.API}/tickets/${id}/unassign`, {});
  }

  addComment(ticketId: number, message: string): Observable<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>(`${this.API}/tickets/${ticketId}/comments`, { message });
  }

  getDashboard(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.API}/dashboard`);
  }
}
