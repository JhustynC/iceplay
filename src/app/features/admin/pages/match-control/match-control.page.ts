import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
  computed,
  OnDestroy,
  OnInit,
  inject,
  effect,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatchService } from '../../../../core/services/match.service';
import { MatchEventService } from '../../../../core/services/match-event.service';
import { TeamService } from '../../../../core/services/team.service';
import { PlayerService } from '../../../../core/services/player.service';
import { ChampionshipService } from '../../../../core/services/championship.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Match, MatchStatus, UpdateMatchDto, UpdateMatchScoreDto } from '../../../../core/models/match.model';
import { MatchEvent, CreateEventDto, formatEventMinute } from '../../../../core/models/event.model';
import { Team } from '../../../../core/models/team.model';
import { Player, CreatePlayerDto, UpdatePlayerDto } from '../../../../core/models/player.model';
import { Championship } from '../../../../core/models/championship.model';
import { SPORT_CONFIGS, getSportConfig } from '../../../../core/models/sport-config.model';
import { forkJoin, interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

interface HistoryState {
  homeScore: number;
  awayScore: number;
  events: LocalMatchEvent[];
  elapsedSeconds: number;
  currentPeriod: number;
}

interface LocalPlayer {
  id: string;
  number: number;
  name: string;
  position: string;
  teamId: 'home' | 'away';
  originalPlayerId?: string; // ID del jugador original del backend
}

interface LocalTeam {
  id: 'home' | 'away';
  name: string;
  score: number;
  logo: string;
  players: LocalPlayer[];
}

interface LocalMatchEvent {
  id: string;
  time: string;
  type: string;
  player: LocalPlayer;
  team: LocalTeam;
  backendEventId?: string; // ID del evento en el backend
}

@Component({
  selector: 'app-match-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatePipe,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="flex min-h-full flex-col gap-6 p-4 md:p-6">
      <!-- Header with Undo/Redo -->
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-3">
          <a matIconButton routerLink="/admin/matches">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <h1 class="text-xl md:text-2xl font-bold">Control de Partido</h1>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Undo/Redo Buttons -->
          <div class="flex items-center gap-1">
            <button
              matIconButton
              (click)="undo()"
              [disabled]="!canUndo()"
              matTooltip="Deshacer (Ctrl+Z)"
              class="undo-btn"
            >
              <mat-icon>undo</mat-icon>
            </button>
            <button
              matIconButton
              (click)="redo()"
              [disabled]="!canRedo()"
              matTooltip="Rehacer (Ctrl+Y)"
              class="redo-btn"
            >
              <mat-icon>redo</mat-icon>
            </button>
          </div>

          <mat-slide-toggle [(ngModel)]="showAdminPanel" color="primary">
            Modo Admin
          </mat-slide-toggle>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex flex-1 items-center justify-center">
          <mat-spinner [diameter]="50"></mat-spinner>
        </div>
      } @else if (match(); as m) {
        <!-- Quick Actions (Admin) -->
        @if (showAdminPanel) {
          <section>
            <h2 class="mb-4 px-2 text-lg md:text-xl font-bold">Acciones Rápidas</h2>
            <div class="flex flex-wrap gap-3">
              <button matButton="outlined" (click)="updateMatchStatus('live')">
                <mat-icon>play_circle</mat-icon> Iniciar Partido
              </button>
              <button matButton="outlined" (click)="updateMatchStatus('finished')">
                <mat-icon>sports_score</mat-icon> Finalizar Partido
              </button>
              <button matButton="outlined" (click)="updateMatchStatus('cancelled')">
                <mat-icon>cancel</mat-icon> Cancelar Partido
              </button>
              <button matButton="outlined" (click)="updateMatchStatus('postponed')">
                <mat-icon>schedule</mat-icon> Posponer Partido
              </button>
              <button matButton="outlined" (click)="clearAllEvents()">
                <mat-icon>clear_all</mat-icon> Limpiar Eventos
              </button>
            </div>
          </section>
        }

        <!-- Match Info Banner -->
        <div class="card flex flex-wrap items-center justify-between gap-4 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <mat-icon class="text-secondary">event</mat-icon>
            <div>
              <p class="text-secondary text-sm">{{ championship()?.name || 'Campeonato' }}</p>
              <p class="font-medium text-sm md:text-base">
                {{ m.scheduledDate | date: 'fullDate' }} • {{ m.scheduledTime }}
              </p>
              <p class="text-secondary text-sm">{{ m.venue || 'Sin cancha' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="status-chip" [class]="'status-' + m.status">
              {{ getStatusLabel(m.status) }}
            </span>
          </div>
        </div>

        <!-- Admin Panel -->
        @if (showAdminPanel) {
          <mat-accordion>
            <!-- Match Settings -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon class="mr-2">settings</mat-icon>
                  Configuración del Partido
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
                <mat-form-field appearance="outline">
                  <mat-label>Estado del Partido</mat-label>
                  <mat-select [value]="m.status" (selectionChange)="updateMatchStatus($event.value)">
                    <mat-option value="scheduled">Programado</mat-option>
                    <mat-option value="warmup">Calentamiento</mat-option>
                    <mat-option value="live">En Vivo</mat-option>
                    <mat-option value="halftime">Medio Tiempo</mat-option>
                    <mat-option value="break">Descanso</mat-option>
                    <mat-option value="overtime">Tiempo Extra</mat-option>
                    <mat-option value="penalties">Penales</mat-option>
                    <mat-option value="finished">Finalizado</mat-option>
                    <mat-option value="suspended">Suspendido</mat-option>
                    <mat-option value="postponed">Pospuesto</mat-option>
                    <mat-option value="cancelled">Cancelado</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Fecha del Partido</mat-label>
                  <input
                    matInput
                    [matDatepicker]="datePicker"
                    [value]="m.scheduledDate"
                    (dateChange)="updateMatchDate($event.value)"
                  />
                  <mat-datepicker-toggle matIconSuffix [for]="datePicker" />
                  <mat-datepicker #datePicker />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Hora del Partido</mat-label>
                  <input
                    matInput
                    type="time"
                    [value]="m.scheduledTime"
                    (change)="updateMatchTime($any($event.target).value)"
                  />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Cancha</mat-label>
                  <input matInput [value]="m.venue || ''" (change)="updateVenue($any($event.target).value)" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Árbitro Principal</mat-label>
                  <input matInput [value]="m.referee || ''" (change)="updateReferee($any($event.target).value)" />
                </mat-form-field>
              </div>
            </mat-expansion-panel>

            <!-- Home Team Management -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon class="mr-2">groups</mat-icon>
                  {{ homeTeam().name }} (Local)
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="py-4">
                <div class="mb-4 flex flex-wrap gap-4">
                  <mat-form-field appearance="outline" class="min-w-[200px] flex-1">
                    <mat-label>Nombre del Equipo</mat-label>
                    <input matInput [value]="homeTeam().name" (change)="updateTeamName('home', $any($event.target).value)" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-24">
                    <mat-label>Marcador</mat-label>
                    <input
                      matInput
                      type="number"
                      min="0"
                      [value]="homeTeam().score"
                      (change)="updateTeamScore('home', +$any($event.target).value)"
                    />
                  </mat-form-field>
                </div>

                <mat-divider class="my-4!" />

                <div class="mb-4 flex items-center justify-between flex-wrap gap-2">
                  <h4 class="font-semibold">Jugadores ({{ homeTeam().players.length }})</h4>
                  <button matButton="outlined" (click)="addPlayer('home')">
                    <mat-icon>add</mat-icon> Agregar Jugador
                  </button>
                </div>

                <div class="players-grid">
                  @for (player of homeTeam().players; track player.id) {
                    <div class="player-card">
                      <div class="player-card-header">
                        <span class="player-number">#{{ player.number }}</span>
                        <button matIconButton color="warn" (click)="removePlayer('home', player.id)">
                          <mat-icon class="text-lg!">delete</mat-icon>
                        </button>
                      </div>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Nombre</mat-label>
                        <input
                          matInput
                          [value]="player.name"
                          (change)="updatePlayer('home', player.id, 'name', $any($event.target).value)"
                        />
                      </mat-form-field>
                      <div class="flex flex-col gap-2">
                        <mat-form-field appearance="outline" class="w-20">
                          <mat-label>#</mat-label>
                          <input
                            matInput
                            type="number"
                            [value]="player.number"
                            (change)="updatePlayer('home', player.id, 'number', +$any($event.target).value)"
                          />
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="flex-1">
                          <mat-label>Posición</mat-label>
                          <mat-select
                            [value]="player.position"
                            (selectionChange)="updatePlayer('home', player.id, 'position', $event.value)"
                          >
                            @for (position of availablePositions(); track position.code) {
                              <mat-option [value]="position.code">{{ position.label }}</mat-option>
                            }
                          </mat-select>
                        </mat-form-field>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </mat-expansion-panel>

            <!-- Away Team Management -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon class="mr-2">groups</mat-icon>
                  {{ awayTeam().name }} (Visitante)
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="py-4">
                <div class="mb-4 flex flex-wrap gap-4">
                  <mat-form-field appearance="outline" class="min-w-[200px] flex-1">
                    <mat-label>Nombre del Equipo</mat-label>
                    <input matInput [value]="awayTeam().name" (change)="updateTeamName('away', $any($event.target).value)" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-24">
                    <mat-label>Marcador</mat-label>
                    <input
                      matInput
                      type="number"
                      min="0"
                      [value]="awayTeam().score"
                      (change)="updateTeamScore('away', +$any($event.target).value)"
                    />
                  </mat-form-field>
                </div>

                <mat-divider class="my-4!" />

                <div class="mb-4 flex items-center justify-between flex-wrap gap-2">
                  <h4 class="font-semibold">Jugadores ({{ awayTeam().players.length }})</h4>
                  <button matButton="outlined" (click)="addPlayer('away')">
                    <mat-icon>add</mat-icon> Agregar Jugador
                  </button>
                </div>

                <div class="players-grid">
                  @for (player of awayTeam().players; track player.id) {
                    <div class="player-card">
                      <div class="player-card-header">
                        <span class="player-number">#{{ player.number }}</span>
                        <button matIconButton color="warn" (click)="removePlayer('away', player.id)" class="h-8! w-8!">
                          <mat-icon class="text-lg!">close</mat-icon>
                        </button>
                      </div>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Nombre</mat-label>
                        <input
                          matInput
                          [value]="player.name"
                          (change)="updatePlayer('away', player.id, 'name', $any($event.target).value)"
                        />
                      </mat-form-field>
                      <div class="flex flex-col gap-2">
                        <mat-form-field appearance="outline" class="w-20">
                          <mat-label>#</mat-label>
                          <input
                            matInput
                            type="number"
                            [value]="player.number"
                            (change)="updatePlayer('away', player.id, 'number', +$any($event.target).value)"
                          />
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="flex-1">
                          <mat-label>Posición</mat-label>
                          <mat-select
                            [value]="player.position"
                            (selectionChange)="updatePlayer('away', player.id, 'position', $event.value)"
                          >
                            @for (position of availablePositions(); track position.code) {
                              <mat-option [value]="position.code">{{ position.label }}</mat-option>
                            }
                          </mat-select>
                        </mat-form-field>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        }

        <!-- Score Header -->
        <div class="score-header">
          <!-- Home Team Score -->
          <div class="card flex min-w-[140px] flex-1 flex-col items-center gap-3 rounded-xl p-4 sm:flex-row md:p-6">
            @if (homeTeam().logo) {
              <img class="h-14 w-14 sm:h-16 sm:w-16" [alt]="homeTeam().name + ' Logo'" [src]="homeTeam().logo" />
            } @else {
              <div class="team-avatar h-14 w-14 sm:h-16 sm:w-16">
                {{ getTeamInitials(homeTeam().name) }}
              </div>
            }
            <div class="text-center sm:text-left">
              <p class="text-secondary text-sm font-medium">Local</p>
              <p class="text-lg font-bold md:text-xl">{{ homeTeam().name }}</p>
              <p class="text-primary text-3xl font-black md:text-4xl">{{ homeTeam().score }}</p>
            </div>
          </div>

          <!-- Timer -->
          <div class="timer-card rounded-xl p-4">
            @if (m.status === 'live') {
              <div class="flex items-center justify-center gap-2">
                <span class="relative flex h-3 w-3">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                </span>
                <p class="text-primary text-sm font-semibold uppercase">En Vivo</p>
              </div>
            } @else {
              <div class="flex justify-center">
                <span class="status-chip" [class]="'status-' + m.status">
                  {{ getStatusLabel(m.status) }}
                </span>
              </div>
            }
            <!-- Editable Time Display -->
            @if (isEditingTime) {
              <div class="time-edit-container">
                <input
                  type="number"
                  min="0"
                  max="999"
                  class="time-input"
                  [value]="editMinutes"
                  (input)="editMinutes = +$any($event.target).value"
                  (keydown.enter)="saveTime()"
                  (keydown.escape)="cancelTimeEdit()"
                  #minutesInput
                />
                <span class="time-edit-separator">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  class="time-input"
                  [value]="editSeconds"
                  (input)="editSeconds = +$any($event.target).value"
                  (keydown.enter)="saveTime()"
                  (keydown.escape)="cancelTimeEdit()"
                />
                <div class="time-edit-actions">
                  <button matIconButton color="primary" (click)="saveTime()" class="h-8! w-8!">
                    <mat-icon class="text-lg!">check</mat-icon>
                  </button>
                  <button matIconButton (click)="cancelTimeEdit()" class="h-8! w-8!">
                    <mat-icon class="text-lg!">close</mat-icon>
                  </button>
                </div>
              </div>
            } @else {
              <p
                class="time-display my-2 cursor-pointer text-center font-mono text-3xl font-bold md:text-4xl"
                (click)="startTimeEdit()"
                title="Click para editar tiempo"
              >
                {{ formattedTime() }}
              </p>
            }
            @if (m.status === 'live' || m.status === 'scheduled' || m.status === 'warmup') {
              <div class="timer-controls">
                @if (isRunning()) {
                  <button matIconButton (click)="pauseTimer()">
                    <mat-icon>pause</mat-icon>
                  </button>
                } @else {
                  <button matFab="mini" (click)="startTimer()">
                    <mat-icon>play_arrow</mat-icon>
                  </button>
                }
                <button matIconButton (click)="resetTimer()">
                  <mat-icon>restart_alt</mat-icon>
                </button>
              </div>
            }
          </div>

          <!-- Away Team Score -->
          <div class="card flex min-w-[140px] flex-1 flex-col-reverse items-center justify-end gap-3 rounded-xl p-4 sm:flex-row md:p-6">
            <div class="text-center sm:text-right">
              <p class="text-secondary text-sm font-medium">Visitante</p>
              <p class="text-lg font-bold md:text-xl">{{ awayTeam().name }}</p>
              <p class="text-primary text-3xl font-black md:text-4xl">{{ awayTeam().score }}</p>
            </div>
            @if (awayTeam().logo) {
              <img class="h-14 w-14 sm:h-16 sm:w-16" [alt]="awayTeam().name + ' Logo'" [src]="awayTeam().logo" />
            } @else {
              <div class="team-avatar h-14 w-14 sm:h-16 sm:w-16">
                {{ getTeamInitials(awayTeam().name) }}
              </div>
            }
          </div>
        </div>

        <!-- Team Lineups & Actions -->
        @if (m.status === 'live' || m.status === 'warmup') {
          <section>
            <h2 class="mb-4 px-2 text-lg md:text-xl font-bold">Alineaciones y Acciones</h2>
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <!-- Home Team -->
              <div class="card rounded-xl border border-(--mat-sys-outline-variant) p-4">
                <h3 class="mb-3 px-2 text-base md:text-lg font-semibold">{{ homeTeam().name }}</h3>
                <div class="space-y-1">
                  @for (player of homeTeam().players; track player.id) {
                    <div class="player-row grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg p-2">
                      <div>
                        <p class="text-sm md:text-base">#{{ player.number }} {{ player.name }}</p>
                        <p class="text-secondary text-xs">{{ getPositionLabel(player.position) }}</p>
                      </div>
                      <div class="flex flex-wrap items-center gap-1 md:gap-2">
                        @for (eventType of availableEventTypes(); track eventType.code) {
                          <button
                            class="action-btn"
                            [class]="'action-' + eventType.category"
                            (click)="logEvent(eventType.code, player, homeTeam())"
                            [matTooltip]="eventType.label"
                          >
                            {{ eventType.label }}
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Away Team -->
              <div class="card rounded-xl border border-(--mat-sys-outline-variant) p-4">
                <h3 class="mb-3 px-2 text-base md:text-lg font-semibold">{{ awayTeam().name }}</h3>
                <div class="space-y-1">
                  @for (player of awayTeam().players; track player.id) {
                    <div class="player-row grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg p-2">
                      <div>
                        <p class="text-sm md:text-base">#{{ player.number }} {{ player.name }}</p>
                        <p class="text-secondary text-xs">{{ getPositionLabel(player.position) }}</p>
                      </div>
                      <div class="flex flex-wrap items-center gap-1 md:gap-2">
                        @for (eventType of availableEventTypes(); track eventType.code) {
                          <button
                            class="action-btn"
                            [class]="'action-' + eventType.category"
                            (click)="logEvent(eventType.code, player, awayTeam())"
                            [matTooltip]="eventType.label"
                          >
                            {{ eventType.label }}
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </section>
        }

        <!-- Live Event Log -->
        <section>
          <h2 class="mb-4 px-2 text-lg md:text-xl font-bold">Registro de Eventos</h2>
          <div class="card overflow-hidden rounded-xl border border-(--mat-sys-outline-variant)">
            @if (events().length === 0) {
              <div class="text-secondary p-8 text-center">
                <mat-icon class="mb-2 text-5xl! opacity-50">sports_soccer</mat-icon>
                <p>No hay eventos registrados aún. Inicia el partido y registra eventos!</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="table-header">
                      <th class="w-24 px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">Tiempo</th>
                      <th class="w-32 px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">Evento</th>
                      <th class="px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">Jugador</th>
                      <th class="px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">Equipo</th>
                      <th class="w-20 px-4 py-3 text-right text-xs font-medium tracking-wider uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-(--mat-sys-outline-variant)">
                    @for (event of events(); track event.id) {
                      <tr>
                        <td class="text-secondary px-4 py-3 font-mono text-sm whitespace-nowrap">{{ event.time }}</td>
                        <td class="px-4 py-3 whitespace-nowrap">
                          <span
                            class="inline-flex items-center gap-2 text-sm font-semibold"
                            [style.color]="getEventColor(event.type)"
                          >
                            <mat-icon class="text-base!">{{ getEventIcon(event.type) }}</mat-icon>
                            {{ getEventLabel(event.type) }}
                          </span>
                        </td>
                        <td class="px-4 py-3 text-sm whitespace-nowrap">
                          #{{ event.player.number }} {{ event.player.name }}
                        </td>
                        <td class="text-secondary px-4 py-3 text-sm whitespace-nowrap">{{ event.team.name }}</td>
                        <td class="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            matIconButton
                            class="h-8! w-8!"
                            (click)="removeEvent(event.id)"
                            aria-label="Eliminar evento"
                          >
                            <mat-icon class="text-lg! text-red-400">delete</mat-icon>
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </section>
      } @else {
        <div class="flex flex-1 items-center justify-center">
          <p class="text-secondary text-center text-lg">Partido no encontrado.</p>
        </div>
      }
    </div>
  `,
  styles: `
    .card {
      background-color: var(--mat-sys-surface-container);
    }

    .score-header {
      display: flex;
      flex-direction: column;
      gap: 12px;

      @media (min-width: 768px) {
        flex-direction: row;
      }
    }

    .timer-card {
      background-color: color-mix(in srgb, var(--mat-sys-primary) 10%, transparent);

      @media (min-width: 768px) {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }

    .timer-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }

    .time-display {
      cursor: pointer;
      padding: 4px 12px;
      border-radius: 8px;
      transition: background-color 0.2s;

      &:hover {
        background-color: color-mix(in srgb, var(--mat-sys-primary) 15%, transparent);
      }
    }

    .time-edit-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin: 8px 0;
    }

    .time-input {
      width: 60px;
      padding: 8px;
      font-size: 24px;
      font-weight: bold;
      font-family: monospace;
      text-align: center;
      border: 2px solid var(--mat-sys-primary);
      border-radius: 8px;
      background: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface);

      &:focus {
        outline: none;
        border-color: var(--mat-sys-primary);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--mat-sys-primary) 25%, transparent);
      }

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      -moz-appearance: textfield;
    }

    .time-edit-separator {
      font-size: 24px;
      font-weight: bold;
      color: var(--mat-sys-on-surface);
    }

    .time-edit-actions {
      display: flex;
      gap: 4px;
      margin-left: 8px;
    }

    .undo-btn,
    .redo-btn {
      &:not(:disabled) {
        color: var(--mat-sys-primary);
      }

      &:disabled {
        opacity: 0.4;
      }
    }

    .table-header {
      background-color: var(--mat-sys-surface-container-high);
      color: var(--mat-sys-on-surface-variant);
    }

    .player-row:hover {
      background-color: color-mix(in srgb, var(--mat-sys-primary) 8%, transparent);
    }

    .players-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 16px;

      @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .player-card {
      background-color: var(--mat-sys-surface-container);
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: border-color 0.2s, box-shadow 0.2s;

      &:hover {
        border-color: var(--mat-sys-primary);
        box-shadow: 0 2px 8px color-mix(in srgb, var(--mat-sys-primary) 20%, transparent);
      }
    }

    .player-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .player-number {
      font-size: 18px;
      font-weight: bold;
      color: var(--mat-sys-primary);
    }

    .team-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--mat-sys-surface-container-high);
      border-radius: 50%;
      font-weight: bold;
      font-size: 1.25rem;
      color: var(--mat-sys-on-surface);
    }

    .status-chip {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;

      &.status-scheduled {
        background-color: color-mix(in srgb, #3b82f6 20%, transparent);
        color: #60a5fa;
      }

      &.status-warmup {
        background-color: color-mix(in srgb, #f59e0b 20%, transparent);
        color: #fbbf24;
      }

      &.status-live {
        background-color: color-mix(in srgb, #22c55e 20%, transparent);
        color: #4ade80;
      }

      &.status-halftime {
        background-color: color-mix(in srgb, #8b5cf6 20%, transparent);
        color: #a78bfa;
      }

      &.status-break {
        background-color: color-mix(in srgb, #8b5cf6 20%, transparent);
        color: #a78bfa;
      }

      &.status-overtime {
        background-color: color-mix(in srgb, #f59e0b 20%, transparent);
        color: #fbbf24;
      }

      &.status-penalties {
        background-color: color-mix(in srgb, #f59e0b 20%, transparent);
        color: #fbbf24;
      }

      &.status-finished {
        background-color: color-mix(in srgb, #6b7280 20%, transparent);
        color: #9ca3af;
      }

      &.status-suspended {
        background-color: color-mix(in srgb, #ef4444 20%, transparent);
        color: #f87171;
      }

      &.status-postponed {
        background-color: color-mix(in srgb, #8b5cf6 20%, transparent);
        color: #a78bfa;
      }

      &.status-cancelled {
        background-color: color-mix(in srgb, #ef4444 20%, transparent);
        color: #f87171;
      }
    }

    .action-btn {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 6px;
      transition: all 0.15s ease;
      border: none;
      cursor: pointer;

      &.action-scoring {
        background-color: color-mix(in srgb, #22c55e 20%, transparent);
        color: #4ade80;
        &:hover {
          background-color: color-mix(in srgb, #22c55e 30%, transparent);
        }
      }

      &.action-card {
        background-color: color-mix(in srgb, #eab308 20%, transparent);
        color: #facc15;
        &:hover {
          background-color: color-mix(in srgb, #eab308 30%, transparent);
        }
      }

      &.action-substitution {
        background-color: color-mix(in srgb, #3b82f6 20%, transparent);
        color: #60a5fa;
        &:hover {
          background-color: color-mix(in srgb, #3b82f6 30%, transparent);
        }
      }

      &.action-other {
        background-color: color-mix(in srgb, #6b7280 20%, transparent);
        color: #9ca3af;
        &:hover {
          background-color: color-mix(in srgb, #6b7280 30%, transparent);
        }
      }
    }

    mat-form-field {
      font-size: 14px;
    }
  `,
})
export default class MatchControlPage implements OnInit, OnDestroy {
  matchId = input.required<string>();

  private matchService = inject(MatchService);
  private matchEventService = inject(MatchEventService);
  private teamService = inject(TeamService);
  private playerService = inject(PlayerService);
  private championshipService = inject(ChampionshipService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private eventPollingSubscription?: Subscription;

  showAdminPanel = false;
  isEditingTime = false;
  editMinutes = 0;
  editSeconds = 0;

  // Undo/Redo history
  private readonly MAX_HISTORY = 50;
  private undoStack: HistoryState[] = [];
  private redoStack: HistoryState[] = [];
  canUndo = signal(false);
  canRedo = signal(false);

  match = signal<Match | null>(null);
  championship = signal<Championship | null>(null);
  events = signal<LocalMatchEvent[]>([]);
  isLoading = signal(true);

  elapsedSeconds = signal(0);
  isRunning = signal(false);

  homeTeam = signal<LocalTeam>({
    id: 'home',
    name: '',
    score: 0,
    logo: '',
    players: [],
  });

  awayTeam = signal<LocalTeam>({
    id: 'away',
    name: '',
    score: 0,
    logo: '',
    players: [],
  });

  availablePositions = computed(() => {
    const champ = this.championship();
    if (!champ) return [];
    return getSportConfig(champ.sport).positions;
  });

  availableEventTypes = computed(() => {
    const champ = this.championship();
    if (!champ) return [];
    return getSportConfig(champ.sport).eventTypes;
  });

  formattedTime = computed(() => {
    const minutes = Math.floor(this.elapsedSeconds() / 60);
    const seconds = this.elapsedSeconds() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  constructor() {
    effect(() => {
      const m = this.match();
      if (m) {
        this.elapsedSeconds.set(m.elapsedSeconds || 0);
        this.isRunning.set(m.isClockRunning || false);
        if (m.isClockRunning && m.status === 'live') {
          this.startTimer();
        } else {
          this.stopTimer();
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadMatchData();
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.eventPollingSubscription?.unsubscribe();
  }

  private loadMatchData(): void {
    this.isLoading.set(true);
    this.matchService.getMatchById(this.matchId()).subscribe({
      next: (match) => {
        this.match.set(match);
        this.elapsedSeconds.set(match.elapsedSeconds || 0);
        this.isRunning.set(match.isClockRunning || false);

        forkJoin({
          homeTeam: this.teamService.getTeamById(match.homeTeamId),
          awayTeam: this.teamService.getTeamById(match.awayTeamId),
          championship: this.championshipService.getChampionshipById(match.championshipId),
        }).subscribe({
          next: ({ homeTeam, awayTeam, championship }) => {
            this.championship.set(championship);
            this.loadPlayers(homeTeam.id, awayTeam.id);
            this.loadEvents();
            this.updateLocalTeams(homeTeam, awayTeam, match);
            this.isLoading.set(false);
            this.saveToHistory(); // Initial state for undo/redo
          },
          error: (error) => {
            console.error('Error loading teams/championship', error);
            this.snackBar.open('Error cargando equipos o campeonato', 'Cerrar', { duration: 3000 });
            this.isLoading.set(false);
          },
        });
      },
      error: (error) => {
        console.error('Error loading match', error);
        this.snackBar.open('Error cargando partido', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  private updateLocalTeams(homeTeam: Team, awayTeam: Team, match: Match): void {
    this.homeTeam.set({
      id: 'home',
      name: homeTeam.name,
      score: match.homeScore,
      logo: homeTeam.logo || '',
      players: [],
    });
    this.awayTeam.set({
      id: 'away',
      name: awayTeam.name,
      score: match.awayScore,
      logo: awayTeam.logo || '',
      players: [],
    });
  }

  private loadPlayers(homeTeamId: string, awayTeamId: string): void {
    forkJoin({
      homePlayers: this.playerService.getPlayersByTeam(homeTeamId),
      awayPlayers: this.playerService.getPlayersByTeam(awayTeamId),
    }).subscribe({
      next: ({ homePlayers, awayPlayers }) => {
        this.homeTeam.update((team) => ({
          ...team,
          players: homePlayers.map((p) => ({
            id: crypto.randomUUID(),
            number: p.number,
            name: p.fullName,
            position: p.position,
            teamId: 'home' as const,
            originalPlayerId: p.id,
          })),
        }));
        this.awayTeam.update((team) => ({
          ...team,
          players: awayPlayers.map((p) => ({
            id: crypto.randomUUID(),
            number: p.number,
            name: p.fullName,
            position: p.position,
            teamId: 'away' as const,
            originalPlayerId: p.id,
          })),
        }));
      },
      error: (error) => {
        console.error('Error loading players', error);
      },
    });
  }

  private loadEvents(): void {
    const match = this.match();
    if (!match) return;

    this.matchEventService.getMatchEvents(match.id).subscribe({
      next: (backendEvents) => {
        const localEvents: LocalMatchEvent[] = backendEvents.map((e) => {
          const team = e.teamId === this.match()!.homeTeamId ? this.homeTeam() : this.awayTeam();
          const player = team.players.find((p) => p.originalPlayerId === e.playerId) || {
            id: crypto.randomUUID(),
            number: 0,
            name: e.player?.fullName || 'Desconocido',
            position: '',
            teamId: team.id,
          };

          return {
            id: crypto.randomUUID(),
            time: formatEventMinute(e.minute, e.extraMinute),
            type: e.type,
            player,
            team,
            backendEventId: e.id,
          };
        });
        this.events.set(localEvents.sort((a, b) => {
          // Sort by time (newest first for display)
          const match = this.match();
          if (!match) return 0;
          const aEvent = backendEvents.find((e) => e.id === a.backendEventId);
          const bEvent = backendEvents.find((e) => e.id === b.backendEventId);
          if (!aEvent || !bEvent) return 0;
          return bEvent.createdAt.getTime() - aEvent.createdAt.getTime();
        }));
      },
      error: (error) => {
        console.error('Error loading events', error);
      },
    });

    if (match.status === 'live') {
      this.startEventPolling();
    }
  }

  private startEventPolling(): void {
    const match = this.match();
    if (!match) return;

    this.eventPollingSubscription = interval(3000)
      .pipe(switchMap(() => this.matchEventService.getMatchEvents(match.id)))
      .subscribe({
        next: (backendEvents) => {
          const localEvents: LocalMatchEvent[] = backendEvents.map((e) => {
            const team = e.teamId === this.match()!.homeTeamId ? this.homeTeam() : this.awayTeam();
            const player = team.players.find((p) => p.originalPlayerId === e.playerId) || {
              id: crypto.randomUUID(),
              number: 0,
              name: e.player?.fullName || 'Desconocido',
              position: '',
              teamId: team.id,
            };

            return {
              id: crypto.randomUUID(),
              time: formatEventMinute(e.minute, e.extraMinute),
              type: e.type,
              player,
              team,
              backendEventId: e.id,
            };
          });
          this.events.set(localEvents.sort((a, b) => {
            const match = this.match();
            if (!match) return 0;
            const aEvent = backendEvents.find((e) => e.id === a.backendEventId);
            const bEvent = backendEvents.find((e) => e.id === b.backendEventId);
            if (!aEvent || !bEvent) return 0;
            return bEvent.createdAt.getTime() - aEvent.createdAt.getTime();
          }));
        },
        error: (error) => {
          console.error('Error during event polling', error);
          this.stopEventPolling();
        },
      });
  }

  private stopEventPolling(): void {
    this.eventPollingSubscription?.unsubscribe();
    this.eventPollingSubscription = undefined;
  }

  // ============ Timer Controls ============

  startTimer(): void {
    if (this.timerInterval) return;

    const match = this.match();
    if (!match) return;

    if (match.status === 'scheduled' || match.status === 'warmup') {
      this.updateMatchStatus('live');
    }

    this.isRunning.set(true);
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.update((s) => s + 1);
      this.saveTimerToBackend();
    }, 1000);
  }

  pauseTimer(): void {
    this.stopTimer();
    this.isRunning.set(false);
    this.saveTimerToBackend();
  }

  resetTimer(): void {
    this.stopTimer();
    this.isRunning.set(false);
    this.elapsedSeconds.set(0);
    this.saveTimerToBackend();
  }

  private saveTimerToBackend(): void {
    const match = this.match();
    if (!match) return;

    const currentPeriod = this.calculateCurrentPeriod();
    this.matchService
      .updateMatch(match.id, {
        elapsedSeconds: this.elapsedSeconds(),
        currentPeriod,
        isClockRunning: this.isRunning(),
      } as UpdateMatchDto)
      .subscribe({
        next: (updatedMatch) => {
          this.match.set(updatedMatch);
        },
        error: (error) => {
          console.error('Error saving timer', error);
        },
      });
  }

  private calculateCurrentPeriod(): number {
    const champ = this.championship();
    if (!champ) return 1;
    const config = getSportConfig(champ.sport);
    const periodDuration = config.periodDuration || 45;
    const totalSeconds = this.elapsedSeconds();
    return Math.floor(totalSeconds / (periodDuration * 60)) + 1;
  }

  startTimeEdit(): void {
    this.pauseTimer();
    const totalSeconds = this.elapsedSeconds();
    this.editMinutes = Math.floor(totalSeconds / 60);
    this.editSeconds = totalSeconds % 60;
    this.isEditingTime = true;
  }

  saveTime(): void {
    this.saveToHistory();
    const minutes = Math.max(0, this.editMinutes);
    const seconds = Math.min(59, Math.max(0, this.editSeconds));
    this.elapsedSeconds.set(minutes * 60 + seconds);
    this.isEditingTime = false;
    this.saveTimerToBackend();
  }

  cancelTimeEdit(): void {
    this.isEditingTime = false;
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ============ Match Settings ============

  updateMatchStatus(status: MatchStatus): void {
    const match = this.match();
    if (!match) return;

    this.saveToHistory();
    this.matchService.updateMatch(match.id, { status }).subscribe({
      next: (updatedMatch) => {
        this.match.set(updatedMatch);
        if (updatedMatch.status === 'live') {
          this.startTimer();
          this.startEventPolling();
        } else {
          this.pauseTimer();
          this.stopEventPolling();
        }
      },
      error: (error) => {
        console.error('Error updating match status', error);
        this.snackBar.open('Error al actualizar estado del partido', 'Cerrar', { duration: 3000 });
      },
    });
  }

  updateMatchDate(date: Date | null): void {
    const match = this.match();
    if (!match || !date) return;

    this.saveToHistory();
    this.matchService.updateMatch(match.id, { scheduledDate: date }).subscribe({
      next: (updatedMatch) => {
        this.match.set(updatedMatch);
      },
      error: (error) => {
        console.error('Error updating match date', error);
        this.snackBar.open('Error al actualizar fecha', 'Cerrar', { duration: 3000 });
      },
    });
  }

  updateMatchTime(time: string): void {
    const match = this.match();
    if (!match || !time) return;

    this.saveToHistory();
    this.matchService.updateMatch(match.id, { scheduledTime: time }).subscribe({
      next: (updatedMatch) => {
        this.match.set(updatedMatch);
      },
      error: (error) => {
        console.error('Error updating match time', error);
        this.snackBar.open('Error al actualizar hora', 'Cerrar', { duration: 3000 });
      },
    });
  }

  updateVenue(venue: string): void {
    const match = this.match();
    if (!match) return;

    this.saveToHistory();
    this.matchService.updateMatch(match.id, { venue }).subscribe({
      next: (updatedMatch) => {
        this.match.set(updatedMatch);
      },
      error: (error) => {
        console.error('Error updating venue', error);
        this.snackBar.open('Error al actualizar cancha', 'Cerrar', { duration: 3000 });
      },
    });
  }

  updateReferee(referee: string): void {
    const match = this.match();
    if (!match) return;

    this.saveToHistory();
    this.matchService.updateMatch(match.id, { referee }).subscribe({
      next: (updatedMatch) => {
        this.match.set(updatedMatch);
      },
      error: (error) => {
        console.error('Error updating referee', error);
        this.snackBar.open('Error al actualizar árbitro', 'Cerrar', { duration: 3000 });
      },
    });
  }

  // ============ Team Updates ============

  updateTeamName(teamId: 'home' | 'away', name: string): void {
    this.saveToHistory();
    const teamSignal = teamId === 'home' ? this.homeTeam : this.awayTeam;
    teamSignal.update((team) => ({ ...team, name }));

    const match = this.match();
    if (!match) return;

    const backendTeamId = teamId === 'home' ? match.homeTeamId : match.awayTeamId;
    this.teamService.updateTeam(backendTeamId, { name }).subscribe({
      next: () => {
        this.snackBar.open('Nombre del equipo actualizado', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error updating team name', error);
        this.snackBar.open('Error al actualizar nombre del equipo', 'Cerrar', { duration: 3000 });
      },
    });
  }

  updateTeamScore(teamId: 'home' | 'away', score: number): void {
    this.saveToHistory();
    const match = this.match();
    if (!match) return;

    const newHomeScore = teamId === 'home' ? score : match.homeScore;
    const newAwayScore = teamId === 'away' ? score : match.awayScore;

    this.matchService
      .updateMatchScore(match.id, {
        homeScore: Math.max(0, newHomeScore),
        awayScore: Math.max(0, newAwayScore),
      })
      .subscribe({
        next: (updatedMatch) => {
          this.match.set(updatedMatch);
          this.homeTeam.update((t) => ({ ...t, score: updatedMatch.homeScore }));
          this.awayTeam.update((t) => ({ ...t, score: updatedMatch.awayScore }));
        },
        error: (error) => {
          console.error('Error updating score', error);
          this.snackBar.open('Error al actualizar marcador', 'Cerrar', { duration: 3000 });
        },
      });
  }

  // ============ Player Management ============

  addPlayer(teamId: 'home' | 'away'): void {
    this.saveToHistory();
    const match = this.match();
    const user = this.authService.currentUser();
    if (!match || !user?.organizationId) return;

    const teamSignal = teamId === 'home' ? this.homeTeam : this.awayTeam;
    const backendTeamId = teamId === 'home' ? match.homeTeamId : match.awayTeamId;

    const newPlayer: LocalPlayer = {
      id: crypto.randomUUID(),
      number: this.getNextPlayerNumber(teamSignal()),
      name: 'Nuevo Jugador',
      position: this.availablePositions()[0]?.code || 'MID',
      teamId,
    };

    teamSignal.update((team) => ({
      ...team,
      players: [newPlayer, ...team.players],
    }));

    // Create player in backend
    const createDto: CreatePlayerDto = {
      firstName: 'Nuevo',
      lastName: 'Jugador',
      number: newPlayer.number,
      position: newPlayer.position,
    };

    this.playerService
      .createPlayer({
        ...createDto,
        teamId: backendTeamId,
        championshipId: match.championshipId,
        organizationId: user.organizationId,
      })
      .subscribe({
        next: (createdPlayer) => {
          teamSignal.update((team) => ({
            ...team,
            players: team.players.map((p) =>
              p.id === newPlayer.id ? { ...p, originalPlayerId: createdPlayer.id, name: createdPlayer.fullName } : p
            ),
          }));
          this.snackBar.open('Jugador agregado', 'Cerrar', { duration: 2000 });
        },
        error: (error) => {
          console.error('Error creating player', error);
          this.snackBar.open('Error al crear jugador', 'Cerrar', { duration: 3000 });
          // Remove from local state if backend creation failed
          teamSignal.update((team) => ({
            ...team,
            players: team.players.filter((p) => p.id !== newPlayer.id),
          }));
        },
      });
  }

  removePlayer(teamId: 'home' | 'away', playerId: string): void {
    this.saveToHistory();
    const teamSignal = teamId === 'home' ? this.homeTeam : this.awayTeam;
    const player = teamSignal().players.find((p) => p.id === playerId);

    teamSignal.update((team) => ({
      ...team,
      players: team.players.filter((p) => p.id !== playerId),
    }));

    // Delete from backend if it was a real player
    if (player?.originalPlayerId) {
      this.playerService.deletePlayer(player.originalPlayerId).subscribe({
        next: () => {
          this.snackBar.open('Jugador eliminado', 'Cerrar', { duration: 2000 });
        },
        error: (error) => {
          console.error('Error deleting player', error);
          this.snackBar.open('Error al eliminar jugador', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }

  updatePlayer(teamId: 'home' | 'away', playerId: string, field: keyof LocalPlayer, value: string | number): void {
    this.saveToHistory();
    const teamSignal = teamId === 'home' ? this.homeTeam : this.awayTeam;
    const player = teamSignal().players.find((p) => p.id === playerId);

    teamSignal.update((team) => ({
      ...team,
      players: team.players.map((p) => (p.id === playerId ? { ...p, [field]: value } : p)),
    }));

    // Update in backend if it was a real player
    if (player?.originalPlayerId) {
      const updateDto: UpdatePlayerDto = {};
      if (field === 'name') {
        const nameParts = (value as string).split(' ');
        updateDto.firstName = nameParts[0] || '';
        updateDto.lastName = nameParts.slice(1).join(' ') || '';
      } else if (field === 'number') {
        updateDto.number = value as number;
      } else if (field === 'position') {
        updateDto.position = value as string;
      }

      this.playerService.updatePlayer(player.originalPlayerId, updateDto).subscribe({
        next: (updatedPlayer) => {
          teamSignal.update((team) => ({
            ...team,
            players: team.players.map((p) =>
              p.id === playerId ? { ...p, name: updatedPlayer.fullName } : p
            ),
          }));
        },
        error: (error) => {
          console.error('Error updating player', error);
        },
      });
    }
  }

  private getNextPlayerNumber(team: LocalTeam): number {
    const usedNumbers = team.players.map((p) => p.number);
    for (let i = 1; i <= 99; i++) {
      if (!usedNumbers.includes(i)) return i;
    }
    return 99;
  }

  // ============ Event Logging ============

  logEvent(eventType: string, player: LocalPlayer, team: LocalTeam): void {
    const match = this.match();
    const user = this.authService.currentUser();
    if (!match || !user || !player.originalPlayerId) return;

    this.saveToHistory();

    const currentPeriod = this.calculateCurrentPeriod();
    const totalSeconds = this.elapsedSeconds();
    const periodDuration = this.championship()
      ? getSportConfig(this.championship()!.sport).periodDuration || 45
      : 45;
    const minute = Math.floor(totalSeconds / 60);

    const createDto: CreateEventDto & { matchId: string; championshipId: string } = {
      type: eventType,
      playerId: player.originalPlayerId,
      teamId: team.id === 'home' ? match.homeTeamId : match.awayTeamId,
      period: currentPeriod,
      minute,
      matchId: match.id,
      championshipId: match.championshipId,
    };

    this.matchEventService.createEvent(createDto).subscribe({
      next: (createdEvent) => {
        const localEvent: LocalMatchEvent = {
          id: crypto.randomUUID(),
          time: formatEventMinute(minute),
          type: eventType,
          player,
          team,
          backendEventId: createdEvent.id,
        };

        this.events.update((events) => [localEvent, ...events]);

        // Update score if event affects score
        const eventConfig = this.availableEventTypes().find((e) => e.code === eventType);
        if (eventConfig?.affectsScore && eventConfig.pointValue) {
          const newHomeScore =
            team.id === 'home' ? match.homeScore + eventConfig.pointValue : match.homeScore;
          const newAwayScore =
            team.id === 'away' ? match.awayScore + eventConfig.pointValue : match.awayScore;

          this.matchService
            .updateMatchScore(match.id, {
              homeScore: Math.max(0, newHomeScore),
              awayScore: Math.max(0, newAwayScore),
            })
            .subscribe({
              next: (updatedMatch) => {
                this.match.set(updatedMatch);
                this.homeTeam.update((t) => ({ ...t, score: updatedMatch.homeScore }));
                this.awayTeam.update((t) => ({ ...t, score: updatedMatch.awayScore }));
              },
              error: (error) => {
                console.error('Error updating score', error);
              },
            });
        }
      },
      error: (error) => {
        console.error('Error creating event', error);
        this.snackBar.open('Error al registrar evento', 'Cerrar', { duration: 3000 });
      },
    });
  }

  removeEvent(eventId: string): void {
    this.saveToHistory();
    const event = this.events().find((e) => e.id === eventId);
    if (!event) return;

    this.events.update((events) => events.filter((e) => e.id !== eventId));

    // Remove from backend if it exists
    if (event.backendEventId) {
      this.matchEventService.deleteEvent(event.backendEventId).subscribe({
        next: () => {
          // Update score if it was a scoring event
          const eventConfig = this.availableEventTypes().find((e) => e.code === event.type);
          if (eventConfig?.affectsScore && eventConfig.pointValue) {
            const match = this.match();
            if (!match) return;

            const newHomeScore =
              event.team.id === 'home'
                ? Math.max(0, match.homeScore - eventConfig.pointValue)
                : match.homeScore;
            const newAwayScore =
              event.team.id === 'away'
                ? Math.max(0, match.awayScore - eventConfig.pointValue)
                : match.awayScore;

            this.matchService
              .updateMatchScore(match.id, {
                homeScore: newHomeScore,
                awayScore: newAwayScore,
              })
              .subscribe({
                next: (updatedMatch) => {
                  this.match.set(updatedMatch);
                  this.homeTeam.update((t) => ({ ...t, score: updatedMatch.homeScore }));
                  this.awayTeam.update((t) => ({ ...t, score: updatedMatch.awayScore }));
                },
                error: (error) => {
                  console.error('Error updating score', error);
                },
              });
          }
        },
        error: (error) => {
          console.error('Error deleting event', error);
          this.snackBar.open('Error al eliminar evento', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }

  clearAllEvents(): void {
    this.saveToHistory();
    const match = this.match();
    if (!match) return;

    // Delete all events from backend
    const eventsToDelete = this.events()
      .map((e) => e.backendEventId)
      .filter((id): id is string => !!id);

    if (eventsToDelete.length > 0) {
      forkJoin(eventsToDelete.map((id) => this.matchEventService.deleteEvent(id))).subscribe({
        next: () => {
          this.events.set([]);
          this.matchService
            .updateMatchScore(match.id, {
              homeScore: 0,
              awayScore: 0,
            })
            .subscribe({
              next: (updatedMatch) => {
                this.match.set(updatedMatch);
                this.homeTeam.update((t) => ({ ...t, score: 0 }));
                this.awayTeam.update((t) => ({ ...t, score: 0 }));
                this.snackBar.open('Todos los eventos eliminados', 'Cerrar', { duration: 2000 });
              },
              error: (error) => {
                console.error('Error resetting score', error);
              },
            });
        },
        error: (error) => {
          console.error('Error deleting events', error);
          this.snackBar.open('Error al eliminar eventos', 'Cerrar', { duration: 3000 });
        },
      });
    } else {
      this.events.set([]);
      this.homeTeam.update((t) => ({ ...t, score: 0 }));
      this.awayTeam.update((t) => ({ ...t, score: 0 }));
    }
  }

  // ============ Undo/Redo ============

  private saveToHistory(): void {
    const match = this.match();
    if (!match) return;

    const state: HistoryState = {
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      events: JSON.parse(JSON.stringify(this.events())),
      elapsedSeconds: this.elapsedSeconds(),
      currentPeriod: match.currentPeriod,
    };

    this.undoStack.push(state);

    if (this.undoStack.length > this.MAX_HISTORY) {
      this.undoStack.shift();
    }

    this.redoStack = [];
    this.updateHistorySignals();
  }

  undo(): void {
    if (this.undoStack.length === 0) return;

    const match = this.match();
    if (!match) return;

    const currentState: HistoryState = {
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      events: JSON.parse(JSON.stringify(this.events())),
      elapsedSeconds: this.elapsedSeconds(),
      currentPeriod: match.currentPeriod,
    };
    this.redoStack.push(currentState);

    const previousState = this.undoStack.pop()!;
    this.restoreState(previousState);

    this.updateHistorySignals();
  }

  redo(): void {
    if (this.redoStack.length === 0) return;

    const match = this.match();
    if (!match) return;

    const currentState: HistoryState = {
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      events: JSON.parse(JSON.stringify(this.events())),
      elapsedSeconds: this.elapsedSeconds(),
      currentPeriod: match.currentPeriod,
    };
    this.undoStack.push(currentState);

    const nextState = this.redoStack.pop()!;
    this.restoreState(nextState);

    this.updateHistorySignals();
  }

  private restoreState(state: HistoryState): void {
    const match = this.match();
    if (!match) return;

    this.matchService
      .updateMatchScore(match.id, {
        homeScore: state.homeScore,
        awayScore: state.awayScore,
      })
      .subscribe({
        next: (updatedMatch) => {
          this.match.set(updatedMatch);
          this.homeTeam.update((t) => ({ ...t, score: state.homeScore }));
          this.awayTeam.update((t) => ({ ...t, score: state.awayScore }));
          this.elapsedSeconds.set(state.elapsedSeconds);
          this.events.set(state.events);
        },
        error: (error) => {
          console.error('Error restoring state', error);
        },
      });
  }

  private updateHistorySignals(): void {
    this.canUndo.set(this.undoStack.length > 0);
    this.canRedo.set(this.redoStack.length > 0);
  }

  // ============ UI Helpers ============

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
      postponed: 'Pospuesto',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  }

  getPositionLabel(position: string): string {
    const pos = this.availablePositions().find((p) => p.code === position);
    return pos?.label || position;
  }

  getEventIcon(type: string): string {
    const eventType = this.availableEventTypes().find((e) => e.code === type);
    return eventType?.icon || 'sports_soccer';
  }

  getEventColor(type: string): string {
    const eventType = this.availableEventTypes().find((e) => e.code === type);
    return eventType?.color || '#6b7280';
  }

  getEventLabel(type: string): string {
    const eventType = this.availableEventTypes().find((e) => e.code === type);
    return eventType?.label || type;
  }

  getTeamInitials(name: string): string {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
