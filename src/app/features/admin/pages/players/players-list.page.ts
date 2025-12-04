import { ChangeDetectionStrategy, Component, signal, inject, effect, OnInit } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PlayerService } from '../../../../core/services/player.service';
import { TeamService } from '../../../../core/services/team.service';
import { ChampionshipService } from '../../../../core/services/championship.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Player } from '../../../../core/models/player.model';
import { Team } from '../../../../core/models/team.model';
import { Championship } from '../../../../core/models/championship.model';
import { getSportConfig } from '../../../../core/models/sport-config.model';

interface DisplayPlayer {
  id: string;
  fullName: string;
  number: number;
  position: string;
  team: string;
  teamId: string;
  status: 'active' | 'injured' | 'suspended' | 'inactive';
}

@Component({
  selector: 'app-players-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
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

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-grid">
          <mat-form-field appearance="outline">
            <mat-label>Campeonato</mat-label>
            <mat-select [(ngModel)]="selectedChampionshipId" (selectionChange)="filterPlayers()">
              <mat-option value="">Todos</mat-option>
              @for (champ of championships(); track champ.id) {
                <mat-option [value]="champ.id">{{ champ.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Equipo</mat-label>
            <mat-select [(ngModel)]="selectedTeamId" (selectionChange)="filterPlayers()">
              <mat-option value="">Todos</mat-option>
              @for (team of filteredTeams(); track team.id) {
                <mat-option [value]="team.id">{{ team.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Buscar</mat-label>
            <input
              matInput
              [(ngModel)]="searchTerm"
              (ngModelChange)="filterPlayers()"
              placeholder="Nombre o número"
            />
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
        </div>
      </div>

      @if (isLoading()) {
        <div class="content-card">
          <p class="text-secondary py-8 text-center">Cargando jugadores...</p>
        </div>
      } @else {
        <div class="content-card">
          @if (displayPlayers().length > 0) {
            <table mat-table [dataSource]="displayPlayers()" class="w-full">
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
                  <mat-chip [class]="'status-' + (player.status || 'active')">
                    {{ getStatusLabel(player.status || 'active') }}
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
                    <button mat-menu-item class="text-red-500" (click)="deletePlayer(player.id)">
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
              <mat-icon class="empty-state-icon">person_off</mat-icon>
              <!-- <mat-icon >person_off</mat-icon> -->
              <h3>No hay jugadores</h3>
              <p>Crea tu primer jugador para comenzar</p>
              <button matButton="filled" routerLink="/admin/players/new">
                <mat-icon>add</mat-icon>
                Crear Jugador
              </button>
            </div>
          }
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
    .filters-card {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .content-card {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      overflow: hidden;
    }

    .empty-state-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--mat-sys-outline);
      margin-bottom: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
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
export default class PlayersListPage implements OnInit {
  displayedColumns = ['number', 'name', 'position', 'team', 'status', 'actions'];

  private playerService = inject(PlayerService);
  private teamService = inject(TeamService);
  private championshipService = inject(ChampionshipService);
  private authService = inject(AuthService);
  private router = inject(Router);

  allPlayers = signal<Player[]>([]);
  allTeams = signal<Team[]>([]);
  championships = signal<Championship[]>([]);
  displayPlayers = signal<DisplayPlayer[]>([]);
  isLoading = signal(false);

  selectedChampionshipId = '';
  selectedTeamId = '';
  searchTerm = '';

  // Cache for position labels by championship
  private positionLabelCache = new Map<string, Map<string, string>>();

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user?.organizationId) {
        this.loadData(user.organizationId);
      }
    });
  }

  ngOnInit(): void {
    // Reload data when navigating to this route (exact match or with query params)
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd &&
            (event.urlAfterRedirects === '/admin/players' ||
              event.urlAfterRedirects.startsWith('/admin/players?')),
        ),
      )
      .subscribe(() => {
        const user = this.authService.currentUser();
        if (user?.organizationId) {
          this.loadData(user.organizationId);
        }
      });
  }

  filteredTeams = signal<Team[]>([]);

  private loadData(organizationId: string): void {
    this.isLoading.set(true);
    forkJoin({
      players: this.playerService.getPlayersByOrganization(organizationId),
      teams: this.teamService.getTeamsByOrganization(organizationId),
      championships: this.championshipService.getChampionships(organizationId),
    }).subscribe({
      next: ({ players, teams, championships }) => {
        this.allPlayers.set(players);
        this.allTeams.set(teams);
        this.championships.set(championships.filter((c) => c.status === 'active'));
        this.filterPlayers();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading data', error);
        this.isLoading.set(false);
      },
    });
  }

  filterPlayers(): void {
    let filtered = this.allPlayers();

    // Filter by championship
    if (this.selectedChampionshipId) {
      filtered = filtered.filter((p) => p.championshipId === this.selectedChampionshipId);
    }

    // Filter by team
    if (this.selectedTeamId) {
      filtered = filtered.filter((p) => p.teamId === this.selectedTeamId);
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((p) => {
        const fullName = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim();
        return (
          fullName.toLowerCase().includes(term) ||
          p.number.toString().includes(term) ||
          p.position.toLowerCase().includes(term)
        );
      });
    }

    // Update filtered teams based on championship
    if (this.selectedChampionshipId) {
      this.filteredTeams.set(
        this.allTeams().filter((t) => t.championshipId === this.selectedChampionshipId),
      );
    } else {
      this.filteredTeams.set(this.allTeams());
    }

    // Transform to display format
    const display: DisplayPlayer[] = filtered.map((player) => {
      const team = this.allTeams().find((t) => t.id === player.teamId);
      const championship = this.championships().find(
        (c: Championship) => c.id === player.championshipId,
      );

      // Calculate fullName if not present (for newly created players)
      const fullName =
        player.fullName ||
        `${player.firstName || ''} ${player.lastName || ''}`.trim() ||
        'Sin nombre';

      // Get position label from code
      const positionLabel = this.getPositionLabel(
        player.position,
        championship?.sport || 'football',
      );

      return {
        id: player.id,
        fullName,
        number: player.number,
        position: positionLabel,
        team: team?.name || 'Unknown',
        teamId: player.teamId,
        status: (player.status || 'active') as 'active' | 'injured' | 'suspended' | 'inactive',
      };
    });

    this.displayPlayers.set(display);
  }

  private getPositionLabel(positionCode: string, sport: string): string {
    // Check cache first
    if (!this.positionLabelCache.has(sport)) {
      this.positionLabelCache.set(sport, new Map());
    }
    const sportCache = this.positionLabelCache.get(sport)!;

    if (sportCache.has(positionCode)) {
      return sportCache.get(positionCode)!;
    }

    // Get from sport config
    try {
      const sportConfig = getSportConfig(sport as any);
      const position = sportConfig.positions.find((p) => p.code === positionCode);
      const label = position?.label || positionCode;
      sportCache.set(positionCode, label);
      return label;
    } catch {
      // Fallback to code if sport config not found
      return positionCode;
    }
  }

  deletePlayer(playerId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este jugador?')) {
      this.playerService.deletePlayer(playerId).subscribe({
        next: () => {
          const user = this.authService.currentUser();
          if (user?.organizationId) {
            this.loadData(user.organizationId);
          }
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
