import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { HelpModalComponent } from '../help-modal/help-modal.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, HelpModalComponent],
  template: `
    <div class="min-h-screen bg-deep">

      <app-sidebar [open]="sidebarOpen()" (close)="sidebarOpen.set(false)" />

      <app-topbar
        [sidebarOpen]="sidebarOpen()"
        (toggleSidebar)="sidebarOpen.set(!sidebarOpen())"
        (openHelp)="helpOpen.set(true)" />

      <main
        class="pt-14 min-h-screen transition-[margin] duration-200"
        [style.margin-left]="sidebarOpen() ? '240px' : '0px'">
        <div class="p-6 page-enter">
          <router-outlet />
        </div>
      </main>

      @if (helpOpen()) {
        <app-help-modal (close)="helpOpen.set(false)" />
      }

    </div>
  `
})
export class LayoutComponent {
  sidebarOpen = signal(true);
  helpOpen    = signal(false);
}
