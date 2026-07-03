import { Component, HostListener, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative" (click)="$event.stopPropagation()">
      <button type="button" (click)="open.set(!open())"
        class="input-field !py-2 !text-sm flex items-center justify-between gap-2 cursor-pointer min-w-[140px]">
        <span [class.text-faint]="!selectedLabel()">{{ selectedLabel() ?? placeholder }}</span>
        <svg class="w-4 h-4 text-faint flex-shrink-0 transition-transform" [class.rotate-180]="open()"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      @if (open()) {
        <div class="absolute left-0 top-full mt-1.5 w-full min-w-[160px] bg-surface border border-white/[0.1]
                    rounded-md shadow-modal py-1 z-50 max-h-60 overflow-y-auto">
          @for (opt of options; track opt.value) {
            <button type="button" (click)="select(opt)"
              class="w-full text-left px-3.5 py-2 text-sm transition-colors"
              [class]="opt.value === value
                ? 'bg-indigo/15 text-bright font-medium'
                : 'text-dim hover:bg-white/5 hover:text-bright'">
              {{ opt.label }}
            </button>
          }
        </div>
      }
    </div>
  `
})
export class DropdownComponent {
  @Input() options: DropdownOption[] = [];
  @Input() value: string = '';
  @Input() placeholder: string = 'Select...';
  @Output() valueChange = new EventEmitter<string>();

  open = signal(false);

  selectedLabel(): string | null {
    const found = this.options.find(o => o.value === this.value);
    return found ? found.label : null;
  }

  select(opt: DropdownOption) {
    this.value = opt.value;
    this.valueChange.emit(opt.value);
    this.open.set(false);
  }

  @HostListener('document:click')
  closeOnOutsideClick() {
    this.open.set(false);
  }
}
