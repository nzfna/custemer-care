import {
  AfterViewInit, Component, ElementRef, OnDestroy, OnInit,
  ViewChild, signal, ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardStats } from '../../../core/models/ticket.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-semibold text-bright">
            {{ isAgent() ? 'Agent Dashboard' : 'My Dashboard' }}
          </h1>
          <p class="text-dim text-sm mt-1">
            {{ isAgent() ? 'Overview of all support tickets' : 'Overview of your support tickets' }}
          </p>
        </div>
        @if (!isAgent()) {
          <a routerLink="/tickets/new" class="btn-primary">+ New Ticket</a>
        }
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          @for (i of [1,2,3,4]; track i) {
            <div class="card skeleton h-28"></div>
          }
        </div>
      } @else if (stats()) {

        <!-- Stat Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="card">
            <p class="text-dim text-xs font-medium uppercase tracking-wider mb-2">Total</p>
            <p class="text-3xl font-bold text-bright">{{ stats()!.totalTickets }}</p>
            <p class="text-dim text-xs mt-1">All tickets</p>
          </div>
          <div class="card">
            <p class="text-dim text-xs font-medium uppercase tracking-wider mb-2">Open</p>
            <p class="text-3xl font-bold text-cyan">{{ stats()!.openTickets }}</p>
            <p class="text-dim text-xs mt-1">Awaiting response</p>
          </div>
          <div class="card">
            <p class="text-dim text-xs font-medium uppercase tracking-wider mb-2">In Progress</p>
            <p class="text-3xl font-bold text-amber">{{ stats()!.inProgressTickets }}</p>
            <p class="text-dim text-xs mt-1">Being handled</p>
          </div>
          <div class="card">
            <p class="text-dim text-xs font-medium uppercase tracking-wider mb-2">Resolved</p>
            <p class="text-3xl font-bold text-emerald">{{ stats()!.resolvedTickets }}</p>
            <p class="text-dim text-xs mt-1">Successfully closed</p>
          </div>
        </div>

        @if (isAgent()) {
          <!-- Unassigned + My Tickets -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div class="card !p-5 flex items-center justify-between"
              [class.border-amber]="stats()!.unassignedTickets > 0">
              <div>
                <p class="text-dim text-xs font-medium uppercase tracking-wider mb-1.5">Unassigned</p>
                <p class="text-2xl font-bold" [class]="stats()!.unassignedTickets > 0 ? 'text-amber' : 'text-bright'">
                  {{ stats()!.unassignedTickets }}
                </p>
                <p class="text-dim text-xs mt-1">Waiting to be claimed</p>
              </div>
              <a routerLink="/agent/tickets" class="btn-secondary text-xs py-1.5 px-3">View queue →</a>
            </div>
            <div class="card !p-5 flex items-center justify-between">
              <div>
                <p class="text-dim text-xs font-medium uppercase tracking-wider mb-1.5">My Tickets</p>
                <p class="text-2xl font-bold text-indigo">{{ stats()!.myAssignedTickets }}</p>
                <p class="text-dim text-xs mt-1">Assigned to you</p>
              </div>
              <a routerLink="/agent/tickets" class="btn-secondary text-xs py-1.5 px-3">View mine →</a>
            </div>
          </div>

          <!-- Charts — hanya render kalau chartsReady -->
          @if (chartsReady()) {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div class="card">
                <h3 class="text-bright font-medium mb-4">Tickets by Status</h3>
                <div class="relative" style="height:220px">
                  <canvas #statusChart></canvas>
                </div>
              </div>
              <div class="card">
                <h3 class="text-bright font-medium mb-4">Tickets by Category</h3>
                <div class="relative" style="height:220px">
                  <canvas #categoryChart></canvas>
                </div>
              </div>
            </div>
            <div class="card mb-6">
              <h3 class="text-bright font-medium mb-4">New Tickets — Last 7 Days</h3>
              <div class="relative" style="height:180px">
                <canvas #trendChart></canvas>
              </div>
            </div>
          }
        }
      }

      @if (!isAgent()) {
        <div class="flex items-center gap-3 mt-2">
          <a routerLink="/tickets" class="btn-secondary">View All Tickets</a>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('statusChart')   statusRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart')    trendRef?: ElementRef<HTMLCanvasElement>;

  stats        = signal<DashboardStats | null>(null);
  loading      = signal(true);
  chartsReady  = signal(false);

  private statusChart?: Chart;
  private categoryChart?: Chart;
  private trendChart?: Chart;
  private dataLoaded = false;
  private viewInited = false;

  private ticketService = inject(TicketService);
  private auth          = inject(AuthService);
  private cdr           = inject(ChangeDetectorRef);

  isAgent() { return this.auth.isAgent(); }

  ngOnInit() {
    console.log('isAgent:', this.isAgent());
    console.log('role:', this.auth.currentUser()?.role);
    
    this.ticketService.getDashboard().subscribe({
      next: res => {
        console.log('stats:', res.data);
        console.log('byStatus:', res.data?.byStatus);
        this.stats.set(res.data ?? null);
        this.loading.set(false);
        this.dataLoaded = true;
        this.tryRenderCharts();
      },
      error: (err) => {
        console.error('dashboard error:', err);
        this.loading.set(false);
      }
    });
  }

  ngAfterViewInit() {
    this.viewInited = true;
    this.tryRenderCharts();
  }

  ngOnDestroy() {
    this.destroyCharts();
  }

  private tryRenderCharts() {
    if (!this.dataLoaded || !this.viewInited || !this.isAgent()) return;

    // Set ready dulu supaya @if render canvas ke DOM
    this.chartsReady.set(true);
    this.cdr.detectChanges();

    // Sekarang canvas pasti ada di DOM
    requestAnimationFrame(() => this.renderCharts());
  }

  private renderCharts() {
    const s = this.stats();
    if (!s) return;

    this.destroyCharts();

    const gridColor   = 'rgba(255,255,255,0.06)';
    const tickColor   = '#94a3b8';
    const tickFont    = { size: 11 } as const;
    const legendLabel = { color: '#94a3b8', font: { size: 11 }, padding: 12, usePointStyle: true, pointStyle: 'circle' as const };

    // ── Doughnut: Status ──────────────────────────────────────────────────
    if (this.statusRef) {
      const labels = Object.keys(s.byStatus);
      const values = Object.values(s.byStatus);
      const colors: Record<string, string> = {
        OPEN: '#22d3ee', IN_PROGRESS: '#fbbf24', RESOLVED: '#34d399', CLOSED: '#475569'
      };
      this.statusChart = new Chart(this.statusRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: labels.map(l => colors[l] ?? '#6366f1'),
            borderColor: '#12121a',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: legendLabel } }
        }
      });
    }

    // ── Bar: Category ─────────────────────────────────────────────────────
    if (this.categoryRef) {
      const labels = Object.keys(s.byCategory);
      const values = Object.values(s.byCategory);
      this.categoryChart = new Chart(this.categoryRef.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: 'rgba(99,102,241,0.7)',
            borderRadius: 6,
            maxBarThickness: 36,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: tickColor, font: tickFont }, grid: { display: false } },
            y: { ticks: { color: tickColor, font: tickFont, stepSize: 1 }, grid: { color: gridColor }, beginAtZero: true }
          }
        }
      });
    }

    // ── Line: 7-day trend ─────────────────────────────────────────────────
    if (this.trendRef) {
      const counts = s.last7DaysCounts?.length === 7 ? s.last7DaysCounts : [0,0,0,0,0,0,0];
      this.trendChart = new Chart(this.trendRef.nativeElement, {
        type: 'line',
        data: {
          labels: this.getLast7DayLabels(),
          datasets: [{
            data: counts,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.08)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#12121a',
            pointBorderWidth: 2,
            pointRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: tickColor, font: tickFont }, grid: { display: false } },
            y: { ticks: { color: tickColor, font: tickFont, stepSize: 1 }, grid: { color: gridColor }, beginAtZero: true }
          }
        }
      });
    }
  }

  private destroyCharts() {
    this.statusChart?.destroy();
    this.categoryChart?.destroy();
    this.trendChart?.destroy();
    this.statusChart = undefined;
    this.categoryChart = undefined;
    this.trendChart = undefined;
  }

  private getLast7DayLabels(): string[] {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });
  }
}