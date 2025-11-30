import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [class]="'spinner spinner-' + size()" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        class="spinner-track"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-dasharray="60"
        class="spinner-indicator"
      />
    </svg>
  `,
  styles: `
    .spinner {
      animation: rotate 1s linear infinite;
    }

    .spinner-sm {
      width: 16px;
      height: 16px;
    }
    .spinner-md {
      width: 24px;
      height: 24px;
    }
    .spinner-lg {
      width: 40px;
      height: 40px;
    }

    .spinner-track {
      opacity: 0.25;
    }

    .spinner-indicator {
      animation: dash 1.5s ease-in-out infinite;
    }

    @keyframes rotate {
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes dash {
      0% {
        stroke-dashoffset: 60;
      }
      50% {
        stroke-dashoffset: 15;
      }
      100% {
        stroke-dashoffset: 60;
      }
    }
  `,
})
export class SpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
}
