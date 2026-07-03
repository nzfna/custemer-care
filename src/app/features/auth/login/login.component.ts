import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-deep flex items-center justify-center p-4">
      <div class="w-full max-w-md">

        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo/10 border border-indigo/20 mb-4">
            <svg class="w-6 h-6 text-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-semibold text-bright">Customer Care</h1>
          <p class="text-dim text-sm mt-1">Sign in to your account</p>
        </div>

        <!-- Card -->
        <div class="card">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

            <!-- Error Banner -->
            @if (error()) {
              <div class="mb-5 px-4 py-3 rounded-md bg-rose/10 border border-rose/20 text-rose text-sm">
                {{ error() }}
              </div>
            }

            <!-- Email -->
            <div class="mb-4">
              <label class="block text-sm text-dim mb-1.5">Email</label>
              <input formControlName="email" type="email" placeholder="you@example.com"
                class="input-field" [class.error]="isInvalid('email')" />
              @if (isInvalid('email')) {
                <p class="text-rose text-xs mt-1">{{ getError('email') }}</p>
              }
            </div>

            <!-- Password -->
            <div class="mb-6">
              <div class="flex justify-between items-center mb-1.5">
                <label class="text-sm text-dim">Password</label>
                <a routerLink="/auth/forgot-password" class="text-xs text-indigo hover:text-[#818cf8] transition-colors">
                  Forgot password?
                </a>
              </div>
              <input formControlName="password" type="password" placeholder="••••••••"
                class="input-field" [class.error]="isInvalid('password')" />
              @if (isInvalid('password')) {
                <p class="text-rose text-xs mt-1">{{ getError('password') }}</p>
              }
            </div>

            <!-- Submit -->
            <button type="submit" class="btn-primary w-full flex items-center justify-center gap-2"
              [disabled]="loading()">
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Signing in...
              } @else {
                Sign in
              }
            </button>

          </form>
        </div>

        <!-- Register Link -->
        <p class="text-center text-dim text-sm mt-5">
          Don't have an account?
          <a routerLink="/auth/register" class="text-indigo hover:text-[#818cf8] transition-colors ml-1">
            Create one
          </a>
        </p>

      </div>
    </div>
  `
})
export class LoginComponent {
  form!: ReturnType<FormBuilder['group']>;
    loading = signal(false);
    error   = signal('');

    constructor(private fb: FormBuilder, private auth: AuthService) {
      this.form = this.fb.group({
        email:    ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
      });
    }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.value as any).subscribe({
      next: res => {
        if (!res.success) this.error.set(res.message);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message || 'Login failed. Please try again.');
        this.loading.set(false);
      }
    });
  }

  isInvalid(field: string) {
    const c = this.form.get(field);
    return c?.invalid && c.touched;
  }

  getError(field: string): string {
    const c = this.form.get(field);
    if (c?.hasError('required')) return 'This field is required';
    if (c?.hasError('email'))    return 'Enter a valid email address';
    return '';
  }
}
