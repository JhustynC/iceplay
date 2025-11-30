import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  CardComponent,
  AvatarComponent,
  BadgeComponent,
  SpinnerComponent,
  SkeletonComponent,
} from '../../shared/ui';

@Component({
  selector: 'app-ui-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    CardComponent,
    AvatarComponent,
    BadgeComponent,
    SpinnerComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="showcase">
      <header class="showcase-header">
        <h1>UI Components Showcase</h1>
        <p>Design System para IcePlay</p>
      </header>

      <!-- BUTTONS SECTION -->
      <section class="section">
        <h2>Buttons</h2>

        <div class="subsection">
          <h3>Variantes</h3>
          <div class="component-row">
            <ui-button variant="primary">Primary</ui-button>
            <ui-button variant="secondary">Secondary</ui-button>
            <ui-button variant="danger">Danger</ui-button>
            <ui-button variant="ghost">Ghost</ui-button>
          </div>
        </div>

        <div class="subsection">
          <h3>Tamaños</h3>
          <div class="component-row align-center">
            <ui-button size="sm">Small</ui-button>
            <ui-button size="md">Medium</ui-button>
            <ui-button size="lg">Large</ui-button>
          </div>
        </div>

        <div class="subsection">
          <h3>Estados</h3>
          <div class="component-row">
            <ui-button [disabled]="true">Disabled</ui-button>
            <ui-button [loading]="true">Loading</ui-button>
            <ui-button [loading]="isLoading()" (clicked)="simulateLoading()"> Click me </ui-button>
          </div>
        </div>
      </section>

      <!-- CARDS SECTION -->
      <section class="section">
        <h2>Cards</h2>

        <div class="cards-grid">
          <ui-card variant="elevated">
            <span card-header>Elevated Card</span>
            <p>Esta es una card con sombra elevada. Perfecta para destacar contenido importante.</p>
            <div card-footer>
              <ui-button variant="ghost" size="sm">Cancelar</ui-button>
              <ui-button variant="primary" size="sm">Aceptar</ui-button>
            </div>
          </ui-card>

          <ui-card variant="outlined">
            <span card-header>Outlined Card</span>
            <p>Card con borde. Ideal para listas y contenido secundario.</p>
            <div card-footer>
              <ui-button variant="secondary" size="sm">Ver más</ui-button>
            </div>
          </ui-card>

          <ui-card variant="flat">
            <span card-header>Flat Card</span>
            <p>Card sin sombra ni borde. Útil para fondos con color.</p>
          </ui-card>

          <ui-card variant="elevated" [clickable]="true">
            <span card-header>Clickable Card ✨</span>
            <p>Esta card tiene efecto hover. Pasa el mouse para ver la animación.</p>
          </ui-card>
        </div>
      </section>

      <!-- AVATARS SECTION -->
      <section class="section">
        <h2>Avatars</h2>

        <div class="subsection">
          <h3>Tamaños</h3>
          <div class="component-row align-center">
            <ui-avatar name="Ana López" size="xs" />
            <ui-avatar name="Ana López" size="sm" />
            <ui-avatar name="Ana López" size="md" />
            <ui-avatar name="Ana López" size="lg" />
            <ui-avatar name="Ana López" size="xl" />
          </div>
        </div>

        <div class="subsection">
          <h3>Con Estado</h3>
          <div class="component-row align-center">
            <div class="avatar-group">
              <ui-avatar name="Carlos García" size="lg" status="online" />
              <span>Online</span>
            </div>
            <div class="avatar-group">
              <ui-avatar name="María Rodríguez" size="lg" status="away" />
              <span>Away</span>
            </div>
            <div class="avatar-group">
              <ui-avatar name="Pedro Sánchez" size="lg" status="busy" />
              <span>Busy</span>
            </div>
            <div class="avatar-group">
              <ui-avatar name="Laura Martínez" size="lg" status="offline" />
              <span>Offline</span>
            </div>
          </div>
        </div>

        <div class="subsection">
          <h3>Iniciales Automáticas</h3>
          <div class="component-row align-center">
            <ui-avatar name="John" size="lg" />
            <ui-avatar name="María García" size="lg" />
            <ui-avatar name="Juan Carlos López" size="lg" />
            <ui-avatar name="" size="lg" />
          </div>
        </div>
      </section>

      <!-- BADGES SECTION -->
      <section class="section">
        <h2>Badges</h2>

        <div class="component-row">
          <ui-badge variant="default">Default</ui-badge>
          <ui-badge variant="success">Success</ui-badge>
          <ui-badge variant="warning">Warning</ui-badge>
          <ui-badge variant="danger">Danger</ui-badge>
          <ui-badge variant="info">Info</ui-badge>
        </div>

        <div class="subsection">
          <h3>Ejemplos de Uso</h3>
          <div class="component-row">
            <ui-badge variant="success">✓ Activo</ui-badge>
            <ui-badge variant="danger">✗ Eliminado</ui-badge>
            <ui-badge variant="warning">⏳ Pendiente</ui-badge>
            <ui-badge variant="info">🆕 Nuevo</ui-badge>
            <ui-badge variant="default">v2.0.0</ui-badge>
          </div>
        </div>
      </section>

      <!-- SPINNERS SECTION -->
      <section class="section">
        <h2>Spinners</h2>

        <div class="component-row align-center">
          <div class="spinner-demo">
            <ui-spinner size="sm" />
            <span>Small</span>
          </div>
          <div class="spinner-demo">
            <ui-spinner size="md" />
            <span>Medium</span>
          </div>
          <div class="spinner-demo">
            <ui-spinner size="lg" />
            <span>Large</span>
          </div>
        </div>

        <div class="subsection">
          <h3>Con Color</h3>
          <div class="component-row align-center colored-spinners">
            <div class="spinner-demo" style="color: #3b82f6">
              <ui-spinner size="lg" />
              <span>Primary</span>
            </div>
            <div class="spinner-demo" style="color: #22c55e">
              <ui-spinner size="lg" />
              <span>Success</span>
            </div>
            <div class="spinner-demo" style="color: #ef4444">
              <ui-spinner size="lg" />
              <span>Danger</span>
            </div>
          </div>
        </div>
      </section>

      <!-- SKELETONS SECTION -->
      <section class="section">
        <h2>Skeletons</h2>

        <div class="subsection">
          <h3>Formas Básicas</h3>
          <div class="skeleton-demo">
            <ui-skeleton variant="rect" width="100%" height="100px" />
            <ui-skeleton variant="circle" width="60px" height="60px" />
            <ui-skeleton variant="text" width="80%" />
            <ui-skeleton variant="text" width="60%" />
          </div>
        </div>

        <div class="subsection">
          <h3>Ejemplo: Card Skeleton</h3>
          <ui-card variant="outlined">
            <div class="skeleton-card">
              <ui-skeleton variant="circle" width="56px" height="56px" />
              <div class="skeleton-content">
                <ui-skeleton variant="text" width="70%" height="1.25rem" />
                <ui-skeleton variant="text" width="50%" height="0.875rem" />
                <ui-skeleton variant="text" width="90%" height="0.875rem" />
              </div>
            </div>
          </ui-card>
        </div>

        <div class="subsection">
          <h3>Ejemplo: Lista Skeleton</h3>
          <div class="skeleton-list">
            @for (i of [1, 2, 3]; track i) {
              <div class="skeleton-list-item">
                <ui-skeleton variant="circle" width="40px" height="40px" />
                <div class="skeleton-list-content">
                  <ui-skeleton variant="text" width="60%" height="1rem" />
                  <ui-skeleton variant="text" width="40%" height="0.75rem" />
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- COMBINED EXAMPLES -->
      <section class="section">
        <h2>Ejemplos Combinados</h2>

        <div class="cards-grid">
          <ui-card variant="elevated">
            <span card-header>Perfil de Usuario</span>
            <div class="user-profile">
              <ui-avatar name="María García" size="xl" status="online" />
              <div class="user-info">
                <h4>María García</h4>
                <p>Desarrolladora Frontend</p>
                <div class="user-badges">
                  <ui-badge variant="success">Pro</ui-badge>
                  <ui-badge variant="info">Angular</ui-badge>
                </div>
              </div>
            </div>
            <div card-footer>
              <ui-button variant="ghost" size="sm">Mensaje</ui-button>
              <ui-button variant="primary" size="sm">Seguir</ui-button>
            </div>
          </ui-card>

          <ui-card variant="elevated">
            <span card-header>Estado del Servidor</span>
            <div class="server-status">
              <div class="status-item">
                <span>API Gateway</span>
                <ui-badge variant="success">Operativo</ui-badge>
              </div>
              <div class="status-item">
                <span>Base de Datos</span>
                <ui-badge variant="success">Operativo</ui-badge>
              </div>
              <div class="status-item">
                <span>Cache</span>
                <ui-badge variant="warning">Degradado</ui-badge>
              </div>
              <div class="status-item">
                <span>CDN</span>
                <ui-badge variant="danger">Offline</ui-badge>
              </div>
            </div>
          </ui-card>
        </div>
      </section>
    </div>
  `,
  styles: `
    .showcase {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .showcase-header {
      text-align: center;
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--ui-color-border, #e5e7eb);

      h1 {
        // margin-bottom: 1rem;
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 1rem 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        // -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      p {
        color: var(--ui-color-text-secondary, #6b7280);
        margin: 0;
        font-size: 1.125rem;
      }
    }

    .section {
      margin-bottom: 3rem;
      padding: 2rem;
      background: var(--ui-color-surface, #ffffff);
      border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ui-color-text, #1f2937);
      }
    }

    .subsection {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px dashed var(--ui-color-border, #e5e7eb);

      h3 {
        margin: 0 0 1rem 0;
        font-size: 0.875rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--ui-color-text-secondary, #6b7280);
      }
    }

    .component-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      &.align-center {
        align-items: center;
      }
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .avatar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;

      span {
        font-size: 0.875rem;
        color: var(--ui-color-text-secondary, #6b7280);
      }
    }

    .spinner-demo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;

      span {
        font-size: 0.875rem;
        color: var(--ui-color-text-secondary, #6b7280);
      }
    }

    .skeleton-demo {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      background: var(--ui-color-surface-variant, #f9fafb);
      border-radius: 0.5rem;
    }

    .skeleton-card {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .skeleton-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .skeleton-list-item {
      display: flex;
      gap: 1rem;
      align-items: center;
      padding: 0.75rem;
      background: var(--ui-color-surface-variant, #f9fafb);
      border-radius: 0.5rem;
    }

    .skeleton-list-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .user-profile {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .user-info {
      h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1.125rem;
        font-weight: 600;
      }

      p {
        margin: 0 0 0.75rem 0;
        color: var(--ui-color-text-secondary, #6b7280);
        font-size: 0.875rem;
      }
    }

    .user-badges {
      display: flex;
      gap: 0.5rem;
    }

    .server-status {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--ui-color-border, #e5e7eb);

      &:last-child {
        border-bottom: none;
      }

      span:first-child {
        font-weight: 500;
      }
    }

    .colored-spinners {
      background: var(--ui-color-surface-variant, #f9fafb);
      padding: 1rem;
      border-radius: 0.5rem;
    }
  `,
})
export class UiShowcasePage {
  protected isLoading = signal(false);

  protected simulateLoading(): void {
    this.isLoading.set(true);
    setTimeout(() => this.isLoading.set(false), 2000);
  }
}
