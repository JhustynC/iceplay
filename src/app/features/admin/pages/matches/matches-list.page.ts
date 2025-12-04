import { ChangeDetectionStrategy, Component, signal, inject, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatchService } from '../../../../core/services/match.service';
import { ChampionshipService } from '../../../../core/services/championship.service';
import { TeamService } from '../../../../core/services/team.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Match, MatchStatus } from '../../../../core/models/match.model';
import { Championship } from '../../../../core/models/championship.model';
import { Team } from '../../../../core/models/team.model';
import { forkJoin } from 'rxjs';

interface DisplayMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  scheduledDate: Date;
  scheduledTime: string;
  venue: string;
  status: MatchStatus;
  championship: string;
}

@Component({
  selector: 'app-admin-matches-list',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="page-title">Partidos</h1>
          <p class="page-subtitle">Gestiona todos los partidos</p>
        </div>
      </header>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-grid">
          <mat-form-field appearance="outline">
            <mat-label>Campeonato</mat-label>
            <mat-select [(ngModel)]="selectedChampionshipId" (selectionChange)="filterMatches()">
              <mat-option value="">Todos</mat-option>
              @for (champ of championships(); track champ.id) {
                <mat-option [value]="champ.id">{{ champ.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (selectionChange)="filterMatches()">
              <mat-option value="">Todos</mat-option>
              <mat-option value="scheduled">Programados</mat-option>
              <mat-option value="live">En Vivo</mat-option>
              <mat-option value="finished">Finalizados</mat-option>
              <mat-option value="cancelled">Cancelados</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha</mat-label>
            <input
              matInput
              [matDatepicker]="datePicker"
              [(ngModel)]="selectedDate"
              (dateChange)="filterMatches()"
            />
            <mat-datepicker-toggle matSuffix [for]="datePicker" />
            <mat-datepicker #datePicker />
          </mat-form-field>
        </div>
      </div>

      @if (isLoading()) {
        <div class="content-card">
          <p class="text-secondary py-8 text-center">Cargando partidos...</p>
        </div>
      } @else {
        <div class="content-card">
          @if (displayMatches().length > 0) {
            <table mat-table [dataSource]="displayMatches()" class="w-full">
              <ng-container matColumnDef="championship">
                <th mat-header-cell *matHeaderCellDef>Campeonato</th>
                <td mat-cell *matCellDef="let match">{{ match.championship }}</td>
              </ng-container>

              <ng-container matColumnDef="teams">
                <th mat-header-cell *matHeaderCellDef>Partido</th>
                <td mat-cell *matCellDef="let match">
                  <div class="match-info">
                    <div class="team-info">
                      <span class="team-name">{{ match.homeTeam }}</span>
                      @if (match.status === 'live' || match.status === 'finished') {
                        <span class="score">{{ match.homeScore }}</span>
                      }
                    </div>
                    <span class="vs">vs</span>
                    <div class="team-info">
                      @if (match.status === 'live' || match.status === 'finished') {
                        <span class="score">{{ match.awayScore }}</span>
                      }
                      <span class="team-name">{{ match.awayTeam }}</span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Fecha y Hora</th>
                <td mat-cell *matCellDef="let match">
                  <div class="date-info">
                    <span>{{ formatDate(match.scheduledDate) }}</span>
                    <span class="time">{{ match.scheduledTime }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="venue">
                <th mat-header-cell *matHeaderCellDef>Lugar</th>
                <td mat-cell *matCellDef="let match">{{ match.venue || 'N/A' }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let match">
                  <mat-chip [class]="'status-' + match.status">
                    {{ getStatusLabel(match.status) }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let match">
                  <button matIconButton [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    @if (match.status === 'scheduled' || match.status === 'live') {
                      <button mat-menu-item [routerLink]="['/admin/match', match.id, 'control']">
                        <mat-icon>sports_soccer</mat-icon>
                        Control de Partido
                      </button>
                    }
                    <button mat-menu-item [routerLink]="['/match', match.id]">
                      <mat-icon>visibility</mat-icon>
                      Ver Detalles
                    </button>
                    @if (match.status === 'scheduled') {
                      <button mat-menu-item class="text-red-500" (click)="cancelMatch(match.id)">
                        <mat-icon>cancel</mat-icon>
                        Cancelar
                      </button>
                    }
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          } @else {
            <div class="empty-state">
              <mat-icon>sports_soccer</mat-icon>
              <h3>No hay partidos</h3>
              <p>No se encontraron partidos con los filtros seleccionados</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .page-container {
      padding: 1.5rem;
      max-width: 1400px;
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
    .match-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .team-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .team-name {
      font-weight: 500;
    }
    .score {
      font-weight: 700;
      font-size: 1.125rem;
      color: var(--mat-sys-primary);
    }
    .vs {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
    }
    .date-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .time {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
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
        margin: 0;
      }
    }
    .status-scheduled {
      --mat-chip-label-text-color: #3b82f6;
      --mat-chip-elevated-container-color: rgba(59, 130, 246, 0.15);
    }
    .status-live {
      --mat-chip-label-text-color: #22c55e;
      --mat-chip-elevated-container-color: rgba(34, 197, 94, 0.15);
    }
    .status-finished {
      --mat-chip-label-text-color: #6b7280;
      --mat-chip-elevated-container-color: rgba(107, 114, 128, 0.15);
    }
    .status-cancelled {
      --mat-chip-label-text-color: #ef4444;
      --mat-chip-elevated-container-color: rgba(239, 68, 68, 0.15);
    }
  `,
})
export default class AdminMatchesListPage {
  displayedColumns = ['championship', 'teams', 'date', 'venue', 'status', 'actions'];

  private matchService = inject(MatchService);
  private championshipService = inject(ChampionshipService);
  private teamService = inject(TeamService);
  private authService = inject(AuthService);

  allMatches = signal<Match[]>([]);
  allTeams = signal<Team[]>([]);
  championships = signal<Championship[]>([]);
  displayMatches = signal<DisplayMatch[]>([]);
  isLoading = signal(false);

  selectedChampionshipId = '';
  selectedStatus = '';
  selectedDate: Date | null = null;

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user?.organizationId) {
        this.loadData(user.organizationId);
      }
    });
  }

  private loadData(organizationId: string): void {
    this.isLoading.set(true);
    forkJoin({
      championships: this.championshipService.getChampionships(organizationId),
    }).subscribe({
      next: ({ championships }) => {
        this.championships.set(championships);
        // Load matches for all championships
        const matchObservables = championships.map((champ) =>
          this.matchService.getMatches(champ.id),
        );
        if (matchObservables.length > 0) {
          forkJoin(matchObservables).subscribe({
            next: (results) => {
              const allMatches = results.flat();
              this.allMatches.set(allMatches);
              // Load teams
              const teamObservables = championships.map((champ) =>
                this.teamService.getTeams(champ.id),
              );
              forkJoin(teamObservables).subscribe({
                next: (teamResults) => {
                  const allTeams = teamResults.flat();
                  this.allTeams.set(allTeams);
                  this.filterMatches();
                  this.isLoading.set(false);
                },
                error: (error) => {
                  console.error('Error loading teams', error);
                  this.isLoading.set(false);
                },
              });
            },
            error: (error) => {
              console.error('Error loading matches', error);
              this.isLoading.set(false);
            },
          });
        } else {
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading data', error);
        this.isLoading.set(false);
      },
    });
  }

  filterMatches(): void {
    let filtered = this.allMatches();

    // Filter by championship
    if (this.selectedChampionshipId) {
      filtered = filtered.filter((m) => m.championshipId === this.selectedChampionshipId);
    }

    // Filter by status
    if (this.selectedStatus) {
      filtered = filtered.filter((m) => m.status === this.selectedStatus);
    }

    // Filter by date
    if (this.selectedDate) {
      const selectedDateStr = this.selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter((m) => {
        const matchDateStr = m.scheduledDate.toISOString().split('T')[0];
        return matchDateStr === selectedDateStr;
      });
    }

    // Transform to display format
    const display: DisplayMatch[] = filtered.map((match) => {
      const homeTeam = this.allTeams().find((t) => t.id === match.homeTeamId);
      const awayTeam = this.allTeams().find((t) => t.id === match.awayTeamId);
      const championship = this.championships().find((c) => c.id === match.championshipId);

      return {
        id: match.id,
        homeTeam: homeTeam?.name || 'Unknown',
        awayTeam: awayTeam?.name || 'Unknown',
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        scheduledDate: match.scheduledDate,
        scheduledTime: match.scheduledTime || '00:00',
        venue: match.venue || '',
        status: match.status,
        championship: championship?.name || 'Unknown',
      };
    });

    // Sort by date and time
    display.sort((a, b) => {
      const dateA = new Date(a.scheduledDate).getTime();
      const dateB = new Date(b.scheduledDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    this.displayMatches.set(display);
  }

  cancelMatch(matchId: string): void {
    if (confirm('¿Estás seguro de que deseas cancelar este partido?')) {
      this.matchService.updateMatch(matchId, { status: 'cancelled' }).subscribe({
        next: () => {
          const user = this.authService.currentUser();
          if (user?.organizationId) {
            this.loadData(user.organizationId);
          }
        },
        error: (error) => {
          console.error('Error cancelling match', error);
          alert('Error al cancelar el partido');
        },
      });
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  getStatusLabel(status: MatchStatus): string {
    const labels: Record<MatchStatus, string> = {
      scheduled: 'Programado',
      warmup: 'Calentamiento',
      live: 'En Vivo',
      halftime: 'Medio Tiempo',
      break: 'Descanso',
      overtime: 'Tiempo Extra',
      penalties: 'Penales',
      finished: 'Finalizado',
      suspended: 'Suspendido',
      postponed: 'Aplazado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  }
}
