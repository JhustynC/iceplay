import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../../core/services/theme.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, RouterLink],
  template: `
    <div class="flex items-center gap-1">
      <!-- Admin Panel Link (only for authenticated users) -->
      @if (authService.isAuthenticated()) {
        <button
          matIconButton
          [routerLink]="authService.getDefaultRoute()"
          aria-label="Panel de Administración"
        >
          <mat-icon>admin_panel_settings</mat-icon>
        </button>
      }

      <!-- Theme Toggle -->
      <button matIconButton [matMenuTriggerFor]="themeMenu" aria-label="Cambiar tema">
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
            @if (themeService.theme() === theme.key) {
              <mat-icon class="check-icon">check</mat-icon>
            }
          </button>
        }
      </mat-menu>

      <!-- User Menu -->
      <button matIconButton [matMenuTriggerFor]="userMenu" aria-label="Menú de usuario">
        @if (authService.isAuthenticated()) {
          <div class="user-avatar">{{ authService.userInitials() }}</div>
        } @else {
          <mat-icon>person_outline</mat-icon>
        }
      </button>

      <mat-menu #userMenu="matMenu" xPosition="before">
        @if (!authService.isAuthenticated()) {
          <a mat-menu-item routerLink="/auth/login">
            <mat-icon>login</mat-icon>
            <span>Iniciar sesión</span>
          </a>
        } @else {
          <div class="menu-header">
            <strong>{{ authService.userFullName() }}</strong>
            <span class="user-role">
              {{ authService.isSuperAdmin() ? 'Super Admin' : 'Administrador' }}
            </span>
          </div>
          <mat-divider />
          <a mat-menu-item [routerLink]="authService.getDefaultRoute()">
            <mat-icon>dashboard</mat-icon>
            <span>Panel de Control</span>
          </a>
          <mat-divider />
          <button mat-menu-item (click)="authService.logout()">
            <mat-icon>logout</mat-icon>
            <span>Cerrar sesión</span>
          </button>
        }
      </mat-menu>
    </div>
  `,
  styles: `
    .active-theme {
      background-color: color-mix(in srgb, var(--mat-sys-primary) 15%, transparent);
    }

    .check-icon {
      margin-left: auto;
      color: var(--mat-sys-primary);
    }

    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .menu-header {
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;

      strong {
        font-size: 0.875rem;
      }

      .user-role {
        font-size: 0.75rem;
        color: var(--mat-sys-on-surface-variant);
      }
    }
  `,
})
export class HeaderActions {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
}
