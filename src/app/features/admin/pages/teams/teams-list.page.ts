import { ChangeDetectionStrategy, Component, signal, inject, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { forkJoin } from 'rxjs';
import { TeamService } from '../../../../core/services/team.service';
import { ChampionshipService } from '../../../../core/services/championship.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Team } from '../../../../core/models/team.model';
import { Championship } from '../../../../core/models/championship.model';

interface DisplayTeam {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  primaryColor: string;
  playersCount: number;
  championship: string;
  championshipId: string;
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

      @if (isLoading()) {
        <div class="empty-state">
          <mat-icon class="animate-spin">refresh</mat-icon>
          <h3>Cargando equipos...</h3>
        </div>
      } @else {
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
                  <button mat-menu-item class="text-red-500" (click)="deleteTeam(team.id)">
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
  private teamService = inject(TeamService);
  private championshipService = inject(ChampionshipService);
  private authService = inject(AuthService);

  teams = signal<DisplayTeam[]>([]);
  isLoading = signal(false);
  private championshipsMap = new Map<string, Championship>();

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user?.organizationId) {
        this.loadTeams(user.organizationId);
      }
    });
  }

  private loadTeams(organizationId: string): void {
    this.isLoading.set(true);
    forkJoin({
      teams: this.teamService.getTeamsByOrganization(organizationId),
      championships: this.championshipService.getChampionships(organizationId),
    }).subscribe({
      next: ({ teams, championships }) => {
        // Create championships map for quick lookup
        championships.forEach((c) => this.championshipsMap.set(c.id, c));

        // Transform teams to display format
        const displayTeams: DisplayTeam[] = teams.map((team) => {
          const championship = this.championshipsMap.get(team.championshipId);
          return {
            id: team.id,
            name: team.name,
            shortName: team.shortName,
            logo: team.logo,
            primaryColor: team.primaryColor,
            playersCount: team.playersCount,
            championship: championship?.name || 'Unknown',
            championshipId: team.championshipId,
          };
        });

        this.teams.set(displayTeams);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading teams', error);
        this.isLoading.set(false);
      },
    });
  }

  deleteTeam(teamId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
      this.teamService.deleteTeam(teamId).subscribe({
        next: () => {
          // Reload teams
          const user = this.authService.currentUser();
          if (user?.organizationId) {
            this.loadTeams(user.organizationId);
          }
        },
        error: (error) => {
          console.error('Error deleting team', error);
          alert('Error al eliminar el equipo');
        },
      });
    }
  }
}
