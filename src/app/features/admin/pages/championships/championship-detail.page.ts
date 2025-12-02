import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-championship-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, MatButtonModule, MatTabsModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="flex items-center gap-3">
          <a matIconButton routerLink="/admin/championships">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <div>
            <h1 class="page-title">Liga Premier 2024</h1>
            <p class="page-subtitle">Campeonato ID: {{ id() }}</p>
          </div>
        </div>
        <button matButton="outlined">
          <mat-icon>edit</mat-icon>
          Editar
        </button>
      </header>

      <mat-tab-group>
        <mat-tab label="Resumen">
          <div class="tab-content">
            <p class="text-secondary">Información general del campeonato...</p>
          </div>
        </mat-tab>
        <mat-tab label="Equipos">
          <div class="tab-content">
            <p class="text-secondary">Lista de equipos participantes...</p>
          </div>
        </mat-tab>
        <mat-tab label="Fixture">
          <div class="tab-content">
            <p class="text-secondary">Calendario de partidos...</p>
          </div>
        </mat-tab>
        <mat-tab label="Tabla">
          <div class="tab-content">
            <p class="text-secondary">Tabla de posiciones...</p>
          </div>
        </mat-tab>
        <mat-tab label="Estadísticas">
          <div class="tab-content">
            <p class="text-secondary">Estadísticas del campeonato...</p>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: `
    .page-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .page-subtitle {
      color: var(--mat-sys-on-surface-variant);
      margin: 0.25rem 0 0;
    }

    .tab-content {
      padding: 1.5rem;
      background: var(--mat-sys-surface-container);
      border-radius: 0 0 12px 12px;
      min-height: 300px;
    }
  `,
})
export default class ChampionshipDetailPage {
  id = input.required<string>();
}
