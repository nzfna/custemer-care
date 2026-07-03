import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Ticket, PageResponse } from '../../../core/models/ticket.model';
import { DropdownComponent, DropdownOption } from '../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DropdownComponent],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-bright">
            {{ isAgent() ? 'All Tickets' : 'My Tickets' }}
          </h1>
          <p class="text-dim text-sm mt-1">
            {{ page()?.totalElements ?? 0 }} tickets total
          </p>
        </div>
        @if (!isAgent()) {
          <a routerLink="/tickets/new" class="btn-primary">+ New Ticket</a>
        }
      </div>

      <!-- Filters (Agent only) -->
      @if (isAgent()) {
        <div class="flex flex-wrap items-center gap-3 mb-5">
          <app-dropdown [options]="statusOptions" [(value)]="filterStatus" (valueChange)="onStatusChange($event)"
            placeholder="All Status" />
          <app-dropdown [options]="priorityOptions" [(value)]="filterPriority" (valueChange)="onPriorityChange($event)"
            placeholder="All Priority" />
          <input [(ngModel)]="filterKeyword" (keyup.enter)="load()" type="text"
            placeholder="Search tickets..." class="input-field w-auto min-w-52 !py-2 text-sm" />
          <button (click)="load()" class="btn-secondary py-2 text-sm">Search</button>
          <button (click)="clearFilters()" class="btn-ghost py-2 text-sm">Clear</button>
        </div>
      }

      <!-- Table -->
      <div class="card !p-0 overflow-hidden">
        @if (loading()) {
          <div class="p-8 space-y-3">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="skeleton h-14 rounded-md"></div>
            }
          </div>
        } @else if (tickets().length === 0) {
          <div class="py-16 text-center">
            <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p class="text-dim text-sm">No tickets found</p>
            @if (!isAgent()) {
              <a routerLink="/tickets/new" class="btn-primary inline-block mt-4 text-sm">Create your first ticket</a>
            }
          </div>
        } @else {
          <table class="w-full">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th class="text-left text-xs text-faint font-medium uppercase tracking-wider px-5 py-3">Ticket</th>
                <th class="text-left text-xs text-faint font-medium uppercase tracking-wider px-5 py-3 hidden md:table-cell">Category</th>
                <th class="text-left text-xs text-faint font-medium uppercase tracking-wider px-5 py-3">Status</th>
                <th class="text-left text-xs text-faint font-medium uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Priority</th>
                <th class="text-left text-xs text-faint font-medium uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Date</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              @for (ticket of tickets(); track ticket.id) {
                <tr class="hover:bg-white/[0.02] transition-colors">
                  <td class="px-5 py-4">
                    <p class="text-bright text-sm font-medium line-clamp-1">{{ ticket.title }}</p>
                    <p class="text-faint text-xs mt-0.5">{{ isAgent() ? ticket.createdBy.fullName : '#' + ticket.id }}</p>
                  </td>
                  <td class="px-5 py-4 hidden md:table-cell">
                    <span class="text-dim text-sm">{{ ticket.category }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <span [class]="statusBadge(ticket.status)">{{ ticket.status | titlecase }}</span>
                  </td>
                  <td class="px-5 py-4 hidden lg:table-cell">
                    <span [class]="priorityBadge(ticket.priority)">{{ ticket.priority | titlecase }}</span>
                  </td>
                  <td class="px-5 py-4 hidden lg:table-cell">
                    <span class="text-faint text-xs">{{ ticket.createdAt | date:'MMM d, y' }}</span>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <a [routerLink]="isAgent() ? '/agent/tickets/' + ticket.id : '/tickets/' + ticket.id"
                      class="text-indigo text-sm hover:text-[#818cf8] transition-colors">View →</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Pagination -->
          @if (page() && page()!.totalPages > 1) {
            <div class="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
              <p class="text-faint text-xs">
                Page {{ (page()?.number ?? 0) + 1 }} of {{ page()?.totalPages }}
              </p>
              <div class="flex gap-2">
                <button (click)="prevPage()" [disabled]="currentPage() === 0"
                  class="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">←</button>
                <button (click)="nextPage()" [disabled]="currentPage() >= (page()?.totalPages ?? 1) - 1"
                  class="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">→</button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class TicketListComponent implements OnInit {
  tickets     = signal<Ticket[]>([]);
  page        = signal<PageResponse<Ticket> | null>(null);
  loading     = signal(true);
  currentPage = signal(0);

  filterStatus   = '';
  filterPriority = '';
  filterKeyword  = '';

  statusOptions: DropdownOption[] = [
    { value: '', label: 'All Status' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  priorityOptions: DropdownOption[] = [
    { value: '', label: 'All Priority' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  constructor(private ticketService: TicketService, private auth: AuthService) {}
  isAgent() { return this.auth.isAgent(); }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.ticketService.getTickets(
      this.currentPage(),
      10,
      this.filterStatus || undefined,
      this.filterPriority || undefined,
      this.filterKeyword || undefined
    ).subscribe({
      next: res => {
        this.page.set(res.data ?? null);
        this.tickets.set(res.data?.content ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onStatusChange(val: string)   { this.filterStatus = val;   this.currentPage.set(0); this.load(); }
  onPriorityChange(val: string) { this.filterPriority = val; this.currentPage.set(0); this.load(); }

  prevPage() { if (this.currentPage() > 0) { this.currentPage.update(p => p - 1); this.load(); } }
  nextPage() { this.currentPage.update(p => p + 1); this.load(); }

  clearFilters() {
    this.filterStatus = ''; this.filterPriority = ''; this.filterKeyword = '';
    this.currentPage.set(0); this.load();
  }

  statusBadge(status: string) {
    const map: Record<string, string> = {
      OPEN: 'badge-open', IN_PROGRESS: 'badge-progress',
      RESOLVED: 'badge-resolved', CLOSED: 'badge-closed'
    };
    return map[status] ?? 'badge-closed';
  }

  priorityBadge(priority: string) {
    const map: Record<string, string> = {
      LOW: 'badge-low', MEDIUM: 'badge-medium',
      HIGH: 'badge-high', CRITICAL: 'badge-critical'
    };
    return map[priority] ?? 'badge-low';
  }
}
