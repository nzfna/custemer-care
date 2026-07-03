import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-deep flex items-center justify-center p-4">
      <div class="w-full max-w-md">

        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo/10 border border-indigo/20 mb-4">
            <svg class="w-6 h-6 text-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-semibold text-bright">Reset Password</h1>
          <p class="text-dim text-sm mt-1">Enter your token and new password</p>
        </div>

        <div class="card">
          @if (done()) {
            <div class="text-center py-2">
              <div class="w-12 h-12 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p class="text-bright font-medium">Password updated!</p>
              <p class="text-dim text-sm mt-1 mb-4">You can now sign in with your new password.</p>
              <a routerLink="/auth/login" class="btn-primary inline-block">Sign in</a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
              @if (error()) {
                <div class="mb-5 px-4 py-3 rounded-md bg-rose/10 border border-rose/20 text-rose text-sm">
                  {{ error() }}
                </div>
              }

              <div class="mb-4">
                <label class="block text-sm text-dim mb-1.5">Reset Token</label>
                <input formControlName="token" type="text" placeholder="Paste your reset token"
                  class="input-field font-mono text-sm" [class.error]="isInvalid('token')" />
                @if (isInvalid('token')) {
                  <p class="text-rose text-xs mt-1">Token is required</p>
                }
              </div>

              <div class="mb-6">
                <label class="block text-sm text-dim mb-1.5">New Password</label>
                <input formControlName="newPassword" type="password" placeholder="Min. 8 characters"
                  class="input-field" [class.error]="isInvalid('newPassword')" />
                @if (isInvalid('newPassword')) {
                  <p class="text-rose text-xs mt-1">Password must be at least 8 characters</p>
                }
              </div>

              <button type="submit" class="btn-primary w-full flex items-center justify-center gap-2"
                [disabled]="loading()">
                @if (loading()) {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Resetting...
                } @else {
                  Reset password
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
export class ResetPasswordComponent implements OnInit {
  form!: ReturnType<FormBuilder['group']>;
  loading = signal(false);
  error   = signal('');
  done    = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      token:       ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit() {
    // Pre-fill token if passed as query param ?token=xxx
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) this.form.patchValue({ token });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    this.auth.resetPassword(this.form.value as any).subscribe({
      next: res => {
        if (res.success) { this.done.set(true); }
        else { this.error.set(res.message); }
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message || 'Reset failed. Token may be invalid or expired.');
        this.loading.set(false);
      }
    });
  }

  isInvalid(field: string) {
    const c = this.form.get(field);
    return c?.invalid && c.touched;
  }
}
