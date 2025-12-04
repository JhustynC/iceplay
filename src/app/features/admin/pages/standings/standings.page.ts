import { ChangeDetectionStrategy, Component, signal, inject, effect, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { ChampionshipService } from '../../../../core/services/championship.service';
import { MatchService } from '../../../../core/services/match.service';
import { TeamService } from '../../../../core/services/team.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Championship } from '../../../../core/models/championship.model';
import { Match } from '../../../../core/models/match.model';
import { Team } from '../../../../core/models/team.model';
import { Standing, MatchResult } from '../../../../core/models/standing.model';
import { forkJoin } from 'rxjs';

interface TeamStanding {
  team: Team;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: MatchResult[];
}

@Component({
  selector: 'app-admin-standings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="page-title">Tabla de Posiciones</h1>
          <p class="page-subtitle">Vista de clasificación de todos los campeonatos</p>
        </div>
      </header>

      <!-- Filter -->
      <div class="filters-card">
        <mat-form-field appearance="outline">
          <mat-label>Campeonato</mat-label>
          <mat-select [(ngModel)]="selectedChampionshipId" (selectionChange)="loadStandings()">
            @for (champ of championships(); track champ.id) {
              <mat-option [value]="champ.id">{{ champ.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      @if (isLoading()) {
        <div class="content-card">
          <p class="text-secondary text-center py-8">Calculando posiciones...</p>
        </div>
      } @else if (standings().length > 0) {
        <div class="standings-card">
          <div class="standings-header">
            <h2>{{ getChampionshipName() }}</h2>
            <div class="standings-info">
              <span>Jornada {{ currentRound() }}</span>
            </div>
          </div>

          <table mat-table [dataSource]="standings()" class="standings-table">
            <ng-container matColumnDef="position">
              <th mat-header-cell *matHeaderCellDef>Pos</th>
              <td mat-cell *matCellDef="let standing; let i = index">
                <div class="position-cell">
                  <span class="position-number">{{ standing.position }}</span>
                  @if (standing.position < i + 1) {
                    <mat-icon class="position-up">arrow_upward</mat-icon>
                  } @else if (standing.position > i + 1) {
                    <mat-icon class="position-down">arrow_downward</mat-icon>
                  }
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="team">
              <th mat-header-cell *matHeaderCellDef>Equipo</th>
              <td mat-cell *matCellDef="let standing">
                <div class="team-cell">
                  @if (standing.team.logo) {
                    <img [src]="standing.team.logo" [alt]="standing.team.name" class="team-logo" />
                  } @else {
                    <div class="team-avatar">{{ standing.team.shortName }}</div>
                  }
                  <span class="team-name">{{ standing.team.name }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="played">
              <th mat-header-cell *matHeaderCellDef>PJ</th>
              <td mat-cell *matCellDef="let standing">{{ standing.played }}</td>
            </ng-container>

            <ng-container matColumnDef="won">
              <th mat-header-cell *matHeaderCellDef>G</th>
              <td mat-cell *matCellDef="let standing">{{ standing.won }}</td>
            </ng-container>

            <ng-container matColumnDef="drawn">
              <th mat-header-cell *matHeaderCellDef>E</th>
              <td mat-cell *matCellDef="let standing">{{ standing.drawn }}</td>
            </ng-container>

            <ng-container matColumnDef="lost">
              <th mat-header-cell *matHeaderCellDef>P</th>
              <td mat-cell *matCellDef="let standing">{{ standing.lost }}</td>
            </ng-container>

            <ng-container matColumnDef="goals">
              <th mat-header-cell *matHeaderCellDef>GF / GC</th>
              <td mat-cell *matCellDef="let standing">
                {{ standing.goalsFor }} / {{ standing.goalsAgainst }}
              </td>
            </ng-container>

            <ng-container matColumnDef="goalDifference">
              <th mat-header-cell *matHeaderCellDef>DG</th>
              <td mat-cell *matCellDef="let standing" [class.positive]="standing.goalDifference > 0" [class.negative]="standing.goalDifference < 0">
                {{ standing.goalDifference > 0 ? '+' : '' }}{{ standing.goalDifference }}
              </td>
            </ng-container>

            <ng-container matColumnDef="points">
              <th mat-header-cell *matHeaderCellDef>Pts</th>
              <td mat-cell *matCellDef="let standing">
                <span class="points-badge">{{ standing.points }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="form">
              <th mat-header-cell *matHeaderCellDef>Forma</th>
              <td mat-cell *matCellDef="let standing">
                <div class="form-indicators">
                  @for (result of standing.form; track $index) {
                    <span class="form-indicator" [class]="'form-' + result.toLowerCase()">
                      {{ result }}
                    </span>
                  }
                  @if (standing.form.length === 0) {
                    <span class="form-indicator form-none">-</span>
                  }
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns" [class.highlighted]="row.position <= 3"></tr>
          </table>
        </div>
      } @else {
        <div class="empty-state">
          <mat-icon>leaderboard</mat-icon>
          <h3>No hay datos de clasificación</h3>
          <p>Selecciona un campeonato con partidos jugados</p>
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
    .standings-card {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      overflow: hidden;
    }
    .standings-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      display: flex;
      justify-content: space-between;
      align-items: center;
      h2 {
        margin: 0;
        font-size: 1.25rem;
      }
    }
    .standings-info {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
    }
    .standings-table {
      width: 100%;
    }
    .position-cell {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .position-number {
      font-weight: 600;
      min-width: 24px;
    }
    .position-up {
      color: #22c55e;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .position-down {
      color: #ef4444;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .team-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .team-logo {
      width: 32px;
      height: 32px;
      border-radius: 6px;
    }
    .team-avatar {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: var(--mat-sys-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.75rem;
    }
    .team-name {
      font-weight: 500;
    }
    .points-badge {
      font-weight: 700;
      font-size: 1.125rem;
      color: var(--mat-sys-primary);
    }
    .positive {
      color: #22c55e;
    }
    .negative {
      color: #ef4444;
    }
    .form-indicators {
      display: flex;
      gap: 0.25rem;
    }
    .form-indicator {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      &.form-w {
        background: rgba(34, 197, 94, 0.15);
        color: #22c55e;
      }
      &.form-d {
        background: rgba(107, 114, 128, 0.15);
        color: #6b7280;
      }
      &.form-l {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }
      &.form-none {
        background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface-variant);
      }
    }
    .highlighted {
      background: color-mix(in srgb, var(--mat-sys-primary) 5%, transparent);
    }
    .empty-state {
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
        margin: 0;
      }
    }
  `,
})
export default class AdminStandingsPage {
  displayedColumns = ['position', 'team', 'played', 'won', 'drawn', 'lost', 'goals', 'goalDifference', 'points', 'form'];

  private championshipService = inject(ChampionshipService);
  private matchService = inject(MatchService);
  private teamService = inject(TeamService);
  private authService = inject(AuthService);

  championships = signal<Championship[]>([]);
  standings = signal<TeamStanding[]>([]);
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

  currentRound = computed(() => {
    // This would ideally come from matches, but for now return 1
    return 1;
  });

  private loadChampionships(organizationId: string): void {
    this.championshipService.getChampionships(organizationId).subscribe({
      next: (championships) => {
        this.championships.set(championships);
        if (championships.length > 0 && !this.selectedChampionshipId) {
          this.selectedChampionshipId = championships[0].id;
          this.loadStandings();
        }
      },
      error: (error) => {
        console.error('Error loading championships', error);
      },
    });
  }

  loadStandings(): void {
    if (!this.selectedChampionshipId) {
      this.standings.set([]);
      return;
    }

    this.isLoading.set(true);
    forkJoin({
      matches: this.matchService.getMatches(this.selectedChampionshipId),
      teams: this.teamService.getTeams(this.selectedChampionshipId),
      championship: this.championshipService.getChampionshipById(this.selectedChampionshipId),
    }).subscribe({
      next: ({ matches, teams, championship }) => {
        // Calculate standings from matches
        const standingsMap = new Map<string, TeamStanding>();

        // Initialize all teams
        teams.forEach((team) => {
          standingsMap.set(team.id, {
            team,
            position: 0,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            form: [],
          });
        });

        // Process finished matches
        const finishedMatches = matches.filter((m) => m.status === 'finished');
        finishedMatches.forEach((match) => {
          const homeStanding = standingsMap.get(match.homeTeamId);
          const awayStanding = standingsMap.get(match.awayTeamId);

          if (homeStanding && awayStanding) {
            // Update home team
            homeStanding.played++;
            homeStanding.goalsFor += match.homeScore;
            homeStanding.goalsAgainst += match.awayScore;
            homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;

            // Update away team
            awayStanding.played++;
            awayStanding.goalsFor += match.awayScore;
            awayStanding.goalsAgainst += match.homeScore;
            awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;

            // Determine result
            if (match.homeScore > match.awayScore) {
              homeStanding.won++;
              awayStanding.lost++;
              homeStanding.points += championship.settings.pointsForWin;
              awayStanding.points += championship.settings.pointsForLoss;
              homeStanding.form.unshift('W');
              awayStanding.form.unshift('L');
            } else if (match.homeScore < match.awayScore) {
              homeStanding.lost++;
              awayStanding.won++;
              homeStanding.points += championship.settings.pointsForLoss;
              awayStanding.points += championship.settings.pointsForWin;
              homeStanding.form.unshift('L');
              awayStanding.form.unshift('W');
            } else {
              homeStanding.drawn++;
              awayStanding.drawn++;
              homeStanding.points += championship.settings.pointsForDraw;
              awayStanding.points += championship.settings.pointsForDraw;
              homeStanding.form.unshift('D');
              awayStanding.form.unshift('D');
            }

            // Keep only last 5 results
            if (homeStanding.form.length > 5) homeStanding.form = homeStanding.form.slice(0, 5);
            if (awayStanding.form.length > 5) awayStanding.form = awayStanding.form.slice(0, 5);
          }
        });

        // Sort standings
        const standingsArray = Array.from(standingsMap.values()).sort((a, b) => {
          // Sort by points (descending)
          if (b.points !== a.points) return b.points - a.points;
          // Then by goal difference (descending)
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          // Then by goals for (descending)
          if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
          // Finally by team name
          return a.team.name.localeCompare(b.team.name);
        });

        // Assign positions
        standingsArray.forEach((standing, index) => {
          standing.position = index + 1;
        });

        this.standings.set(standingsArray);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading standings', error);
        this.isLoading.set(false);
      },
    });
  }

  getChampionshipName(): string {
    return this.championships().find((c) => c.id === this.selectedChampionshipId)?.name || 'Campeonato';
  }
}
