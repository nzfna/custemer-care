import { Component, computed, inject, input, output, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="fixed top-0 right-0 left-0 h-14 bg-surface border-b border-white/[0.06] z-30 flex items-center px-4 gap-3"
      [style.left]="sidebarOpen() ? '240px' : '0px'"
      style="transition: left 200ms ease;">

      <!-- Burger -->
      <button (click)="toggleSidebar.emit()"
        class="w-8 h-8 flex items-center justify-center rounded-md text-dim hover:text-bright hover:bg-white/5 transition-colors flex-shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- Search -->
      <div class="flex-1 max-w-sm">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()"
            placeholder="Search tickets..."
            class="w-full bg-white/[0.03] border border-white/[0.08] rounded-md pl-9 pr-4 py-1.5
                   text-bright text-sm placeholder-faint outline-none
                   focus:border-indigo/40 focus:bg-white/[0.05] transition-all" />
        </div>
      </div>

      <div class="flex-1"></div>

      <!-- User menu trigger -->
      <div class="relative" (click)="$event.stopPropagation()">
        <button (click)="menuOpen.set(!menuOpen())"
          class="flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-md hover:bg-white/5 transition-colors">
          <div class="text-right hidden sm:block">
            <p class="text-bright text-sm font-medium leading-tight">{{ user()?.fullName }}</p>
            <p class="text-faint text-[11px]">{{ isAgent() ? 'Agent' : 'Customer' }}</p>
          </div>
          <div class="w-8 h-8 rounded-full bg-indigo/20 border border-indigo/30 flex items-center justify-center flex-shrink-0">
            <span class="text-indigo text-xs font-bold">{{ initials() }}</span>
          </div>
          <svg class="w-3.5 h-3.5 text-faint transition-transform" [class.rotate-180]="menuOpen()"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <!-- Dropdown -->
        @if (menuOpen()) {
          <div class="absolute right-0 top-11 w-56 bg-surface border border-white/[0.08] rounded-lg shadow-modal py-1.5 z-50">

            <div class="px-3.5 py-2.5 border-b border-white/[0.06] mb-1">
              <p class="text-bright text-sm font-medium truncate">{{ user()?.fullName }}</p>
              <p class="text-faint text-xs truncate">{{ user()?.email }}</p>
            </div>

            <button (click)="go('/profile')" class="menu-item">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Profile
            </button>

            <button (click)="go('/settings')" class="menu-item">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Settings
            </button>

            <button (click)="go('help')" class="menu-item">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Bantuan
            </button>

            <div class="border-t border-white/[0.06] mt-1 pt-1">
              <button (click)="logout()" class="menu-item !text-rose hover:!bg-rose/10">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Sign out
              </button>
            </div>
          </div>
        }
      </div>
    </header>

    <style>
      .menu-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        font-size: 13.5px;
        color: #94a3b8;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: background 150ms, color 150ms;
        text-align: left;
      }
      .menu-item:hover {
        background: rgba(255,255,255,0.04);
        color: #e2e8f0;
      }
    </style>
  `
})
export class TopbarComponent {
  sidebarOpen   = input<boolean>(true);
  toggleSidebar = output<void>();
  openHelp      = output<void>();

  auth     = inject(AuthService);
  router   = inject(Router);

  user     = this.auth.currentUser;
  isAgent  = computed(() => this.auth.isAgent());
  initials = computed(() => {
    const name = this.auth.currentUser()?.fullName || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  });

  menuOpen = signal(false);
  searchQuery = '';
  onSearch() {}

  go(path: string) {
    this.menuOpen.set(false);
    if (path === 'help') {
      this.openHelp.emit();
    } else {
      this.router.navigate([path]);
    }
  }

  logout() {
    this.menuOpen.set(false);
    this.auth.logout();
  }

  @HostListener('document:click')
  closeOnOutsideClick() {
    this.menuOpen.set(false);
  }
}
