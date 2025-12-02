import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

interface Player {
  id: string;
  fullName: string;
  number: number;
  position: string;
  team: string;
  status: 'active' | 'injured' | 'suspended';
}

@Component({
  selector: 'app-players-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="page-title">Jugadores</h1>
          <p class="page-subtitle">Gestiona los jugadores de todos los equipos</p>
        </div>
        <button matButton="filled" routerLink="/admin/players/new">
          <mat-icon>add</mat-icon>
          Nuevo Jugador
        </button>
      </header>

      <div class="content-card">
        <table mat-table [dataSource]="players()" class="w-full">
          <ng-container matColumnDef="number">
            <th mat-header-cell *matHeaderCellDef>#</th>
            <td mat-cell *matCellDef="let player">{{ player.number }}</td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let player">{{ player.fullName }}</td>
          </ng-container>

          <ng-container matColumnDef="position">
            <th mat-header-cell *matHeaderCellDef>Posición</th>
            <td mat-cell *matCellDef="let player">{{ player.position }}</td>
          </ng-container>

          <ng-container matColumnDef="team">
            <th mat-header-cell *matHeaderCellDef>Equipo</th>
            <td mat-cell *matCellDef="let player">{{ player.team }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let player">
              <mat-chip [class]="'status-' + player.status">
                {{ getStatusLabel(player.status) }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let player">
              <button matIconButton [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item><mat-icon>edit</mat-icon>Editar</button>
                <button mat-menu-item class="text-red-500">
                  <mat-icon>delete</mat-icon>Eliminar
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
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
    .content-card {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      overflow: hidden;
    }
    .status-active {
      --mat-chip-label-text-color: #22c55e;
      --mat-chip-elevated-container-color: rgba(34, 197, 94, 0.15);
    }
    .status-injured {
      --mat-chip-label-text-color: #f59e0b;
      --mat-chip-elevated-container-color: rgba(245, 158, 11, 0.15);
    }
    .status-suspended {
      --mat-chip-label-text-color: #ef4444;
      --mat-chip-elevated-container-color: rgba(239, 68, 68, 0.15);
    }
  `,
})
export default class PlayersListPage {
  displayedColumns = ['number', 'name', 'position', 'team', 'status', 'actions'];

  players = signal<Player[]>([
    {
      id: '1',
      fullName: 'Lionel Messi',
      number: 10,
      position: 'Delantero',
      team: 'FC Barcelona',
      status: 'active',
    },
    {
      id: '2',
      fullName: 'Cristiano Ronaldo',
      number: 7,
      position: 'Delantero',
      team: 'Real Madrid',
      status: 'active',
    },
    {
      id: '3',
      fullName: 'Neymar Jr',
      number: 11,
      position: 'Delantero',
      team: 'FC Barcelona',
      status: 'injured',
    },
  ]);

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Activo',
      injured: 'Lesionado',
      suspended: 'Suspendido',
    };
    return labels[status] || status;
  }
}
