import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Overlay (mobile) -->
    @if (open()) {
      <div class="fixed inset-0 bg-black/40 z-30 lg:hidden" (click)="close.emit()"></div>
    }

    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 h-full w-60 bg-surface border-r border-white/[0.06] flex flex-col z-40 transition-transform duration-200"
      [class.-translate-x-full]="!open()">

      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 h-14 border-b border-white/[0.06] flex-shrink-0">
        <div class="w-7 h-7 rounded-lg bg-indigo/10 border border-indigo/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-3.5 h-3.5 text-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </div>
        <span class="text-bright font-semibold text-sm">Customer Care</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
        @if (isAgent()) {
          <a routerLink="/agent/dashboard" routerLinkActive="active-nav"
            class="nav-link">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/agent/tickets" routerLinkActive="active-nav"
            class="nav-link">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <span>All Tickets</span>
          </a>
        } @else {
          <a routerLink="/dashboard" routerLinkActive="active-nav"
            class="nav-link">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/tickets" routerLinkActive="active-nav" [routerLinkActiveOptions]="{exact:true}"
            class="nav-link">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <span>My Tickets</span>
          </a>
          <a routerLink="/tickets/new" routerLinkActive="active-nav"
            class="nav-link">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>New Ticket</span>
          </a>
        }

        <a routerLink="/profile" routerLinkActive="active-nav"
          class="nav-link">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span>Profile</span>
        </a>
      </nav>

    </aside>

    <style>
      .nav-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 13.5px;
        color: #94a3b8;
        text-decoration: none;
        transition: background 150ms, color 150ms;
        white-space: nowrap;
      }
      .nav-link:hover {
        background: rgba(255,255,255,0.04);
        color: #e2e8f0;
      }
      .active-nav {
        background: rgba(99,102,241,0.1) !important;
        color: #e2e8f0 !important;
        border: 1px solid rgba(99,102,241,0.2);
      }
    </style>
  `
})
export class SidebarComponent {
  open  = input<boolean>(true);
  close = output<void>();

  auth    = inject(AuthService);
  isAgent = computed(() => this.auth.isAgent());
}