import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Header } from './layouts/header/header';
import { SportSidenavComponent } from './layouts/sport-sidenav/sport-sidenav.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, SportSidenavComponent],
  template: `
    @if (isPublicRoute()) {
      <app-header />
      <sport-sidenav />
    } @else {
      <!-- Admin/SuperAdmin/Auth routes have their own layouts -->
      <router-outlet />
    }
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
  private readonly router = inject(Router);

  /** Track current URL reactively */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** Public routes show main header + sport sidenav layout */
  protected readonly isPublicRoute = computed(() => {
    const url = this.currentUrl();
    return !url.startsWith('/auth') && !url.startsWith('/admin') && !url.startsWith('/super-admin');
  });
}
