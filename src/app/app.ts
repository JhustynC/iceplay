import { Component, inject, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Header } from './layouts/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  template: `
    @if (showHeader()) {
      <app-header />
    }
    <router-outlet />
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: var(--mat-sys-surface);
    }
  `,
})
export class App {
  private router = inject(Router);

  // Track current URL
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  // Hide header on auth/admin/super-admin routes (they have their own layout or no header needed)
  showHeader = computed(() => {
    const url = this.currentUrl();
    return !url.startsWith('/auth') && !url.startsWith('/admin') && !url.startsWith('/super-admin');
  });
}
