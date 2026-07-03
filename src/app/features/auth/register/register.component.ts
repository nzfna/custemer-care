import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-deep flex items-center justify-center p-4">
      <div class="w-full max-w-md">

        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo/10 border border-indigo/20 mb-4">
            <svg class="w-6 h-6 text-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-semibold text-bright">Create Account</h1>
          <p class="text-dim text-sm mt-1">Join Customer Care today</p>
        </div>

        <div class="card">
          @if (success()) {
            <div class="text-center py-4">
              <div class="w-12 h-12 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p class="text-bright font-medium">Account created!</p>
              <p class="text-dim text-sm mt-1">Redirecting to dashboard...</p>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

              @if (error()) {
                <div class="mb-5 px-4 py-3 rounded-md bg-rose/10 border border-rose/20 text-rose text-sm">
                  {{ error() }}
                </div>
              }

              <div class="mb-4">
                <label class="block text-sm text-dim mb-1.5">Full Name</label>
                <input formControlName="fullName" type="text" placeholder="Your full name"
                  class="input-field" [class.error]="isInvalid('fullName')" />
                @if (isInvalid('fullName')) {
                  <p class="text-rose text-xs mt-1">Full name is required (min 2 characters)</p>
                }
              </div>

              <div class="mb-4">
                <label class="block text-sm text-dim mb-1.5">Email</label>
                <input formControlName="email" type="email" placeholder="you@example.com"
                  class="input-field" [class.error]="isInvalid('email')" />
                @if (isInvalid('email')) {
                  <p class="text-rose text-xs mt-1">Enter a valid email address</p>
                }
              </div>

              <div class="mb-6">
                <label class="block text-sm text-dim mb-1.5">Password</label>
                <input formControlName="password" type="password" placeholder="Min. 8 characters"
                  class="input-field" [class.error]="isInvalid('password')" />
                @if (isInvalid('password')) {
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
                  Creating account...
                } @else {
                  Create account
                }
              </button>

            </form>
          }
        </div>

        <p class="text-center text-dim text-sm mt-5">
          Already have an account?
          <a routerLink="/auth/login" class="text-indigo hover:text-[#818cf8] transition-colors ml-1">Sign in</a>
        </p>

      </div>
    </div>
  `
})
export class RegisterComponent {
  form!: ReturnType<FormBuilder['group']>;
    loading = signal(false);
    error   = signal('');
    success = signal(false);

    constructor(private fb: FormBuilder, private auth: AuthService) {
      this.form = this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email:    ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
      });
    }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    this.auth.register(this.form.value as any).subscribe({
      next: res => {
        if (res.success) { this.success.set(true); }
        else { this.error.set(res.message); }
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
        this.loading.set(false);
      }
    });
  }

  isInvalid(field: string) {
    const c = this.form.get(field);
    return c?.invalid && c.touched;
  }
}
