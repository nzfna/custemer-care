import {
  AfterViewInit, Component, ElementRef, OnDestroy, OnInit,
  ViewChild, signal, ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../core/services/ticket.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../core/models/ticket.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-semibold text-bright">{{ isAgent() ? 'Agent Dashboard' : 'My Dashboard' }}</h1>
          <p class="text-dim text-sm mt-1">{{ isAgent() ? 'Overview of all support tickets' : 'Overview of your support tickets' }}</p>
        </div>
        @if (!isAgent()) { <a routerLink="/tickets/new" class="btn-primary">+ New Ticket</a> }
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          @for (i of [1,2,3,4]; track i) { <div class="card skeleton h-28"></div> }
        </div>
      } @else if (stats()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="card"><p class="text-dim text-xs font-medium uppercase tracking-wider mb-2">Total</p><p class="text-3xl font-bold text-bright">{{ stats()!.totalTickets }}</p><p class="text-dim text-xs mt-1">All tickets</p></div>
          <div class="card"><p class="text-dim text-xs font-medium uppercase tracking-wider mb-2">Open</p><p class="text-3xl font-bold text-cyan">{{ stats()!.openTickets }}</p><p class="text-dim text-xs mt-1">Awaiting response</p></div>
          <div class="card"><p class="text-dim text-xs font-medium uppercase tracking-wider mb-2">In Progress</p><p class="text-3xl font-bold text-amber">{{ stats()!.inProgressTickets }}</p><p class="text-dim text-xs mt-1">Being handled</p></div>
          <div class="card"><p class="text-dim text-xs font-medium uppercase tracking-wider mb-2">Resolved</p><p class="text-3xl font-bold text-emerald">{{ stats()!.resolvedTickets }}</p><p class="text-dim text-xs mt-1">Successfully closed</p></div>
        </div>

        @if (isAgent()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div class="card !p-5 flex items-center justify-between">
              <div>
                <p class="text-dim text-xs font-medium uppercase tracking-wider mb-1.5">Unassigned</p>
                <p class="text-2xl font-bold" [class]="stats()!.unassignedTickets > 0 ? 'text-amber' : 'text-bright'">{{ stats()!.unassignedTickets }}</p>
                <p class="text-dim text-xs mt-1">Waiting to be claimed</p>
              </div>
              <a routerLink="/agent/tickets" class="btn-secondary text-xs py-1.5 px-3">View queue</a>
            </div>
            <div class="card !p-5 flex items-center justify-between">
              <div>
                <p class="text-dim text-xs font-medium uppercase tracking-wider mb-1.5">My Tickets</p>
                <p class="text-2xl font-bold text-indigo">{{ stats()!.myAssignedTickets }}</p>
                <p class="text-dim text-xs mt-1">Assigned to you</p>
              </div>
              <a routerLink="/agent/tickets" class="btn-secondary text-xs py-1.5 px-3">View mine</a>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div class="card"><h3 class="text-bright font-medium mb-4">Tickets by Status</h3><div style="position:relative;height:220px"><canvas #statusChart></canvas></div></div>
            <div class="card"><h3 class="text-bright font-medium mb-4">Tickets by Category</h3><div style="position:relative;height:220px"><canvas #categoryChart></canvas></div></div>
          </div>
          <div class="card mb-6"><h3 class="text-bright font-medium mb-4">New Tickets — Last 7 Days</h3><div style="position:relative;height:180px"><canvas #trendChart></canvas></div></div>
        }
      }
      @if (!isAgent()) { <a routerLink="/tickets" class="btn-secondary">View All Tickets</a> }
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('statusChart')   statusRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart')    trendRef?: ElementRef<HTMLCanvasElement>;

  stats   = signal<DashboardStats | null>(null);
  loading = signal(true);

  private statusChart?: Chart;
  private categoryChart?: Chart;
  private trendChart?: Chart;
  private dataLoaded = false;
  private viewReady  = false;

  private ticketService = inject(TicketService);
  private auth          = inject(AuthService);
  private cdr           = inject(ChangeDetectorRef);

  isAgent() { return this.auth.isAgent(); }

  ngOnInit() {
    this.ticketService.getDashboard().subscribe({
      next: res => {
        this.stats.set(res.data ?? null);
        this.loading.set(false);
        this.dataLoaded = true;
        if (this.viewReady) this.scheduleCharts();
      },
      error: () => this.loading.set(false)
    });
  }

  ngAfterViewInit() {
    this.viewReady = true;
    if (this.dataLoaded) this.scheduleCharts();
  }

  ngOnDestroy() { this.destroyAll(); }

  private scheduleCharts() {
    if (!this.isAgent()) return;
    this.cdr.detectChanges();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.renderCharts());
    });
  }

  private renderCharts() {
    const s = this.stats();
    if (!s) return;
    this.destroyAll();

    const grid  = 'rgba(255,255,255,0.06)';
    const tick  = '#94a3b8';
    const fnt   = { size: 11 } as const;

    if (this.statusRef?.nativeElement) {
      const labels = Object.keys(s.byStatus);
      const clr: Record<string,string> = { OPEN:'#22d3ee', IN_PROGRESS:'#fbbf24', RESOLVED:'#34d399', CLOSED:'#64748b' };
      this.statusChart = new Chart(this.statusRef.nativeElement, {
        type: 'doughnut',
        data: { labels, datasets: [{ data: Object.values(s.byStatus), backgroundColor: labels.map(l=>clr[l]??'#6366f1'), borderColor:'#12121a', borderWidth:2 }] },
        options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ color:tick, font:fnt, padding:12, usePointStyle:true, pointStyle:'circle' as const } } } }
      });
    }

    if (this.categoryRef?.nativeElement) {
      this.categoryChart = new Chart(this.categoryRef.nativeElement, {
        type: 'bar',
        data: { labels: Object.keys(s.byCategory), datasets: [{ data: Object.values(s.byCategory), backgroundColor:'rgba(99,102,241,0.7)', borderRadius:6, maxBarThickness:36 }] },
        options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ x:{ ticks:{ color:tick, font:fnt }, grid:{ display:false } }, y:{ ticks:{ color:tick, font:fnt, stepSize:1 }, grid:{ color:grid }, beginAtZero:true } } }
      });
    }

    if (this.trendRef?.nativeElement) {
      const counts = s.last7DaysCounts?.length===7 ? s.last7DaysCounts : [0,0,0,0,0,0,0];
      const days = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toLocaleDateString('en-US',{weekday:'short'}); });
      this.trendChart = new Chart(this.trendRef.nativeElement, {
        type: 'line',
        data: { labels: days, datasets: [{ data:counts, borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,0.08)', fill:true, tension:0.35, pointBackgroundColor:'#6366f1', pointBorderColor:'#12121a', pointBorderWidth:2, pointRadius:4 }] },
        options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ x:{ ticks:{ color:tick, font:fnt }, grid:{ display:false } }, y:{ ticks:{ color:tick, font:fnt, stepSize:1 }, grid:{ color:grid }, beginAtZero:true } } }
      });
    }
  }

  private destroyAll() {
    this.statusChart?.destroy(); this.statusChart = undefined;
    this.categoryChart?.destroy(); this.categoryChart = undefined;
    this.trendChart?.destroy(); this.trendChart = undefined;
  }
}
