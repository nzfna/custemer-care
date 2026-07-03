import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" (click)="close.emit()">
      <div class="card max-w-sm w-full !p-0 overflow-hidden" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 class="text-bright font-semibold">Butuh Bantuan?</h3>
          <button (click)="close.emit()" class="text-faint hover:text-bright transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Contacts -->
        <div class="p-5 space-y-3">
          <p class="text-dim text-sm mb-4">Hubungi tim support kami melalui:</p>

          <a [href]="waLink" target="_blank" rel="noopener"
            class="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald/5 border border-emerald/20 hover:bg-emerald/10 transition-colors">
            <div class="w-10 h-10 rounded-full bg-emerald/15 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-emerald" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.36.101 11.943c0 2.104.549 4.158 1.595 5.97L0 24l6.235-1.635a11.93 11.93 0 005.805 1.479h.005c6.585 0 11.946-5.36 11.949-11.944a11.87 11.87 0 00-3.474-8.451"/>
              </svg>
            </div>
            <div>
              <p class="text-bright text-sm font-medium">WhatsApp</p>
              <p class="text-faint text-xs">{{ waNumber }}</p>
            </div>
          </a>

          <a [href]="igLink" target="_blank" rel="noopener"
            class="flex items-center gap-3 px-4 py-3 rounded-lg bg-rose/5 border border-rose/20 hover:bg-rose/10 transition-colors">
            <div class="w-10 h-10 rounded-full bg-rose/15 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-rose" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </div>
            <div>
              <p class="text-bright text-sm font-medium">Instagram</p>
              <p class="text-faint text-xs">{{ igHandle }}</p>
            </div>
          </a>
        </div>

      </div>
    </div>
  `
})
export class HelpModalComponent {
  close = output<void>();

  // Placeholder dummy — gampang diganti nanti
  waNumber = '+62 812-3456-7890';
  igHandle = '@customercare.id';

  waLink = `https://wa.me/6281234567890?text=${encodeURIComponent('Halo, saya butuh bantuan terkait Customer Care System.')}`;
  igLink = 'https://instagram.com/customercare.id';
}
