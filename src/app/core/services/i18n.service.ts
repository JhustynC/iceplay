import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

export type Language = 'es' | 'en';

interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

/**
 * Internationalization service for runtime language switching.
 * Loads translation files from /i18n/{lang}.json and provides reactive translation API.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);

  // Private signals for internal state management
  private readonly _translations = signal<Record<string, any>>({});
  private readonly _currentLanguage = signal<Language>('es');
  private readonly _isLoading = signal<boolean>(true);

  /** Read-only signal for current language - use in templates/components */
  readonly language = this._currentLanguage.asReadonly();

  /** Read-only signal for translations object - use in pipes to trigger re-evaluation */
  readonly translations = this._translations.asReadonly();

  /** Read-only signal indicating if translations are currently loading */
  readonly isLoading = this._isLoading.asReadonly();

  private static readonly VALID_LANGUAGES: Language[] = ['es', 'en'];

  constructor() {
    // Restore saved language preference from localStorage
    if (typeof localStorage !== 'undefined') {
      const savedLang = localStorage.getItem('iceplay-language') as Language;
      if (I18nService.VALID_LANGUAGES.includes(savedLang)) {
        this._currentLanguage.set(savedLang);
      }
    }

    // Load translations for the initial language
    this.loadLanguage(this._currentLanguage());

    // Persist language preference to localStorage whenever it changes
    effect(() => {
      const lang = this._currentLanguage();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('iceplay-language', lang);
      }
    });
  }

  /**
   * Changes the application language and loads the corresponding translation file.
   * @param lang - The language code to switch to ('es' or 'en')
   */
  setLanguage(lang: Language): void {
    if (this._currentLanguage() !== lang) {
      this._currentLanguage.set(lang);
      this.loadLanguage(lang);
    }
  }

  /**
   * Loads translation file for the specified language from /i18n/{lang}.json
   * Note: HttpClient returns Observables, so we need RxJS operators (catchError, of)
   * to handle errors gracefully. This is the minimal RxJS usage required.
   *
   * @param lang - The language code to load
   */
  private loadLanguage(lang: Language): void {
    this._isLoading.set(true);
    this.http
      .get<Record<string, any>>(`/i18n/${lang}.json`)
      .pipe(
        catchError((error) => {
          console.error(`Failed to load language: ${lang}`, error);
          return of({}); // Return empty object on error to prevent app crash
        }),
      )
      .subscribe((translations) => {
        this._translations.set(translations);
        this._isLoading.set(false);
      });
  }

  /**
   * Translates a key using dot notation (e.g., 'common.sports' -> translations.common.sports)
   * @param key - Translation key in dot notation format
   * @param params - Optional parameters to replace in the translation (e.g., {{name}})
   * @returns Translated string or the key if translation not found
   */
  translate(key: string, params?: Record<string, string>): string {
    const translations = this._translations();

    // Return key if translations haven't loaded yet
    if (!translations || Object.keys(translations).length === 0) {
      return key;
    }

    // Navigate through nested object using dot notation (e.g., 'common.sports')
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value?.[k] !== undefined) {
        value = value[k];
      } else {
        return key; // Key path not found
      }
    }

    // Ensure we have a string value
    if (typeof value !== 'string') {
      return key;
    }

    // Replace template parameters (e.g., {{name}})
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match: string, paramKey: string) => {
        return params[paramKey] ?? match;
      });
    }

    return value;
  }

  /** Returns list of available languages with their display information */
  get availableLanguages(): LanguageOption[] {
    return [
      { code: 'es', label: 'Español', flag: '🇪🇸' },
      { code: 'en', label: 'English', flag: '🇬🇧' },
    ];
  }

  /**
   * Formats a date according to the current language locale.
   * @param date - Date object to format
   * @param options - Intl.DateTimeFormatOptions (default: { month: 'long', year: 'numeric' })
   * @returns Formatted date string in the current language
   */
  formatDate(
    date: Date,
    options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' },
  ): string {
    const locale = this._currentLanguage() === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(locale, options);
  }

  /**
   * Gets the locale string for the current language (e.g., 'es-ES', 'en-US')
   */
  getLocale(): string {
    return this._currentLanguage() === 'es' ? 'es-ES' : 'en-US';
  }
}
