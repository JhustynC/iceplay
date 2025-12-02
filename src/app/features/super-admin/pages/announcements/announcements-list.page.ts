import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-announcements-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, MatButtonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="page-title">Anuncios</h1>
          <p class="page-subtitle">Gestiona los anuncios del sistema</p>
        </div>
        <button matButton="filled" routerLink="/super-admin/announcements/new">
          <mat-icon>add</mat-icon>
          Nuevo Anuncio
        </button>
      </header>
      <div class="content-card">
        <p class="text-secondary text-center py-8">Lista de anuncios (en desarrollo)</p>
      </div>
    </div>
  `,
  styles: `
    .page-container { padding: 1.5rem; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; margin: 0; }
    .page-subtitle { color: var(--mat-sys-on-surface-variant); margin: 0.25rem 0 0; }
    .content-card { background: var(--mat-sys-surface-container); border-radius: 12px; padding: 2rem; }
  `,
})
export default class AnnouncementsListPage {}

