import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-standings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1 class="page-title">Tabla de Posiciones</h1>
        <p class="page-subtitle">Vista de clasificación de todos los campeonatos</p>
      </header>
      <div class="content-card">
        <p class="text-secondary text-center py-8">
          Tabla de posiciones (en desarrollo)
        </p>
      </div>
    </div>
  `,
  styles: `
    .page-container { padding: 1.5rem; max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; margin: 0; }
    .page-subtitle { color: var(--mat-sys-on-surface-variant); margin: 0.25rem 0 0; }
    .content-card { background: var(--mat-sys-surface-container); border-radius: 12px; padding: 2rem; }
  `,
})
export default class AdminStandingsPage {}

