import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="skeleton"
      [style.width]="width()"
      [style.height]="height()"
      [class.skeleton-circle]="variant() === 'circle'"
      [class.skeleton-text]="variant() === 'text'"
    ></div>
  `,
  styles: `
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--ui-skeleton, #e5e7eb) 25%,
        var(--ui-skeleton-highlight, #f3f4f6) 50%,
        var(--ui-skeleton, #e5e7eb) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 0.25rem;
    }

    .skeleton-circle {
      border-radius: 50%;
    }

    .skeleton-text {
      height: 1em;
      border-radius: 0.125rem;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `,
})
export class SkeletonComponent {
  width = input('100%');
  height = input('1rem');
  variant = input<'rect' | 'circle' | 'text'>('rect');
}
