import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { forkJoin } from 'rxjs';
import { ChampionshipService } from '../../../../core/services/championship.service';
import { TeamService } from '../../../../core/services/team.service';
import { MatchService } from '../../../../core/services/match.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Championship } from '../../../../core/models/championship.model';
import { Team } from '../../../../core/models/team.model';
import { Match, CreateMatchDto } from '../../../../core/models/match.model';

interface GeneratedMatch {
  round: number;
  matchday: number;
  homeTeamId: string;
  awayTeamId: string;
  scheduledDate: Date;
  scheduledTime: string;
  venue?: string;
}

interface Round {
  roundNumber: number;
  matches: GeneratedMatch[];
  date: Date;
}

@Component({
  selector: 'app-fixture-generator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatCheckboxModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="flex items-center gap-3">
          <a matIconButton routerLink="/admin/fixtures">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <h1 class="page-title">Generar Fixture</h1>
        </div>
      </header>

      <mat-tab-group>
        <mat-tab label="Configuración">
          <div class="tab-content">
            <form [formGroup]="configForm" class="form-card">
              <div class="form-section">
                <h2 class="section-title">Seleccionar Campeonato</h2>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Campeonato</mat-label>
                  <mat-select formControlName="championshipId" (selectionChange)="onChampionshipChange()">
                    @for (champ of championships(); track champ.id) {
                      <mat-option [value]="champ.id">{{ champ.name }}</mat-option>
                    }
                  </mat-select>
                  @if (configForm.controls.championshipId.hasError('required')) {
                    <mat-error>Selecciona un campeonato</mat-error>
                  }
                </mat-form-field>
              </div>

              @if (configForm.controls.championshipId.value) {
                <div class="form-section">
                  <h2 class="section-title">Seleccionar Equipos</h2>
                  <div class="teams-selection">
                    <div class="teams-header">
                      <button matButton="outlined" type="button" (click)="selectAllTeams()">
                        Seleccionar Todos
                      </button>
                      <button matButton="outlined" type="button" (click)="deselectAllTeams()">
                        Deseleccionar Todos
                      </button>
                      <span class="teams-count">{{ selectedTeamsCount() }} equipos seleccionados</span>
                    </div>
                    <div class="teams-grid">
                      @for (team of availableTeams(); track team.id) {
                        <div class="team-checkbox">
                          <mat-checkbox
                            [checked]="isTeamSelected(team.id)"
                            (change)="toggleTeam(team.id, $event.checked)"
                          >
                            <div class="team-info">
                              <span class="team-name">{{ team.name }}</span>
                              <span class="team-short">{{ team.shortName }}</span>
                            </div>
                          </mat-checkbox>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div class="form-section">
                  <h2 class="section-title">Configuración del Fixture</h2>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Fecha de Inicio</mat-label>
                      <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
                      <mat-datepicker-toggle matSuffix [for]="startPicker" />
                      <mat-datepicker #startPicker />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Días entre Rondas</mat-label>
                      <input matInput type="number" formControlName="daysBetweenRounds" min="1" max="14" />
                      <mat-hint>Días de descanso entre cada jornada</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Hora de Inicio</mat-label>
                      <input matInput type="time" formControlName="startTime" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Partidos por Día</mat-label>
                      <input matInput type="number" formControlName="matchesPerDay" min="1" max="10" />
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Formato</mat-label>
                      <mat-select formControlName="format">
                        <mat-option value="single">Una Vuelta (Todos contra todos)</mat-option>
                        <mat-option value="double">Dos Vueltas (Ida y Vuelta)</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>

                <div class="form-actions">
                  <button matButton="outlined" type="button" routerLink="/admin/fixtures">Cancelar</button>
                  <button
                    matButton="filled"
                    type="button"
                    [disabled]="configForm.invalid || selectedTeamsCount() < 2"
                    (click)="generateFixture()"
                  >
                    <mat-icon>auto_fix_high</mat-icon>
                    Generar Fixture Automáticamente
                  </button>
                </div>
              }
            </form>
          </div>
        </mat-tab>

        <mat-tab label="Vista Previa y Edición" [disabled]="generatedRounds().length === 0">
          <div class="tab-content">
            @if (generatedRounds().length > 0) {
              <div class="fixture-preview">
                <div class="preview-header">
                  <h2>Vista Previa del Fixture</h2>
                  <div class="preview-stats">
                    <mat-chip>{{ generatedRounds().length }} Jornadas</mat-chip>
                    <mat-chip>{{ totalMatches() }} Partidos</mat-chip>
                  </div>
                </div>

                @for (round of generatedRounds(); track round.roundNumber) {
                  <mat-card class="round-card">
                    <mat-card-header>
                      <mat-card-title>Jornada {{ round.roundNumber }}</mat-card-title>
                      <mat-card-subtitle>{{ formatDate(round.date) }}</mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <table mat-table [dataSource]="round.matches" class="matches-table">
                        <ng-container matColumnDef="matchday">
                          <th mat-header-cell *matHeaderCellDef>#</th>
                          <td mat-cell *matCellDef="let match">{{ match.matchday }}</td>
                        </ng-container>

                        <ng-container matColumnDef="homeTeam">
                          <th mat-header-cell *matHeaderCellDef>Equipo Local</th>
                          <td mat-cell *matCellDef="let match">
                            {{ getTeamName(match.homeTeamId) }}
                          </td>
                        </ng-container>

                        <ng-container matColumnDef="awayTeam">
                          <th mat-header-cell *matHeaderCellDef>Equipo Visitante</th>
                          <td mat-cell *matCellDef="let match">
                            {{ getTeamName(match.awayTeamId) }}
                          </td>
                        </ng-container>

                        <ng-container matColumnDef="time">
                          <th mat-header-cell *matHeaderCellDef>Hora</th>
                          <td mat-cell *matCellDef="let match">
                            <input
                              type="time"
                              [value]="match.scheduledTime"
                              (change)="updateMatchTime(round.roundNumber, match.matchday, $any($event.target).value)"
                              class="time-input"
                            />
                          </td>
                        </ng-container>

                        <ng-container matColumnDef="date">
                          <th mat-header-cell *matHeaderCellDef>Fecha</th>
                          <td mat-cell *matCellDef="let match">
                            <input
                              type="date"
                              [value]="formatDateForInput(match.scheduledDate)"
                              (change)="updateMatchDate(round.roundNumber, match.matchday, $any($event.target).value)"
                              class="date-input"
                            />
                          </td>
                        </ng-container>

                        <ng-container matColumnDef="venue">
                          <th mat-header-cell *matHeaderCellDef>Lugar</th>
                          <td mat-cell *matCellDef="let match">
                            <input
                              type="text"
                              [value]="match.venue || ''"
                              (change)="updateMatchVenue(round.roundNumber, match.matchday, $any($event.target).value)"
                              placeholder="Estadio..."
                              class="venue-input"
                            />
                          </td>
                        </ng-container>

                        <ng-container matColumnDef="actions">
                          <th mat-header-cell *matHeaderCellDef></th>
                          <td mat-cell *matCellDef="let match">
                            <button matIconButton (click)="deleteMatch(round.roundNumber, match.matchday)">
                              <mat-icon>delete</mat-icon>
                            </button>
                          </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
                      </table>
                    </mat-card-content>
                  </mat-card>
                }

                <div class="form-actions">
                  <button matButton="outlined" type="button" (click)="clearFixture()">Limpiar</button>
                  <button matButton="filled" type="button" [disabled]="isSaving()" (click)="saveFixture()">
                    <mat-icon>save</mat-icon>
                    Guardar Fixture
                  </button>
                </div>
              </div>
            } @else {
              <div class="empty-state">
                <mat-icon>calendar_month</mat-icon>
                <h3>No hay fixture generado</h3>
                <p>Configura y genera un fixture en la pestaña de Configuración</p>
              </div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
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
    .tab-content {
      padding: 1.5rem 0;
    }
    .form-card {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      padding: 1.5rem;
    }
    .form-section {
      margin-bottom: 2rem;
      &:last-of-type {
        margin-bottom: 0;
      }
    }
    .section-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 1rem;
      color: var(--mat-sys-primary);
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .teams-selection {
      margin-top: 1rem;
    }
    .teams-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .teams-count {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
    }
    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.75rem;
    }
    .team-checkbox {
      padding: 0.5rem;
      border-radius: 8px;
      background: var(--mat-sys-surface-container-high);
    }
    .team-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .team-name {
      font-weight: 500;
    }
    .team-short {
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--mat-sys-outline-variant);
      margin-top: 1.5rem;
    }
    .fixture-preview {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      h2 {
        margin: 0;
        font-size: 1.25rem;
      }
    }
    .preview-stats {
      display: flex;
      gap: 0.5rem;
    }
    .round-card {
      margin-bottom: 1rem;
    }
    .matches-table {
      width: 100%;
      .time-input,
      .date-input,
      .venue-input {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 4px;
        padding: 0.5rem;
        font-size: 0.875rem;
        width: 100%;
        background: var(--mat-sys-surface);
      }
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
  `,
})
export default class FixtureGeneratorPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private championshipService = inject(ChampionshipService);
  private teamService = inject(TeamService);
  private matchService = inject(MatchService);
  private authService = inject(AuthService);

  championships = signal<Championship[]>([]);
  availableTeams = signal<Team[]>([]);
  selectedTeamIds = signal<Set<string>>(new Set());
  generatedRounds = signal<Round[]>([]);
  isSaving = signal(false);

  displayedColumns = ['matchday', 'homeTeam', 'awayTeam', 'date', 'time', 'venue', 'actions'];

  configForm = this.fb.nonNullable.group({
    championshipId: ['', Validators.required],
    startDate: [new Date(), Validators.required],
    daysBetweenRounds: [7, [Validators.required, Validators.min(1), Validators.max(14)]],
    startTime: ['15:00', Validators.required],
    matchesPerDay: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
    format: ['single', Validators.required],
  });

  selectedTeamsCount = signal(0);
  totalMatches = signal(0);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user?.organizationId) {
        this.loadChampionships(user.organizationId);
      }
    });

    // Update total matches when rounds change
    effect(() => {
      const total = this.generatedRounds().reduce((sum, round) => sum + round.matches.length, 0);
      this.totalMatches.set(total);
    });
  }

  private loadChampionships(organizationId: string): void {
    this.championshipService.getChampionships(organizationId).subscribe({
      next: (championships) => {
        this.championships.set(championships.filter((c) => c.status === 'active' || c.status === 'registration'));
      },
      error: (error) => {
        console.error('Error loading championships', error);
      },
    });
  }

  onChampionshipChange(): void {
    const championshipId = this.configForm.controls.championshipId.value;
    if (championshipId) {
      this.teamService.getTeams(championshipId).subscribe({
        next: (teams) => {
          this.availableTeams.set(teams.filter((t) => t.isActive));
          this.selectedTeamIds.set(new Set());
          this.selectedTeamsCount.set(0);
        },
        error: (error) => {
          console.error('Error loading teams', error);
        },
      });
    }
  }

  isTeamSelected(teamId: string): boolean {
    return this.selectedTeamIds().has(teamId);
  }

  toggleTeam(teamId: string, selected: boolean): void {
    const current = new Set(this.selectedTeamIds());
    if (selected) {
      current.add(teamId);
    } else {
      current.delete(teamId);
    }
    this.selectedTeamIds.set(current);
    this.selectedTeamsCount.set(current.size);
  }

  selectAllTeams(): void {
    const allIds = new Set(this.availableTeams().map((t) => t.id));
    this.selectedTeamIds.set(allIds);
    this.selectedTeamsCount.set(allIds.size);
  }

  deselectAllTeams(): void {
    this.selectedTeamIds.set(new Set());
    this.selectedTeamsCount.set(0);
  }

  generateFixture(): void {
    const selectedTeams = this.availableTeams().filter((t) => this.selectedTeamIds().has(t.id));
    if (selectedTeams.length < 2) {
      alert('Selecciona al menos 2 equipos');
      return;
    }

    const config = this.configForm.getRawValue();
    const rounds = this.generateRoundRobin(selectedTeams, config.format === 'double');
    const roundsWithDates = this.assignDates(rounds, config.startDate, config.daysBetweenRounds, config.startTime, config.matchesPerDay);

    this.generatedRounds.set(roundsWithDates);
  }

  /**
   * Generate round-robin fixture
   */
  private generateRoundRobin(teams: Team[], doubleRound: boolean): GeneratedMatch[][] {
    const teamIds = teams.map((t) => t.id);
    const numTeams = teamIds.length;
    const rounds: GeneratedMatch[][] = [];

    // If odd number of teams, add a "bye" team
    const isOdd = numTeams % 2 === 1;
    const teamsToUse = isOdd ? [...teamIds, 'BYE'] : teamIds;
    const numRounds = teamsToUse.length - 1;

    for (let round = 0; round < numRounds; round++) {
      const matches: GeneratedMatch[] = [];
      for (let i = 0; i < teamsToUse.length / 2; i++) {
        const home = teamsToUse[i];
        const away = teamsToUse[teamsToUse.length - 1 - i];

        // Skip matches with BYE
        if (home !== 'BYE' && away !== 'BYE') {
          matches.push({
            round: round + 1,
            matchday: matches.length + 1,
            homeTeamId: home,
            awayTeamId: away,
            scheduledDate: new Date(), // Will be assigned later
            scheduledTime: '15:00',
          });
        }
      }

      if (matches.length > 0) {
        rounds.push(matches);
      }

      // Rotate teams (except first team)
      const last = teamsToUse.pop();
      if (last) {
        teamsToUse.splice(1, 0, last);
      }
    }

    // If double round, reverse home/away for second half
    if (doubleRound) {
      const secondHalf: GeneratedMatch[][] = rounds.map((round, roundIdx) =>
        round.map((match, matchIdx) => ({
          ...match,
          round: rounds.length + roundIdx + 1,
          homeTeamId: match.awayTeamId,
          awayTeamId: match.homeTeamId,
        }))
      );
      rounds.push(...secondHalf);
    }

    return rounds;
  }

  /**
   * Assign dates and times to rounds
   */
  private assignDates(
    rounds: GeneratedMatch[][],
    startDate: Date,
    daysBetweenRounds: number,
    startTime: string,
    matchesPerDay: number
  ): Round[] {
    const roundsWithDates: Round[] = [];
    let currentDate = new Date(startDate);

    rounds.forEach((roundMatches, roundIdx) => {
      const roundDate = new Date(currentDate);
      roundDate.setDate(currentDate.getDate() + roundIdx * daysBetweenRounds);

      // Distribute matches across days if needed
      const matchesWithDates: GeneratedMatch[] = [];
      let dayOffset = 0;

      roundMatches.forEach((match, matchIdx) => {
        const matchDate = new Date(roundDate);
        matchDate.setDate(roundDate.getDate() + dayOffset);

        // Calculate time offset based on matches per day
        const timeSlot = matchIdx % matchesPerDay;
        const [hours, minutes] = startTime.split(':').map(Number);
        const matchTime = new Date(matchDate);
        matchTime.setHours(hours + timeSlot, minutes);

        matchesWithDates.push({
          ...match,
          scheduledDate: matchDate,
          scheduledTime: this.formatTime(matchTime),
        });

        // Move to next day if we've reached matches per day
        if ((matchIdx + 1) % matchesPerDay === 0) {
          dayOffset++;
        }
      });

      roundsWithDates.push({
        roundNumber: roundIdx + 1,
        matches: matchesWithDates,
        date: roundDate,
      });
    });

    return roundsWithDates;
  }

  updateMatchTime(roundNumber: number, matchday: number, time: string): void {
    const rounds = [...this.generatedRounds()];
    const round = rounds.find((r) => r.roundNumber === roundNumber);
    if (round) {
      const match = round.matches.find((m) => m.matchday === matchday);
      if (match) {
        match.scheduledTime = time;
        this.generatedRounds.set(rounds);
      }
    }
  }

  updateMatchDate(roundNumber: number, matchday: number, dateStr: string): void {
    const rounds = [...this.generatedRounds()];
    const round = rounds.find((r) => r.roundNumber === roundNumber);
    if (round) {
      const match = round.matches.find((m) => m.matchday === matchday);
      if (match) {
        match.scheduledDate = new Date(dateStr);
        this.generatedRounds.set(rounds);
      }
    }
  }

  updateMatchVenue(roundNumber: number, matchday: number, venue: string): void {
    const rounds = [...this.generatedRounds()];
    const round = rounds.find((r) => r.roundNumber === roundNumber);
    if (round) {
      const match = round.matches.find((m) => m.matchday === matchday);
      if (match) {
        match.venue = venue;
        this.generatedRounds.set(rounds);
      }
    }
  }

  deleteMatch(roundNumber: number, matchday: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este partido?')) {
      const rounds = [...this.generatedRounds()];
      const round = rounds.find((r) => r.roundNumber === roundNumber);
      if (round) {
        round.matches = round.matches.filter((m) => m.matchday !== matchday);
        // Renumber matchdays
        round.matches.forEach((m, idx) => {
          m.matchday = idx + 1;
        });
        this.generatedRounds.set(rounds);
      }
    }
  }

  clearFixture(): void {
    if (confirm('¿Estás seguro de que deseas limpiar el fixture generado?')) {
      this.generatedRounds.set([]);
    }
  }

  saveFixture(): void {
    const championshipId = this.configForm.controls.championshipId.value;
    const user = this.authService.currentUser();
    if (!championshipId || !user?.organizationId) {
      alert('Error: No se pudo obtener la información necesaria');
      return;
    }

    this.isSaving.set(true);
    const allMatches = this.generatedRounds().flatMap((round) => round.matches);

    // Create matches in batches
    const createObservables = allMatches.map((match) => {
      const matchData = {
        championshipId,
        organizationId: user.organizationId,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        scheduledDate: match.scheduledDate,
        scheduledTime: match.scheduledTime,
        round: match.round,
        matchday: match.matchday,
        venue: match.venue,
        homeScore: 0,
        awayScore: 0,
        status: 'scheduled' as const,
        currentPeriod: 0,
        elapsedSeconds: 0,
        isClockRunning: false,
        periodScores: [],
        isHighlighted: false,
      };
      return this.matchService.createMatch(matchData);
    });

    // Use forkJoin to create all matches
    forkJoin(createObservables).subscribe({
      next: () => {
        this.isSaving.set(false);
        alert(`Fixture guardado exitosamente. Se crearon ${allMatches.length} partidos.`);
        this.router.navigate(['/admin/fixtures']);
      },
      error: (error) => {
        console.error('Error saving fixture', error);
        alert('Error al guardar el fixture. Algunos partidos pueden no haberse creado.');
        this.isSaving.set(false);
      },
    });
  }

  getTeamName(teamId: string): string {
    return this.availableTeams().find((t) => t.id === teamId)?.name || 'Equipo Desconocido';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

}
