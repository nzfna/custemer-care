import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Ticket } from '../../../core/models/ticket.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-3xl">
      <!-- Back -->
      <a [routerLink]="isAgent() ? '/agent/tickets' : '/tickets'"
        class="inline-flex items-center gap-1.5 text-dim text-sm hover:text-bright transition-colors mb-6">
        ← Back to tickets
      </a>

      @if (loading()) {
        <div class="space-y-4">
          <div class="skeleton h-40 rounded-lg"></div>
          <div class="skeleton h-64 rounded-lg"></div>
        </div>
      } @else if (ticket()) {
        <!-- Ticket Info -->
        <div class="card mb-4">
          <div class="flex items-start justify-between gap-4 mb-4">
            <h1 class="text-xl font-semibold text-bright">{{ ticket()!.title }}</h1>
            <div class="flex gap-2 flex-shrink-0">
              <span [class]="statusBadge(ticket()!.status)">{{ ticket()!.status }}</span>
              <span [class]="priorityBadge(ticket()!.priority)">{{ ticket()!.priority }}</span>
            </div>
          </div>

          <p class="text-dim text-sm leading-relaxed mb-5">{{ ticket()!.description }}</p>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/[0.06]">
            <div>
              <p class="text-faint text-xs mb-1">Category</p>
              <p class="text-bright text-sm">{{ ticket()!.category }}</p>
            </div>
            <div>
              <p class="text-faint text-xs mb-1">Created by</p>
              <p class="text-bright text-sm">{{ ticket()!.createdBy.fullName }}</p>
            </div>
            <div>
              <p class="text-faint text-xs mb-1">Assigned to</p>
              <p class="text-bright text-sm">{{ ticket()!.assignedAgent?.fullName ?? 'Unassigned' }}</p>
            </div>
            <div>
              <p class="text-faint text-xs mb-1">Created</p>
              <p class="text-bright text-sm">{{ ticket()!.createdAt | date:'MMM d, y' }}</p>
            </div>
          </div>

          <!-- Agent: Claim / Release -->
          @if (isAgent()) {
            <div class="pt-4 mt-4 border-t border-white/[0.06]">
              @if (!ticket()!.assignedAgent) {
                <button (click)="claimTicket()" [disabled]="claiming()"
                  class="btn-primary text-sm flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ claiming() ? 'Claiming...' : 'Claim this ticket' }}
                </button>
              } @else if (isMyTicket()) {
                <button (click)="unassignTicket()" [disabled]="claiming()"
                  class="btn-secondary text-sm">
                  {{ claiming() ? 'Releasing...' : 'Release ticket' }}
                </button>
              } @else {
                <p class="text-faint text-xs">This ticket is being handled by {{ ticket()!.assignedAgent?.fullName }}.</p>
              }
              @if (claimError()) {
                <p class="text-rose text-xs mt-2">{{ claimError() }}</p>
              }
            </div>
          }
        </div>

        <!-- Agent: Update Status -->
        @if (isAgent()) {
          <div class="card mb-4">
            <h3 class="text-bright text-sm font-medium mb-3">Update Status</h3>
            <div class="flex gap-2 flex-wrap">
              @for (s of statuses; track s.value) {
                <button (click)="updateStatus(s.value)"
                  [disabled]="ticket()!.status === s.value || updatingStatus()"
                  class="px-3 py-1.5 rounded-md text-xs font-medium border transition-all"
                  [class]="ticket()!.status === s.value
                    ? 'bg-white/10 text-bright border-white/20 opacity-60 cursor-default'
                    : 'bg-white/5 text-dim border-white/10 hover:border-white/20 hover:text-bright'">
                  {{ s.label }}
                </button>
              }
            </div>
          </div>
        }

        <!-- Comments -->
        <div class="card">
          <h3 class="text-bright font-medium mb-5">
            Conversation
            <span class="text-faint text-sm font-normal ml-2">{{ ticket()!.comments.length }} messages</span>
          </h3>

          @if (ticket()!.comments.length === 0) {
            <div class="py-8 text-center">
              <p class="text-faint text-sm">No messages yet. Start the conversation.</p>
            </div>
          } @else {
            <div class="space-y-4 mb-6">
              @for (comment of ticket()!.comments; track comment.id) {
                <div class="flex gap-3" [class.flex-row-reverse]="isOwnComment(comment.senderRole)">
                  <div class="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold"
                    [class]="isOwnComment(comment.senderRole) ? 'bg-indigo/20 text-indigo' : 'bg-white/10 text-dim'">
                    {{ comment.senderName[0] }}
                  </div>
                  <div class="flex-1 max-w-sm" [class.text-right]="isOwnComment(comment.senderRole)">
                    <div class="inline-block px-4 py-2.5 rounded-lg text-sm text-bright"
                      [class]="isOwnComment(comment.senderRole)
                        ? 'bg-indigo/10 border border-indigo/20'
                        : 'bg-white/[0.04] border border-white/[0.08]'">
                      {{ comment.message }}
                    </div>
                    <p class="text-faint text-[11px] mt-1">
                      {{ comment.senderName }} · {{ comment.createdAt | date:'MMM d, h:mm a' }}
                    </p>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Reply box -->
          @if (ticket()!.status !== 'CLOSED') {
            <div class="border-t border-white/[0.06] pt-4">
              <textarea [(ngModel)]="replyMessage" rows="3" placeholder="Write a message..."
                class="input-field resize-none mb-3"></textarea>
              <button (click)="sendReply()"
                [disabled]="!replyMessage.trim() || sendingReply()"
                class="btn-primary text-sm disabled:opacity-50">
                {{ sendingReply() ? 'Sending...' : 'Send message' }}
              </button>
            </div>
          } @else {
            <div class="border-t border-white/[0.06] pt-4">
              <p class="text-faint text-sm text-center">This ticket is closed.</p>
            </div>
          }
        </div>
      } @else {
        <div class="card text-center py-12">
          <p class="text-dim">Ticket not found.</p>
        </div>
      }
    </div>
  `
})
export class TicketDetailComponent implements OnInit {
  ticket        = signal<Ticket | null>(null);
  loading       = signal(true);
  updatingStatus = signal(false);
  sendingReply  = signal(false);
  claiming      = signal(false);
  claimError    = signal('');
  replyMessage  = '';

  statuses = [
    { value: 'OPEN',        label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED',    label: 'Resolved' },
    { value: 'CLOSED',      label: 'Closed' },
  ];

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private auth: AuthService
  ) {}

  isAgent() { return this.auth.isAgent(); }

  isMyTicket() {
    const myEmail = this.auth.currentUser()?.email;
    return this.ticket()?.assignedAgent?.email === myEmail;
  }

  isOwnComment(senderRole: string) {
    const myRole = this.auth.currentUser()?.role;
    return senderRole === myRole;
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.ticketService.getTicketById(id).subscribe({
      next: res => { this.ticket.set(res.data ?? null); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
  }

  claimTicket() {
    if (!this.ticket()) return;
    this.claiming.set(true);
    this.claimError.set('');
    this.ticketService.claimTicket(this.ticket()!.id).subscribe({
      next: res => {
        if (res.success && res.data) this.ticket.set(res.data);
        else this.claimError.set(res.message);
        this.claiming.set(false);
      },
      error: err => {
        this.claimError.set(err.error?.message || 'Failed to claim ticket.');
        this.claiming.set(false);
      }
    });
  }

  unassignTicket() {
    if (!this.ticket()) return;
    this.claiming.set(true);
    this.claimError.set('');
    this.ticketService.unassignTicket(this.ticket()!.id).subscribe({
      next: res => {
        if (res.success && res.data) this.ticket.set(res.data);
        else this.claimError.set(res.message);
        this.claiming.set(false);
      },
      error: err => {
        this.claimError.set(err.error?.message || 'Failed to release ticket.');
        this.claiming.set(false);
      }
    });
  }

  updateStatus(status: string) {
    if (!this.ticket()) return;
    this.updatingStatus.set(true);
    this.ticketService.updateStatus(this.ticket()!.id, status).subscribe({
      next: res => {
        if (res.data) this.ticket.update(t => t ? { ...t, status: res.data!.status, assignedAgent: res.data!.assignedAgent } : t);
        this.updatingStatus.set(false);
      },
      error: () => this.updatingStatus.set(false)
    });
  }

  sendReply() {
    if (!this.replyMessage.trim() || !this.ticket()) return;
    this.sendingReply.set(true);
    this.ticketService.addComment(this.ticket()!.id, this.replyMessage).subscribe({
      next: res => {
        if (res.data) {
          this.ticket.update(t => t ? { ...t, comments: [...t.comments, res.data!] } : t);
        }
        this.replyMessage = '';
        this.sendingReply.set(false);
      },
      error: () => this.sendingReply.set(false)
    });
  }

  statusBadge(s: string) {
    const m: Record<string, string> = { OPEN:'badge-open', IN_PROGRESS:'badge-progress', RESOLVED:'badge-resolved', CLOSED:'badge-closed' };
    return m[s] ?? 'badge-closed';
  }
  priorityBadge(p: string) {
    const m: Record<string, string> = { LOW:'badge-low', MEDIUM:'badge-medium', HIGH:'badge-high', CRITICAL:'badge-critical' };
    return m[p] ?? 'badge-low';
  }
}
