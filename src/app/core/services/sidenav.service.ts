import { Injectable, computed, signal } from '@angular/core';

export type SidenavMode = 'side' | 'over';

@Injectable({ providedIn: 'root' })
export class SidenavService {
  private readonly _opened = signal(false);
  private readonly _mode = signal<SidenavMode>('over');

  /** Read-only signal for sidenav open state */
  readonly opened = this._opened.asReadonly();

  /** Read-only signal for sidenav mode */
  readonly mode = this._mode.asReadonly();

  /** Computed signal combining state for templates */
  readonly isOverlay = computed(() => this._mode() === 'over');

  open(): void {
    this._opened.set(true);
  }

  close(): void {
    this._opened.set(false);
  }

  toggle(): void {
    this._opened.update((opened) => !opened);
  }

  setMode(mode: SidenavMode): void {
    this._mode.set(mode);
  }

  /** Update mode based on screen width - call from components that need responsive behavior */
  updateModeForScreenWidth(width: number, breakpoint = 1024): void {
    const newMode: SidenavMode = width < breakpoint ? 'over' : 'side';
    this._mode.set(newMode);

    // Auto-close when switching to overlay mode on small screens
    if (newMode === 'over') {
      this._opened.set(false);
    } else {
      this._opened.set(true);
    }
  }
}
