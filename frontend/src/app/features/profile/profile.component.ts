import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-lg">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-bright">Profile</h1>
        <p class="text-dim text-sm mt-1">Your account information</p>
      </div>

      <div class="card">
        <!-- Avatar with hover upload/delete -->
        <div class="flex items-center gap-5 mb-6 pb-6 border-b border-white/[0.06]">

          <div class="relative w-20 h-20 flex-shrink-0 group">
            <div class="w-20 h-20 rounded-full bg-indigo/20 border border-indigo/30 flex items-center justify-center overflow-hidden">
              @if (photoPreview()) {
                <img [src]="photoPreview()" alt="Profile" class="w-full h-full object-cover" />
              } @else {
                <span class="text-indigo text-2xl font-bold">{{ initials() }}</span>
              }
            </div>

            <!-- Hover overlay -->
            <div class="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100
                        transition-opacity duration-150 flex items-center justify-center gap-1.5 cursor-pointer">
              <button (click)="fileInput.click()"
                title="Upload photo"
                class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 7.5L12 3m0 0L7.5 7.5M12 3v13.5"/>
                </svg>
              </button>
              @if (photoPreview()) {
                <button (click)="confirmDelete.set(true)"
                  title="Remove photo"
                  class="w-7 h-7 rounded-full bg-rose/20 hover:bg-rose/30 flex items-center justify-center transition-colors">
                  <svg class="w-3.5 h-3.5 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              }
            </div>

            <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)" />
          </div>

          <div>
            <p class="text-bright font-semibold text-lg">{{ user()?.fullName }}</p>
            <span class="text-xs px-2.5 py-0.5 rounded-full border mt-1.5 inline-block"
              [class]="isAgent()
                ? 'bg-amber/10 text-amber border-amber/20'
                : 'bg-cyan/10 text-cyan border-cyan/20'">
              {{ isAgent() ? 'Agent' : 'Customer' }}
            </span>
            <p class="text-faint text-xs mt-2">Hover foto untuk ubah atau hapus</p>
          </div>
        </div>

        <!-- Info -->
        <div class="space-y-4">
          <div>
            <p class="text-faint text-xs mb-1">Full Name</p>
            <p class="text-bright text-sm">{{ user()?.fullName }}</p>
          </div>
          <div>
            <p class="text-faint text-xs mb-1">Email Address</p>
            <p class="text-bright text-sm">{{ user()?.email }}</p>
          </div>
          <div>
            <p class="text-faint text-xs mb-1">Role</p>
            <p class="text-bright text-sm">{{ isAgent() ? 'Support Agent' : 'Customer' }}</p>
          </div>
        </div>
      </div>

      <!-- Quick links -->
      <div class="grid grid-cols-2 gap-3 mt-4">
        <a routerLink="/settings" class="card !p-4 hover:!border-white/15 transition-colors flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-indigo/10 border border-indigo/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <span class="text-bright text-sm font-medium">Settings</span>
        </a>

        <button (click)="logout()"
          class="card !p-4 hover:!border-rose/20 transition-colors flex items-center gap-3 text-left">
          <div class="w-9 h-9 rounded-lg bg-rose/10 border border-rose/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </div>
          <span class="text-rose text-sm font-medium">Sign out</span>
        </button>
      </div>
    </div>

    <!-- Confirm delete photo modal -->
    @if (confirmDelete()) {
      <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" (click)="confirmDelete.set(false)">
        <div class="card max-w-sm w-full" (click)="$event.stopPropagation()">
          <div class="w-11 h-11 rounded-full bg-rose/10 border border-rose/20 flex items-center justify-center mb-4">
            <svg class="w-5 h-5 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-bright font-semibold mb-1.5">Hapus foto profil?</h3>
          <p class="text-dim text-sm mb-5">Tindakan ini tidak bisa dibatalkan. Foto profil kamu akan dihapus.</p>
          <div class="flex gap-3">
            <button (click)="deletePhoto()" class="flex-1 px-4 py-2.5 rounded-md bg-rose text-white text-sm font-medium hover:bg-rose/90 transition-colors">
              Ya, hapus
            </button>
            <button (click)="confirmDelete.set(false)" class="flex-1 btn-secondary text-sm">
              Batal
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ProfileComponent {
  auth = inject(AuthService);

  user     = this.auth.currentUser;
  isAgent  = computed(() => this.auth.isAgent());
  initials = computed(() => {
    const name = this.auth.currentUser()?.fullName || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  });

  // UI-only state — belum terhubung ke backend (akan ditambahkan saat upload service dibuat)
  photoPreview  = signal<string | null>(null);
  confirmDelete = signal(false);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => this.photoPreview.set(reader.result as string);
    reader.readAsDataURL(file);

    // TODO: kirim file ke backend saat endpoint upload sudah tersedia
    input.value = '';
  }

  deletePhoto() {
    this.photoPreview.set(null);
    this.confirmDelete.set(false);
    // TODO: panggil endpoint delete foto di backend saat sudah tersedia
  }

  logout() { this.auth.logout(); }
}
