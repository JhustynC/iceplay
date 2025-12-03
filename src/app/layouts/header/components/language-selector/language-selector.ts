import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { I18nService } from '../../../../core/services/i18n.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

/**
 * Language selector component displayed in the header.
 * Shows a menu with available languages and allows users to switch between them.
 */
@Component({
  selector: 'app-language-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatIconButton, MatMenu, MatMenuItem, MatMenuTrigger, MatTooltip, TranslatePipe],
  template: `
    <button
      matIconButton
      [matMenuTriggerFor]="langMenu"
      [matTooltip]="'header.changeLanguage' | translate"
      aria-label="Cambiar idioma"
    >
      <mat-icon>language</mat-icon>
    </button>
    <mat-menu #langMenu="matMenu">
      @for (lang of i18nService.availableLanguages; track lang.code) {
        <button
          mat-menu-item
          (click)="i18nService.setLanguage(lang.code)"
          [class.active-lang]="i18nService.language() === lang.code"
        >
          <span>{{ lang.flag }}</span>
          <span>{{ lang.label }}</span>
          @if (i18nService.language() === lang.code) {
            <mat-icon class="check-icon">check</mat-icon>
          }
        </button>
      }
    </mat-menu>
  `,
  styles: `
    .active-lang {
      background: color-mix(in srgb, var(--mat-sys-primary) 15%, transparent);
    }

    .check-icon {
      margin-left: auto;
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }
  `,
})
export class LanguageSelectorComponent {
  protected readonly i18nService = inject(I18nService);
}

