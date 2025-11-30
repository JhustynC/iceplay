import { Injectable, signal, effect, computed } from '@angular/core';

// Define all available themes
export const THEMES = {
  light: {
    name: 'Light',
    icon: 'light_mode',
    colorScheme: 'light' as const,
  },
  dark: {
    name: 'Dark',
    icon: 'dark_mode',
    colorScheme: 'dark' as const,
  },
  midnight: {
    name: 'Midnight Blue',
    icon: 'nights_stay',
    colorScheme: 'dark' as const,
  },
  forest: {
    name: 'Forest',
    icon: 'forest',
    colorScheme: 'dark' as const,
  },
  sunset: {
    name: 'Sunset',
    icon: 'wb_twilight',
    colorScheme: 'light' as const,
  },
  ocean: {
    name: 'Ocean',
    icon: 'water',
    colorScheme: 'dark' as const,
  },
} as const;

export type ThemeKey = keyof typeof THEMES;

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'app-theme';

  theme = signal<ThemeKey>(this.getInitialTheme());

  // Computed values for easy access
  themeConfig = computed(() => THEMES[this.theme()]);
  isDark = computed(() => this.themeConfig().colorScheme === 'dark');

  // List of all themes for UI
  availableThemes = Object.entries(THEMES).map(([key, config]) => ({
    key: key as ThemeKey,
    ...config,
  }));

  constructor() {
    // Apply initial theme
    this.applyTheme(this.theme());

    effect(() => {
      this.applyTheme(this.theme());
    });
  }

  private applyTheme(themeKey: ThemeKey): void {
    const config = THEMES[themeKey];

    // Set color scheme for browser
    document.body.style.colorScheme = config.colorScheme;

    // Remove all theme classes
    Object.keys(THEMES).forEach((key) => {
      document.body.classList.remove(`theme-${key}`);
    });

    // Add current theme class
    document.body.classList.add(`theme-${themeKey}`);

    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, themeKey);
  }

  private getInitialTheme(): ThemeKey {
    const stored = localStorage.getItem(this.STORAGE_KEY) as ThemeKey | null;
    if (stored && stored in THEMES) {
      return stored;
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  setTheme(themeKey: ThemeKey): void {
    this.theme.set(themeKey);
  }

  toggleTheme(): void {
    // Simple toggle between light and dark
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  nextTheme(): void {
    const keys = Object.keys(THEMES) as ThemeKey[];
    const currentIndex = keys.indexOf(this.theme());
    const nextIndex = (currentIndex + 1) % keys.length;
    this.theme.set(keys[nextIndex]);
  }
}
