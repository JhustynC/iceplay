import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

interface Team {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  primaryColor: string;
  playersCount: number;
  championship: string;
}

@Component({
  selector: 'app-teams-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="page-title">Equipos</h1>
          <p class="page-subtitle">Gestiona los equipos de tus campeonatos</p>
        </div>
        <button matButton="filled" routerLink="/admin/teams/new">
          <mat-icon>add</mat-icon>
          Nuevo Equipo
        </button>
      </header>

      <div class="teams-grid">
        @for (team of teams(); track team.id) {
          <div class="team-card">
            <div class="team-header" [style.background]="team.primaryColor">
              <div class="team-avatar">{{ team.shortName }}</div>
              <button matIconButton [matMenuTriggerFor]="menu" class="menu-btn">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <a mat-menu-item [routerLink]="['/admin/teams', team.id]">
                  <mat-icon>visibility</mat-icon>
                  Ver detalles
                </a>
                <a mat-menu-item [routerLink]="['/admin/teams', team.id, 'edit']">
                  <mat-icon>edit</mat-icon>
                  Editar
                </a>
                <button mat-menu-item class="text-red-500">
                  <mat-icon>delete</mat-icon>
                  Eliminar
                </button>
              </mat-menu>
            </div>
            <div class="team-body">
              <h3 class="team-name">{{ team.name }}</h3>
              <p class="team-championship">{{ team.championship }}</p>
              <div class="team-stats">
                <span>
                  <mat-icon>person</mat-icon>
                  {{ team.playersCount }} jugadores
                </span>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <mat-icon>groups</mat-icon>
            <h3>No hay equipos</h3>
            <p>Crea tu primer equipo para comenzar</p>
            <button matButton="filled" routerLink="/admin/teams/new">
              <mat-icon>add</mat-icon>
              Crear Equipo
            </button>
          </div>
        }
      </div>
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
      flex-wrap: wrap;
      gap: 1rem;
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

    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .team-card {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      overflow: hidden;
    }

    .team-header {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .team-avatar {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.9);
      color: #1f2937;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
    }

    .menu-btn {
      color: white;
    }

    .team-body {
      padding: 1rem 1.5rem 1.5rem;
    }

    .team-name {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .team-championship {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .team-stats {
      margin-top: 1rem;
      display: flex;
      gap: 1rem;

      span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      background: var(--mat-sys-surface-container);
      border-radius: 12px;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--mat-sys-outline);
        margin-bottom: 1rem;
      }

      h3 {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
      }

      p {
        color: var(--mat-sys-on-surface-variant);
        margin: 0 0 1.5rem;
      }
    }
  `,
})
export default class TeamsListPage {
  teams = signal<Team[]>([
    {
      id: '1',
      name: 'FC Barcelona',
      shortName: 'FCB',
      primaryColor: '#a50044',
      playersCount: 25,
      championship: 'Liga Premier 2024',
    },
    {
      id: '2',
      name: 'Real Madrid',
      shortName: 'RMA',
      primaryColor: '#febe10',
      playersCount: 23,
      championship: 'Liga Premier 2024',
    },
    {
      id: '3',
      name: 'Atlético Madrid',
      shortName: 'ATM',
      primaryColor: '#272e61',
      playersCount: 22,
      championship: 'Liga Premier 2024',
    },
    {
      id: '4',
      name: 'Lakers',
      shortName: 'LAL',
      primaryColor: '#552583',
      playersCount: 15,
      championship: 'Copa Baloncesto',
    },
  ]);
}
