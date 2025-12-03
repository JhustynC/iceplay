import {
  ChangeDetectionStrategy,
  Component,
  inject,
  effect,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatNavList, MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { SidenavService } from '../../core/services/sidenav.service';
import { I18nService } from '../../core/services/i18n.service';
import { SPORT_CONFIGS, type Sport } from '../../core/models/sport-config.model';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

interface SportNavItem {
  sport: Sport;
  icon: string;
  route: string;
}

@Component({
  selector: 'sport-sidenav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatNavList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatIcon,
    MatDivider,
    TranslatePipe,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #sidenav
        class="sidenav"
        [mode]="sidenavService.mode()"
        [opened]="sidenavService.opened()"
        (closedStart)="sidenavService.close()"
      >
        <div class="sidenav-header">
          <span class="header-title">{{ 'common.sports' | translate }}</span>
        </div>

        <mat-nav-list class="nav-list">
          @for (item of sportNavItems; track item.sport) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="active"
              (click)="onNavClick()"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ 'sports.' + item.sport | translate }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <mat-divider />
          <div class="footer-content">
            <mat-icon>sports</mat-icon>
            <span>{{ 'sidenav.footer' | translate }}</span>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .sidenav-container {
      min-height: 100vh;
      background: transparent;
    }

    .sidenav-container .mat-sidenav-content {
      background: transparent;
    }

    .sidenav {
      width: 260px;
      background: var(--mat-sys-surface-container);
      border-radius: 0;
    }

    /* Override Material rounded corners */
    ::ng-deep .mat-drawer-inner-container {
      border-radius: 0 !important;
    }

    .sidenav-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .header-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
      letter-spacing: 0.025em;
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

    /* Reset Material default state layers */
    ::ng-deep .nav-list .mat-mdc-list-item {
      /* Remove Material's default state layers */
      &::before,
      .mat-mdc-focus-indicator::before,
      .mdc-list-item__ripple::before {
        display: none !important;
      }
    }

    /* Non-active items with hover effect */
    ::ng-deep .nav-list .mat-mdc-list-item:not(.active) {
      background: transparent;
      transition: background-color 0.2s ease;

      &:hover {
        background: color-mix(in srgb, var(--mat-sys-on-surface) 8%, transparent) !important;
      }

      &:focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: -2px;
      }
    }

    /* Active item style */
    ::ng-deep .nav-list .mat-mdc-list-item.active {
      background: color-mix(in srgb, var(--mat-sys-primary) 20%, transparent) !important;

      .mdc-list-item__primary-text {
        color: var(--mat-sys-primary) !important;
      }

      .mat-icon {
        color: var(--mat-sys-primary) !important;
      }

      &:hover {
        background: color-mix(in srgb, var(--mat-sys-primary) 25%, transparent) !important;
      }
    }

    .sidenav-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--mat-sys-surface-container);
    }

    .footer-content {
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;

      mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      background: var(--mat-sys-surface);
    }
  `,
})
export class SportSidenavComponent {
  protected readonly sidenavService = inject(SidenavService);
  private readonly i18nService = inject(I18nService);
  private readonly cdr = inject(ChangeDetectorRef);

  /** Navigation items derived from sport configurations */
  protected readonly sportNavItems: SportNavItem[] = [
    {
      sport: 'football',
      icon: SPORT_CONFIGS.football.icon,
      route: '/matches',
    },
    {
      sport: 'basketball',
      icon: SPORT_CONFIGS.basketball.icon,
      route: '/matches2',
    },
    {
      sport: 'volleyball',
      icon: SPORT_CONFIGS.volleyball.icon,
      route: '/matches3',
    },
  ];

  constructor() {
    // Initialize responsive sidenav behavior
    this.checkScreenSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.checkScreenSize());
    }

    /**
     ** Force change detection when translations load or language changes.
     ** Required because this component uses OnPush change detection strategy,
     ** which doesn't automatically detect async signal updates from the i18n service.
     ** The effect subscribes to translation signals and triggers change detection
     ** when they update, ensuring the template re-renders with translated content.
     */
    effect(() => {
      this.i18nService.translations();
      this.i18nService.language();
      this.cdr.markForCheck();
    });
  }

  private checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      this.sidenavService.updateModeForScreenWidth(width);
    }
  }

  onNavClick(): void {
    // Close sidenav when in overlay mode
    if (this.sidenavService.isOverlay()) {
      this.sidenavService.close();
    }
  }
}
