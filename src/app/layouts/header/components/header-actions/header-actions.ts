import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-header-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, RouterLink],
  template: `
    <div class="flex items-center gap-1">
      <button matIconButton routerLink="/live-match" aria-label="Live Match Admin View">
        <mat-icon>list</mat-icon>
      </button>

      <!-- User Menu -->
      <button matIconButton [matMenuTriggerFor]="userMenu" aria-label="User menu">
        <mat-icon>person_outline</mat-icon>
      </button>

      <mat-menu #userMenu="matMenu" xPosition="before">
        @if (!isLoggedIn()) {
          <button mat-menu-item>
            <mat-icon>login</mat-icon>
            <span>Sign in</span>
          </button>
          <button mat-menu-item>
            <mat-icon>person_add</mat-icon>
            <span>Sign up</span>
          </button>
        } @else {
          <button mat-menu-item>
            <mat-icon>account_circle</mat-icon>
            <span>My Account</span>
          </button>
          <button mat-menu-item routerLink="/settings">
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </button>
          <mat-divider />
          <!-- Theme Selector -->
          <button mat-menu-item [matMenuTriggerFor]="themeMenu">
            <mat-icon>{{ themeService.themeConfig().icon }}</mat-icon>
            <span>Theme</span>
          </button>
          <mat-divider />
          <button mat-menu-item>
            <mat-icon>logout</mat-icon>
            <span>Sign out</span>
          </button>
        }
      </mat-menu>

      <!-- Theme Submenu -->
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
  `,
})
export class HeaderActions {
  themeService = inject(ThemeService);

  // TODO: Connect to real auth service
  isLoggedIn = signal(true);
}
