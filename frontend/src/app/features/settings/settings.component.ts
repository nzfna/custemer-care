import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-lg">
      <a routerLink="/profile" class="inline-flex items-center gap-1.5 text-dim text-sm hover:text-bright transition-colors mb-6">
        ← Back to profile
      </a>

      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-bright">Settings</h1>
        <p class="text-dim text-sm mt-1">Manage your email and password</p>
      </div>

      <!-- ── EMAIL ──────────────────────────────────────────────── -->
      <div class="card mb-4">
        <h3 class="text-bright font-medium mb-1">Email Address</h3>
        <p class="text-faint text-xs mb-4">Current: {{ auth.currentUser()?.email }}</p>

        @if (emailStep() === 'idle') {
          <form [formGroup]="emailForm" (ngSubmit)="requestEmailChange()">
            <label class="block text-sm text-dim mb-1.5">New email address</label>
            <input formControlName="newEmail" type="email" placeholder="new@email.com"
              class="input-field mb-3" [class.error]="emailInvalid('newEmail')" />
            @if (emailError()) {
              <p class="text-rose text-xs mb-3">{{ emailError() }}</p>
            }
            <button type="submit" class="btn-primary text-sm" [disabled]="emailLoading()">
              {{ emailLoading() ? 'Sending...' : 'Send verification code' }}
            </button>
          </form>
        }

        @if (emailStep() === 'verify') {
          <div class="px-4 py-3 rounded-md bg-cyan/10 border border-cyan/20 text-cyan text-sm mb-4">
            Kode verifikasi sudah dikirim. Cek terminal/log backend untuk kode (dev mode).
          </div>
          <form [formGroup]="emailCodeForm" (ngSubmit)="confirmEmailChange()">
            <label class="block text-sm text-dim mb-1.5">Verification code</label>
            <input formControlName="code" type="text" placeholder="6-digit code" maxlength="6"
              class="input-field mb-3 font-mono tracking-widest" />
            @if (emailError()) {
              <p class="text-rose text-xs mb-3">{{ emailError() }}</p>
            }
            <div class="flex gap-2">
              <button type="submit" class="btn-primary text-sm" [disabled]="emailLoading()">
                {{ emailLoading() ? 'Verifying...' : 'Confirm change' }}
              </button>
              <button type="button" (click)="emailStep.set('idle')" class="btn-ghost text-sm">Cancel</button>
            </div>
          </form>
        }

        @if (emailStep() === 'done') {
          <div class="px-4 py-3 rounded-md bg-emerald/10 border border-emerald/20 text-emerald text-sm">
            Email berhasil diperbarui!
          </div>
        }
      </div>

      <!-- ── PASSWORD ───────────────────────────────────────────── -->
      <div class="card">
        <h3 class="text-bright font-medium mb-1">Password</h3>
        <p class="text-faint text-xs mb-4">Update your account password</p>

        @if (passwordStep() === 'idle') {
          <form [formGroup]="passwordForm" (ngSubmit)="requestPasswordChange()">
            <label class="block text-sm text-dim mb-1.5">Current password</label>
            <input formControlName="currentPassword" type="password" placeholder="••••••••"
              class="input-field mb-3" />
            @if (passwordError()) {
              <p class="text-rose text-xs mb-3">{{ passwordError() }}</p>
            }
            <button type="submit" class="btn-primary text-sm" [disabled]="passwordLoading()">
              {{ passwordLoading() ? 'Sending...' : 'Send verification code' }}
            </button>
          </form>
        }

        @if (passwordStep() === 'verify') {
          <div class="px-4 py-3 rounded-md bg-cyan/10 border border-cyan/20 text-cyan text-sm mb-4">
            Kode verifikasi sudah dikirim. Cek terminal/log backend untuk kode (dev mode).
          </div>
          <form [formGroup]="passwordCodeForm" (ngSubmit)="confirmPasswordChange()">
            <label class="block text-sm text-dim mb-1.5">Verification code</label>
            <input formControlName="code" type="text" placeholder="6-digit code" maxlength="6"
              class="input-field mb-3 font-mono tracking-widest" />

            <label class="block text-sm text-dim mb-1.5">New password</label>
            <input formControlName="newPassword" type="password" placeholder="Min. 8 characters"
              class="input-field mb-3" />

            @if (passwordError()) {
              <p class="text-rose text-xs mb-3">{{ passwordError() }}</p>
            }
            <div class="flex gap-2">
              <button type="submit" class="btn-primary text-sm" [disabled]="passwordLoading()">
                {{ passwordLoading() ? 'Verifying...' : 'Confirm change' }}
              </button>
              <button type="button" (click)="passwordStep.set('idle')" class="btn-ghost text-sm">Cancel</button>
            </div>
          </form>
        }

        @if (passwordStep() === 'done') {
          <div class="px-4 py-3 rounded-md bg-emerald/10 border border-emerald/20 text-emerald text-sm">
            Password berhasil diperbarui!
          </div>
        }
      </div>
    </div>
  `
})
export class SettingsComponent {
  emailForm!: ReturnType<FormBuilder['group']>;
  emailCodeForm!: ReturnType<FormBuilder['group']>;
  passwordForm!: ReturnType<FormBuilder['group']>;
  passwordCodeForm!: ReturnType<FormBuilder['group']>;

  emailStep    = signal<'idle' | 'verify' | 'done'>('idle');
  emailLoading = signal(false);
  emailError   = signal('');

  passwordStep    = signal<'idle' | 'verify' | 'done'>('idle');
  passwordLoading = signal(false);
  passwordError   = signal('');

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    public auth: AuthService
  ) {
    this.emailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]],
    });
    this.emailCodeForm = this.fb.group({
      code: ['', Validators.required],
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
    });
    this.passwordCodeForm = this.fb.group({
      code: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  emailInvalid(field: string) {
    const c = this.emailForm.get(field);
    return c?.invalid && c.touched;
  }

  // ── Email flow ───────────────────────────────────────────────────────
  requestEmailChange() {
    if (this.emailForm.invalid) { this.emailForm.markAllAsTouched(); return; }
    this.emailLoading.set(true);
    this.emailError.set('');

    this.accountService.requestEmailChange(this.emailForm.value.newEmail!).subscribe({
      next: res => {
        if (res.success) this.emailStep.set('verify');
        else this.emailError.set(res.message);
        this.emailLoading.set(false);
      },
      error: err => {
        this.emailError.set(err.error?.message || 'Failed to send code.');
        this.emailLoading.set(false);
      }
    });
  }

  confirmEmailChange() {
    if (this.emailCodeForm.invalid) return;
    this.emailLoading.set(true);
    this.emailError.set('');

    this.accountService.confirmEmailChange(this.emailCodeForm.value.code!).subscribe({
      next: res => {
        if (res.success) {
          this.emailStep.set('done');
          // Update local user state with new email
          const current = this.auth.currentUser();
          if (current) {
            this.auth.currentUser.set({ ...current, email: this.emailForm.value.newEmail! });
          }
        } else {
          this.emailError.set(res.message);
        }
        this.emailLoading.set(false);
      },
      error: err => {
        this.emailError.set(err.error?.message || 'Invalid code.');
        this.emailLoading.set(false);
      }
    });
  }

  // ── Password flow ───────────────────────────────────────────────────
  requestPasswordChange() {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.passwordLoading.set(true);
    this.passwordError.set('');

    this.accountService.requestPasswordChange(this.passwordForm.value.currentPassword!).subscribe({
      next: res => {
        if (res.success) this.passwordStep.set('verify');
        else this.passwordError.set(res.message);
        this.passwordLoading.set(false);
      },
      error: err => {
        this.passwordError.set(err.error?.message || 'Failed to send code.');
        this.passwordLoading.set(false);
      }
    });
  }

  confirmPasswordChange() {
    if (this.passwordCodeForm.invalid) return;
    this.passwordLoading.set(true);
    this.passwordError.set('');

    const { code, newPassword } = this.passwordCodeForm.value;
    this.accountService.confirmPasswordChange(code!, newPassword!).subscribe({
      next: res => {
        if (res.success) this.passwordStep.set('done');
        else this.passwordError.set(res.message);
        this.passwordLoading.set(false);
      },
      error: err => {
        this.passwordError.set(err.error?.message || 'Invalid code.');
        this.passwordLoading.set(false);
      }
    });
  }
}