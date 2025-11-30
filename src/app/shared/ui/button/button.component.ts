import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpinnerComponent],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClasses()"
      (click)="handleClick($event)"
    >
      @if (loading()) {
        <ui-spinner size="sm" />
      }
      <ng-content />
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 500;
      border-radius: 0.5rem;
      border: none;
      transition: all 0.2s ease;
      cursor: pointer;
      font-family: inherit;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-primary {
      background: var(--ui-color-primary, #3b82f6);
      color: white;
      &:hover:not(:disabled) {
        background: var(--ui-color-primary-dark, #2563eb);
      }
    }

    .btn-secondary {
      background: var(--ui-color-secondary, #e5e7eb);
      color: var(--ui-color-text, #1f2937);
      &:hover:not(:disabled) {
        background: var(--ui-color-secondary-dark, #d1d5db);
      }
    }

    .btn-danger {
      background: var(--ui-color-danger, #ef4444);
      color: white;
      &:hover:not(:disabled) {
        background: var(--ui-color-danger-dark, #dc2626);
      }
    }

    .btn-ghost {
      background: transparent;
      color: var(--ui-color-text, #1f2937);
      &:hover:not(:disabled) {
        background: var(--ui-color-hover, #f3f4f6);
      }
    }

    .btn-sm {
      padding: 0.375rem 0.875rem;
      font-size: 0.875rem;
    }
    .btn-md {
      padding: 0.5rem 1.25rem;
      font-size: 1rem;
    }
    .btn-lg {
      padding: 0.75rem 1.75rem;
      font-size: 1.125rem;
    }
  `,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  loading = input(false);

  clicked = output<MouseEvent>();

  protected buttonClasses(): string {
    return `btn btn-${this.variant()} btn-${this.size()}`;
  }

  protected handleClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
