import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'ui-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  template: `
    <div [class]="avatarClasses()">
      <div class="avatar-content">
        @if (src()) {
          <img
            [ngSrc]="src()!"
            [alt]="alt()"
            [width]="dimensions().size"
            [height]="dimensions().size"
            class="avatar-image"
          />
        } @else {
          <span class="avatar-initials">{{ initials() }}</span>
        }
      </div>

      @if (status()) {
        <span [class]="'avatar-status status-' + status()"></span>
      }
    </div>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .avatar {
      position: relative;
      display: inline-block;
    }

    .avatar-content {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      overflow: hidden;
    }

    .avatar-xs .avatar-content {
      width: 24px;
      height: 24px;
      font-size: 0.625rem;
    }
    .avatar-sm .avatar-content {
      width: 32px;
      height: 32px;
      font-size: 0.75rem;
    }
    .avatar-md .avatar-content {
      width: 40px;
      height: 40px;
      font-size: 0.875rem;
    }
    .avatar-lg .avatar-content {
      width: 56px;
      height: 56px;
      font-size: 1.125rem;
    }
    .avatar-xl .avatar-content {
      width: 80px;
      height: 80px;
      font-size: 1.5rem;
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-initials {
      text-transform: uppercase;
      user-select: none;
    }

    .avatar-status {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 25%;
      height: 25%;
      min-width: 10px;
      min-height: 10px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
      z-index: 1;
    }

    .status-online {
      background: #22c55e;
    }
    .status-offline {
      background: #9ca3af;
    }
    .status-busy {
      background: #ef4444;
    }
    .status-away {
      background: #f59e0b;
    }
  `,
})
export class AvatarComponent {
  src = input<string | null>(null);
  alt = input('Avatar');
  name = input('');
  size = input<AvatarSize>('md');
  status = input<'online' | 'offline' | 'busy' | 'away' | null>(null);

  protected initials = computed(() => {
    const fullName = this.name();
    if (!fullName) return '?';

    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  });

  protected dimensions = computed(() => {
    const sizes: Record<AvatarSize, number> = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 56,
      xl: 80,
    };
    return { size: sizes[this.size()] };
  });

  protected avatarClasses(): string {
    return `avatar avatar-${this.size()}`;
  }
}
