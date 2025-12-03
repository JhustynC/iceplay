import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../services/i18n.service';

/**
 * Pipe for translating keys in templates.
 * Usage: {{ 'common.sports' | translate }} or {{ 'greeting' | translate: {name: 'John'} }}
 *
 * Note: This pipe is impure (pure: false) to reactively update when:
 * - Language changes
 * - Translations finish loading
 * - Translation data updates
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // Must be impure to react to signal changes
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string, params?: Record<string, string>): string {
    //* Subscribe to signals to trigger pipe re-evaluation when they change
    //* This ensures templates update automatically when language/translations change
    this.i18n.language();
    this.i18n.translations();
    this.i18n.isLoading();

    return this.i18n.translate(key, params);
  }
}
