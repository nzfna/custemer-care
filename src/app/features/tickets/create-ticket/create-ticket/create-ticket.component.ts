import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { DropdownComponent, DropdownOption } from '../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DropdownComponent],
  template: `
    <div class="max-w-xl">
      <a routerLink="/tickets" class="inline-flex items-center gap-1.5 text-dim text-sm hover:text-bright transition-colors mb-6">
        ← Back to tickets
      </a>

      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-bright">Create Ticket</h1>
        <p class="text-dim text-sm mt-1">Describe your issue and we'll get back to you</p>
      </div>

      <div class="card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

          @if (error()) {
            <div class="mb-5 px-4 py-3 rounded-md bg-rose/10 border border-rose/20 text-rose text-sm">
              {{ error() }}
            </div>
          }

          <div class="mb-4">
            <label class="block text-sm text-dim mb-1.5">Title <span class="text-rose">*</span></label>
            <input formControlName="title" type="text" placeholder="Brief summary of your issue"
              class="input-field" [class.error]="isInvalid('title')" />
            @if (isInvalid('title')) {
              <p class="text-rose text-xs mt-1">Title is required (min 5 characters)</p>
            }
          </div>

          <div class="mb-4">
            <label class="block text-sm text-dim mb-1.5">Description <span class="text-rose">*</span></label>
            <textarea formControlName="description" rows="5"
              placeholder="Describe your issue in detail..."
              class="input-field resize-none" [class.error]="isInvalid('description')"></textarea>
            @if (isInvalid('description')) {
              <p class="text-rose text-xs mt-1">Description is required (min 10 characters)</p>
            }
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm text-dim mb-1.5">Category <span class="text-rose">*</span></label>
              <app-dropdown
                [options]="categoryOptions"
                [value]="form.get('category')?.value ?? ''"
                (valueChange)="form.get('category')?.setValue($event)"
                placeholder="Select category" />
              @if (isInvalid('category')) {
                <p class="text-rose text-xs mt-1">Category is required</p>
              }
            </div>
            <div>
              <label class="block text-sm text-dim mb-1.5">Priority</label>
              <app-dropdown
                [options]="priorityOptions"
                [value]="form.get('priority')?.value ?? 'MEDIUM'"
                (valueChange)="form.get('priority')?.setValue($event)"
                placeholder="Select priority" />
            </div>
          </div>

          <div class="flex gap-3">
            <button type="submit" class="btn-primary flex items-center gap-2" [disabled]="loading()">
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Submitting...
              } @else {
                Submit Ticket
              }
            </button>
            <a routerLink="/tickets" class="btn-ghost">Cancel</a>
          </div>

        </form>
      </div>
    </div>
  `
})
export class CreateTicketComponent {
  form!: ReturnType<FormBuilder['group']>;
  loading = signal(false);
  error   = signal('');

  categoryOptions: DropdownOption[] = [
    { value: 'BILLING',   label: 'Billing' },
    { value: 'TECHNICAL', label: 'Technical' },
    { value: 'GENERAL',   label: 'General' },
    { value: 'COMPLAINT', label: 'Complaint' },
    { value: 'OTHER',     label: 'Other' },
  ];

  priorityOptions: DropdownOption[] = [
    { value: 'LOW',      label: 'Low' },
    { value: 'MEDIUM',   label: 'Medium' },
    { value: 'HIGH',     label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title:       ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category:    ['', Validators.required],
      priority:    ['MEDIUM'],
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    this.ticketService.createTicket(this.form.value as any).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.router.navigate(['/tickets', res.data.id]);
        } else {
          this.error.set(res.message);
          this.loading.set(false);
        }
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to create ticket.');
        this.loading.set(false);
      }
    });
  }

  isInvalid(field: string) {
    const c = this.form.get(field);
    return c?.invalid && c.touched;
  }
}
