import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="layout-wrapper">
      <!-- Top Header Bar (spans full width) -->
      <header class="top-header">
        <div class="header-brand">
          <button matIconButton (click)="sidenav.toggle()" aria-label="Toggle menu">
            <mat-icon>menu</mat-icon>
          </button>
          <a routerLink="/admin" class="logo"> <span class="ice">ICE</span>PLAY </a>
          <span class="badge">Admin</span>
        </div>
        <div class="header-actions">
          <!-- Theme Toggle -->
          <button matIconButton [matMenuTriggerFor]="themeMenu" matTooltip="Cambiar tema">
            <mat-icon>{{ themeService.themeConfig().icon }}</mat-icon>
          </button>
          <mat-menu #themeMenu="matMenu">
            @for (theme of themeService.availableThemes; track theme.key) {
              <button
                mat-menu-item
                (click)="themeService.setTheme(theme.key)"
                [class.active-theme]="themeService.theme() === theme.key"
              >
                <mat-icon>{{ theme.icon }}</mat-icon>
                <span>{{ theme.name }}</span>
              </button>
            }
          </mat-menu>

          <!-- User Menu -->
          <button matIconButton [matMenuTriggerFor]="userMenu" matTooltip="Mi cuenta">
            <div class="header-avatar">{{ authService.userInitials() }}</div>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="menu-header">
              <strong>{{ authService.userFullName() }}</strong>
              <span>{{ authService.user()?.email }}</span>
            </div>
            <mat-divider />
            <a mat-menu-item routerLink="/">
              <mat-icon>public</mat-icon>
              <span>Ver sitio público</span>
            </a>
            <mat-divider />
            <button mat-menu-item (click)="authService.logout()">
              <mat-icon>logout</mat-icon>
              <span>Cerrar sesión</span>
            </button>
          </mat-menu>
        </div>
      </header>

      <!-- Body: Sidenav + Content -->
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav
          #sidenav
          [mode]="sidenavMode()"
          [opened]="sidenavOpened()"
          (openedChange)="sidenavOpened.set($event)"
          class="sidenav"
        >
          <!-- Navigation -->
          <mat-nav-list class="nav-list">
            @for (item of navItems; track item.route) {
              <a
                mat-list-item
                [routerLink]="item.route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                (click)="onNavClick()"
              >
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                <span matListItemTitle>{{ item.label }}</span>
              </a>
            }
          </mat-nav-list>

          <div class="sidenav-footer">
            <mat-divider />
            <div class="user-info">
              <div class="avatar">{{ authService.userInitials() }}</div>
              <div class="user-details">
                <span class="user-name">{{ authService.userFullName() }}</span>
                <span class="user-role">Administrador</span>
              </div>
            </div>
          </div>
        </mat-sidenav>

        <!-- Main Content -->
        <mat-sidenav-content class="content">
          <main class="main-content">
            <router-outlet />
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: `
    .layout-wrapper {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    /* Top Header - Full Width */
    .top-header {
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 0.5rem;
      background: var(--mat-sys-surface-container);
      // border-bottom: 1px solid var(--mat-sys-outline-variant);
      flex-shrink: 0;
      z-index: 1000;
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .header-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.75rem;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .logo {
      font-family: 'Russo One', sans-serif;
      font-size: 1.25rem;
      letter-spacing: 0.09em;
      text-decoration: none;
      color: inherit;

      .ice {
        color: #7dd3fc;
        text-shadow: 0 0 10px rgba(125, 211, 252, 0.5);
      }
    }

    .badge {
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 0.2rem 0.5rem;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      border-radius: 4px;
    }

    /* Sidenav Container - Below Header */
    .sidenav-container {
      flex: 1;
      overflow: hidden;
    }

    .sidenav {
      width: 240px;
      background: var(--mat-sys-surface-container);
      // border-right: 1px solid var(--mat-sys-outline-variant);
      border-radius: 0;
    }

    /* Override Material rounded corners */
    ::ng-deep .mat-drawer-inner-container {
      border-radius: 0 !important;
    }

    .nav-list {
      padding: 0.5rem;

      a {
        border-radius: 8px;
        margin-bottom: 2px;

        &.active {
          background: color-mix(in srgb, var(--mat-sys-primary) 20%, transparent);
          color: var(--mat-sys-primary);

          mat-icon {
            color: var(--mat-sys-primary);
          }
        }
      }
    }

    /* Reset ALL background states for non-active items */
    ::ng-deep .nav-list .mat-mdc-list-item:not(.active) {
      background: transparent !important;

      /* Remove all state layers */
      &::before,
      &::after,
      .mat-mdc-focus-indicator::before,
      .mdc-list-item__ripple::before,
      .mat-ripple-element,
      .mdc-list-item__start::before,
      .mdc-list-item__end::before {
        background: transparent !important;
        opacity: 0 !important;
      }

      /* Override any focus/hover states */
      &:focus,
      &:hover,
      &:active,
      &.cdk-focused,
      &.cdk-keyboard-focused,
      &.cdk-program-focused,
      &.mat-mdc-list-item-interactive:focus,
      &.mat-mdc-list-item-interactive:hover {
        background: transparent !important;

        &::before {
          opacity: 0 !important;
        }
      }
    }

    /* Make sure active item keeps its style */
    ::ng-deep .nav-list .mat-mdc-list-item.active {
      background: color-mix(in srgb, var(--mat-sys-primary) 20%, transparent) !important;

      .mdc-list-item__primary-text {
        color: var(--mat-sys-primary) !important;
      }

      .mat-icon {
        color: var(--mat-sys-primary) !important;
      }
    }

    .sidenav-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--mat-sys-surface-container);
    }

    .user-info {
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.8rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-weight: 500;
      font-size: 0.875rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .content {
      display: flex;
      flex-direction: column;
      background: var(--mat-sys-surface);
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
    }

    .menu-header {
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      strong {
        font-size: 0.875rem;
      }

      span {
        font-size: 0.75rem;
        color: var(--mat-sys-on-surface-variant);
      }
    }

    .active-theme {
      background: color-mix(in srgb, var(--mat-sys-primary) 15%, transparent);
    }
  `,
})
export default class AdminLayout {
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  sidenavOpened = signal(true);
  sidenavMode = signal<'side' | 'over'>('side');

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: 'emoji_events', label: 'Campeonatos', route: '/admin/championships' },
    { icon: 'groups', label: 'Equipos', route: '/admin/teams' },
    { icon: 'person', label: 'Jugadores', route: '/admin/players' },
    { icon: 'calendar_month', label: 'Fixture', route: '/admin/fixtures' },
    { icon: 'sports', label: 'Partidos', route: '/admin/matches' },
    { icon: 'leaderboard', label: 'Tabla de Posiciones', route: '/admin/standings' },
    { icon: 'bar_chart', label: 'Estadísticas', route: '/admin/statistics' },
  ];

  constructor() {
    // Check screen size on init
    this.checkScreenSize();
    // Listen for resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.checkScreenSize());
    }
  }

  private checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      const isSmall = window.innerWidth < 1024;
      this.sidenavMode.set(isSmall ? 'over' : 'side');
      this.sidenavOpened.set(!isSmall);
    }
  }

  onNavClick(): void {
    if (this.sidenavMode() === 'over') {
      this.sidenavOpened.set(false);
    }
  }
}
