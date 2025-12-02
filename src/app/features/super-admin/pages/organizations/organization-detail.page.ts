import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-organization-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, MatButtonModule, MatTabsModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="flex items-center gap-3">
          <a matIconButton routerLink="/super-admin/organizations">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <h1 class="page-title">Detalle de Organización</h1>
        </div>
        <button matButton="outlined">
          <mat-icon>edit</mat-icon>
          Editar
        </button>
      </header>

      <mat-tab-group>
        <mat-tab label="Información">
          <div class="tab-content">
            <p class="text-secondary">Información de la organización ID: {{ id() }}</p>
          </div>
        </mat-tab>
        <mat-tab label="Administradores">
          <div class="tab-content">
            <p class="text-secondary">Lista de administradores...</p>
          </div>
        </mat-tab>
        <mat-tab label="Campeonatos">
          <div class="tab-content">
            <p class="text-secondary">Campeonatos de esta organización...</p>
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
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }
    .tab-content {
      padding: 1.5rem;
      background: var(--mat-sys-surface-container);
      border-radius: 0 0 12px 12px;
      min-height: 200px;
    }
  `,
})
export default class OrganizationDetailPage {
  id = input.required<string>();
}
