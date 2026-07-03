import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-deep flex items-center justify-center p-4">
      <div class="w-full max-w-md">

        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber/10 border border-amber/20 mb-4">
            <svg class="w-6 h-6 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-semibold text-bright">Forgot Password</h1>
          <p class="text-dim text-sm mt-1">Enter your email to receive a reset token</p>
        </div>

        <div class="card">
          @if (sent()) {
            <div class="text-center py-2">
              <div class="w-12 h-12 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p class="text-bright font-medium">Check your email</p>
              <p class="text-dim text-sm mt-1 mb-4">If that email exists, a reset token has been sent.</p>
              <a routerLink="/auth/reset-password" class="btn-primary inline-block">Enter reset token</a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
              @if (error()) {
                <div class="mb-5 px-4 py-3 rounded-md bg-rose/10 border border-rose/20 text-rose text-sm">
                  {{ error() }}
                </div>
              }

              <div class="mb-6">
                <label class="block text-sm text-dim mb-1.5">Email address</label>
                <input formControlName="email" type="email" placeholder="you@example.com"
                  class="input-field" [class.error]="isInvalid('email')" />
                @if (isInvalid('email')) {
                  <p class="text-rose text-xs mt-1">Enter a valid email address</p>
                }
              </div>

              <button type="submit" class="btn-primary w-full flex items-center justify-center gap-2"
                [disabled]="loading()">
                @if (loading()) {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Sending...
                } @else {
                  Send reset token
                }
              </button>
            </form>
          }
        </div>

        <p class="text-center text-dim text-sm mt-5">
          <a routerLink="/auth/login" class="text-indigo hover:text-[#818cf8] transition-colors">← Back to sign in</a>
        </p>

      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  form!: ReturnType<FormBuilder['group']>;
    loading = signal(false);
    error   = signal('');
    sent    = signal(false);

    constructor(private fb: FormBuilder, private auth: AuthService) {
      this.form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
      });
    }
  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    this.auth.forgotPassword(this.form.value as any).subscribe({
      next: () => { this.sent.set(true); this.loading.set(false); },
      error: () => { this.error.set('Something went wrong. Please try again.'); this.loading.set(false); }
    });
  }

  isInvalid(field: string) {
    const c = this.form.get(field);
    return c?.invalid && c.touched;
  }
}
