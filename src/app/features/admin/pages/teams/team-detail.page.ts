import { ChangeDetectionStrategy, Component, input, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { TeamService } from '../../../../core/services/team.service';
import { PlayerService } from '../../../../core/services/player.service';
import { Team, TeamWithPlayers } from '../../../../core/models/team.model';
import { Player } from '../../../../core/models/player.model';

@Component({
  selector: 'app-team-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatTabsModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="flex items-center gap-3">
          <a matIconButton routerLink="/admin/teams">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <h1 class="page-title">Detalle del Equipo</h1>
        </div>
        <button matButton="filled" [routerLink]="['/admin/teams', id(), 'edit']">
          <mat-icon>edit</mat-icon>
          Editar
        </button>
      </header>

      @if (isLoading()) {
        <div class="content-card">
          <p class="text-secondary py-8 text-center">Cargando...</p>
        </div>
      } @else if (team(); as t) {
        <div class="team-header-card" [style.background]="t.primaryColor">
          <div class="team-header-content">
            <div class="team-logo">
              @if (t.logo) {
                <img [src]="t.logo" [alt]="t.name + ' Logo'" />
              } @else {
                <div class="team-avatar">{{ t.shortName }}</div>
              }
            </div>
            <div class="team-info">
              <h2 class="team-name">{{ t.name }}</h2>
              <p class="team-short-name">{{ t.shortName }}</p>
              @if (t.city) {
                <p class="team-city">
                  <mat-icon>location_on</mat-icon>
                  {{ t.city }}
                </p>
              }
            </div>
          </div>
        </div>

        <mat-tab-group>
          <mat-tab label="Información">
            <div class="tab-content">
              <div class="info-grid">
                <div class="info-card">
                  <h3 class="info-title">Información General</h3>
                  <div class="info-list">
                    <div class="info-item">
                      <span class="info-label">Nombre:</span>
                      <span class="info-value">{{ t.name }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Nombre Corto:</span>
                      <span class="info-value">{{ t.shortName }}</span>
                    </div>
                    @if (t.city) {
                      <div class="info-item">
                        <span class="info-label">Ciudad:</span>
                        <span class="info-value">{{ t.city }}</span>
                      </div>
                    }
                    @if (t.homeVenue) {
                      <div class="info-item">
                        <span class="info-label">Estadio:</span>
                        <span class="info-value">{{ t.homeVenue }}</span>
                      </div>
                    }
                    @if (t.foundedYear) {
                      <div class="info-item">
                        <span class="info-label">Año de Fundación:</span>
                        <span class="info-value">{{ t.foundedYear }}</span>
                      </div>
                    }
                  </div>
                </div>

                @if (t.managerName || t.managerPhone || t.managerEmail) {
                  <div class="info-card">
                    <h3 class="info-title">Entrenador</h3>
                    <div class="info-list">
                      @if (t.managerName) {
                        <div class="info-item">
                          <span class="info-label">Nombre:</span>
                          <span class="info-value">{{ t.managerName }}</span>
                        </div>
                      }
                      @if (t.managerPhone) {
                        <div class="info-item">
                          <span class="info-label">Teléfono:</span>
                          <span class="info-value">{{ t.managerPhone }}</span>
                        </div>
                      }
                      @if (t.managerEmail) {
                        <div class="info-item">
                          <span class="info-label">Email:</span>
                          <span class="info-value">{{ t.managerEmail }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Jugadores">
            <div class="tab-content">
              @if (players().length > 0) {
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

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Estado</th>
                    <td mat-cell *matCellDef="let player">
                      <mat-chip [class]="'status-' + (player.status || 'active')">
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
                        <button mat-menu-item [routerLink]="['/admin/players', player.id, 'edit']">
                          <mat-icon>edit</mat-icon>
                          Editar
                        </button>
                        <button
                          mat-menu-item
                          class="text-red-500"
                          (click)="deletePlayer(player.id)"
                        >
                          <mat-icon>delete</mat-icon>
                          Eliminar
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
                </table>
              } @else {
                <div class="empty-state">
                  <mat-icon>person_off</mat-icon>
                  <h3>No hay jugadores</h3>
                  <p>Agrega jugadores a este equipo</p>
                  <button
                    matButton="filled"
                    [routerLink]="['/admin/players/new']"
                    [queryParams]="{ teamId: id() }"
                  >
                    <mat-icon>add</mat-icon>
                    Agregar Jugador
                  </button>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      } @else {
        <div class="content-card">
          <p class="text-secondary py-8 text-center">Equipo no encontrado</p>
        </div>
      }
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
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }
    .content-card {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      padding: 2rem;
    }
    .team-header-card {
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 1.5rem;
      color: white;
    }
    .team-header-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .team-logo img {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.9);
    }
    .team-avatar {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.9);
      color: #1f2937;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.5rem;
    }
    .team-name {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
    }
    .team-short-name {
      font-size: 1rem;
      opacity: 0.9;
      margin: 0.25rem 0;
    }
    .team-city {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.5rem 0 0;
      opacity: 0.9;
    }
    .tab-content {
      padding: 1.5rem 0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .info-card {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      padding: 1.5rem;
    }
    .info-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 1rem;
      color: var(--mat-sys-primary);
    }
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }
    .info-label {
      font-weight: 500;
      color: var(--mat-sys-on-surface-variant);
    }
    .info-value {
      text-align: right;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
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
export default class TeamDetailPage {
  id = input.required<string>();

  private teamService = inject(TeamService);
  private playerService = inject(PlayerService);

  team = signal<Team | null>(null);
  players = signal<Player[]>([]);
  isLoading = signal(false);
  displayedColumns = ['number', 'name', 'position', 'status', 'actions'];

  constructor() {
    effect(() => {
      const teamId = this.id();
      if (teamId) {
        this.loadTeam(teamId);
      }
    });
  }

  private loadTeam(id: string): void {
    this.isLoading.set(true);
    this.teamService.getTeamWithPlayers(id).subscribe({
      next: (teamWithPlayers) => {
        this.team.set(teamWithPlayers);
        this.players.set(teamWithPlayers.players);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading team', error);
        this.isLoading.set(false);
      },
    });
  }

  deletePlayer(playerId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este jugador?')) {
      this.playerService.deletePlayer(playerId).subscribe({
        next: () => {
          // Reload team
          this.loadTeam(this.id());
        },
        error: (error) => {
          console.error('Error deleting player', error);
          alert('Error al eliminar el jugador');
        },
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Activo',
      injured: 'Lesionado',
      suspended: 'Suspendido',
      inactive: 'Inactivo',
    };
    return labels[status] || status;
  }
}
