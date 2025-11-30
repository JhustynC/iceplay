import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article [class]="cardClasses()">
      <header class="card-header">
        <ng-content select="[card-header]" />
      </header>

      <div class="card-body">
        <ng-content />
      </div>

      <footer class="card-footer">
        <ng-content select="[card-footer]" />
      </footer>
    </article>
  `,
  styles: `
    .card {
      background: var(--ui-color-surface, #ffffff);
      border-radius: 1rem;
      overflow: hidden;
    }

    .card-elevated {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .card-outlined {
      box-shadow: none;
      border: 1px solid var(--ui-color-border, #e5e7eb);
    }

    .card-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--ui-color-border, #e5e7eb);
      font-weight: 600;
      font-size: 1.125rem;

      &:empty {
        display: none;
      }
    }

    .card-body {
      padding: 1.5rem;
    }

    .card-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--ui-color-border, #e5e7eb);
      background: var(--ui-color-surface-variant, #f9fafb);
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;

      &:empty {
        display: none;
      }
    }

    .card-clickable {
      cursor: pointer;
      transition:
        transform 0.2s,
        box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }
    }
  `,
})
export class CardComponent {
  variant = input<'elevated' | 'outlined' | 'flat'>('elevated');
  clickable = input(false);

  protected cardClasses(): string {
    const classes = ['card'];
    if (this.variant() !== 'flat') {
      classes.push(`card-${this.variant()}`);
    }
    if (this.clickable()) {
      classes.push('card-clickable');
    }
    return classes.join(' ');
  }
}
