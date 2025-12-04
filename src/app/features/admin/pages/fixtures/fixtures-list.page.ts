import { ChangeDetectionStrategy, Component, signal, inject, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ChampionshipService } from '../../../../core/services/championship.service';
import { MatchService } from '../../../../core/services/match.service';
import { TeamService } from '../../../../core/services/team.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Championship } from '../../../../core/models/championship.model';
import { Match } from '../../../../core/models/match.model';
import { Team } from '../../../../core/models/team.model';
import { forkJoin } from 'rxjs';

interface RoundMatchesGroup {
  roundNumber: number;
  matches: Match[];
  date: Date;
}

@Component({
  selector: 'app-fixtures-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatTableModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="page-title">Fixture</h1>
          <p class="page-subtitle">Calendario de partidos</p>
        </div>
        <button matButton="filled" routerLink="/admin/fixtures/generate">
          <mat-icon>auto_fix_high</mat-icon>
          Generar Fixture
        </button>
      </header>

      <!-- Filter -->
      <div class="filters-card">
        <mat-form-field appearance="outline">
          <mat-label>Campeonato</mat-label>
          <mat-select [(ngModel)]="selectedChampionshipId" (selectionChange)="loadFixtures()">
            <mat-option value="">Todos</mat-option>
            @for (champ of championships(); track champ.id) {
              <mat-option [value]="champ.id">{{ champ.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      @if (isLoading()) {
        <div class="content-card">
          <p class="text-secondary py-8 text-center">Cargando fixture...</p>
        </div>
      } @else if (rounds().length > 0) {
        <div class="fixtures-list">
          @for (round of rounds(); track round.roundNumber) {
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <div class="round-header">
                    <span class="round-number">Jornada {{ round.roundNumber }}</span>
                    <span class="round-date">{{ formatDate(round.date) }}</span>
                  </div>
                </mat-panel-title>
                <mat-panel-description>
                  <mat-chip>{{ round.matches.length }} partidos</mat-chip>
                </mat-panel-description>
              </mat-expansion-panel-header>

              <table mat-table [dataSource]="round.matches" class="matches-table">
                <ng-container matColumnDef="matchday">
                  <th mat-header-cell *matHeaderCellDef>#</th>
                  <td mat-cell *matCellDef="let match">{{ match.matchday }}</td>
                </ng-container>

                <ng-container matColumnDef="homeTeam">
                  <th mat-header-cell *matHeaderCellDef>Equipo Local</th>
                  <td mat-cell *matCellDef="let match">
                    <div class="team-cell">
                      <img
                        [src]="getTeamLogo(match.homeTeamId)"
                        [alt]="getTeamName(match.homeTeamId)"
                        class="team-logo"
                        onerror="this.style.display='none'"
                      />
                      <span>{{ getTeamName(match.homeTeamId) }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="awayTeam">
                  <th mat-header-cell *matHeaderCellDef>Equipo Visitante</th>
                  <td mat-cell *matCellDef="let match">
                    <div class="team-cell">
                      <img
                        [src]="getTeamLogo(match.awayTeamId)"
                        [alt]="getTeamName(match.awayTeamId)"
                        class="team-logo"
                        onerror="this.style.display='none'"
                      />
                      <span>{{ getTeamName(match.awayTeamId) }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Fecha y Hora</th>
                  <td mat-cell *matCellDef="let match">
                    <div class="date-cell">
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
                    <button
                      matIconButton
                      [routerLink]="['/admin/match', match.id, 'control']"
                      [disabled]="match.status !== 'scheduled' && match.status !== 'live'"
                    >
                      <mat-icon>sports_soccer</mat-icon>
                    </button>
                    <button matIconButton [routerLink]="['/match', match.id]">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            </mat-expansion-panel>
          }
        </div>
      } @else {
        <div class="empty-state">
          <mat-icon class="empty-state-icon">calendar_month</mat-icon>
          <h3>No hay fixture disponible</h3>
          <p>Genera un fixture para comenzar</p>
          <button matButton="filled" routerLink="/admin/fixtures/generate">
            <mat-icon>auto_fix_high</mat-icon>
            Generar Fixture
          </button>
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
    .content-card {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      padding: 2rem;
    }
    .fixtures-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .round-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .round-number {
      font-weight: 600;
    }
    .round-date {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
    }
    .matches-table {
      width: 100%;
    }
    .team-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .team-logo {
      width: 24px;
      height: 24px;
      border-radius: 4px;
    }
    .date-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .time {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
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
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      h3 {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
      }
      p {
        color: var(--mat-sys-on-surface-variant);
        margin: 0 0 1.5rem;
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
  `,
})
export default class FixturesListPage {
  displayedColumns = ['matchday', 'homeTeam', 'awayTeam', 'date', 'venue', 'status', 'actions'];

  private championshipService = inject(ChampionshipService);
  private matchService = inject(MatchService);
  private teamService = inject(TeamService);
  private authService = inject(AuthService);

  championships = signal<Championship[]>([]);
  allMatches = signal<Match[]>([]);
  allTeams = signal<Team[]>([]);
  rounds = signal<RoundMatchesGroup[]>([]);
  isLoading = signal(false);

  selectedChampionshipId = '';

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user?.organizationId) {
        this.loadChampionships(user.organizationId);
      }
    });
  }

  private loadChampionships(organizationId: string): void {
    this.championshipService.getChampionships(organizationId).subscribe({
      next: (championships) => {
        this.championships.set(championships);
        if (championships.length > 0 && !this.selectedChampionshipId) {
          this.selectedChampionshipId = championships[0].id;
          this.loadFixtures();
        }
      },
      error: (error) => {
        console.error('Error loading championships', error);
      },
    });
  }

  loadFixtures(): void {
    if (!this.selectedChampionshipId) {
      this.rounds.set([]);
      return;
    }

    this.isLoading.set(true);
    forkJoin({
      matches: this.matchService.getMatches(this.selectedChampionshipId),
      teams: this.teamService.getTeams(this.selectedChampionshipId),
    }).subscribe({
      next: ({ matches, teams }) => {
        this.allMatches.set(matches);
        this.allTeams.set(teams);

        // Group matches by round
        const roundsMap = new Map<number, Match[]>();
        matches.forEach((match) => {
          if (!roundsMap.has(match.round)) {
            roundsMap.set(match.round, []);
          }
          roundsMap.get(match.round)?.push(match);
        });

        const roundsArray: RoundMatchesGroup[] = Array.from(roundsMap.entries())
          .map(([roundNumber, matches]) => {
            // Get the earliest date for this round
            const dates = matches.map((m) => m.scheduledDate.getTime());
            const earliestDate = new Date(Math.min(...dates));

            return {
              roundNumber,
              matches: matches.sort((a, b) => a.matchday - b.matchday),
              date: earliestDate,
            };
          })
          .sort((a, b) => a.roundNumber - b.roundNumber);

        this.rounds.set(roundsArray);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading fixtures', error);
        this.isLoading.set(false);
      },
    });
  }

  getTeamName(teamId: string): string {
    return this.allTeams().find((t) => t.id === teamId)?.name || 'Equipo Desconocido';
  }

  getTeamLogo(teamId: string): string {
    return this.allTeams().find((t) => t.id === teamId)?.logo || '';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
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
