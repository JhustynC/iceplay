import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
  OnDestroy,
  OnInit,
} from '@angular/core';
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

type MatchStatus = 'scheduled' | 'live' | 'finished' | 'rescheduled' | 'cancelled' | 'postponed';

interface Player {
  id: string;
  number: number;
  name: string;
  position: string;
  teamId: 'home' | 'away';
}

interface Team {
  id: 'home' | 'away';
  name: string;
  score: number;
  logo: string;
  players: Player[];
}

interface MatchEvent {
  id: string;
  time: string;
  type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution';
  player: Player;
  team: Team;
}

interface MatchInfo {
  date: Date;
  time: string;
  venue: string;
  league: string;
  status: MatchStatus;
}

interface HistoryState {
  homeTeam: Team;
  awayTeam: Team;
  events: MatchEvent[];
  elapsedSeconds: number;
  matchInfo: MatchInfo;
}

@Component({
  selector: 'app-live-match-logger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
  ],
  template: `
    <div class="flex min-h-full flex-col gap-6 p-4 md:p-6">
      <!-- Header with Undo/Redo -->
      <div class="flex items-center justify-between gap-4">
        <h1 class="text-2xl font-bold">Match Control Panel</h1>

        <div class="flex items-center gap-2">
          <!-- Undo/Redo Buttons -->
          <div class="mr-4 flex items-center gap-1">
            <button
              matIconButton
              (click)="undo()"
              [disabled]="!canUndo()"
              matTooltip="Undo (Ctrl+Z)"
              class="undo-btn"
            >
              <mat-icon>undo</mat-icon>
            </button>
            <button
              matIconButton
              (click)="redo()"
              [disabled]="!canRedo()"
              matTooltip="Redo (Ctrl+Y)"
              class="redo-btn"
            >
              <mat-icon>redo</mat-icon>
            </button>
          </div>

          <mat-slide-toggle [(ngModel)]="showAdminPanel" color="primary">
            Admin Mode
          </mat-slide-toggle>
        </div>
      </div>

      <!-- Quick Actions (Admin) -->
      @if (showAdminPanel) {
        <section>
          <h2 class="mb-4 px-2 text-xl font-bold">Quick Actions</h2>
          <div class="flex flex-wrap gap-3">
            <button matButton="outlined" (click)="updateMatchStatus('live')">
              <mat-icon>play_circle</mat-icon> Start Match
            </button>
            <button matButton="outlined" (click)="updateMatchStatus('finished')">
              <mat-icon>sports_score</mat-icon> End Match
            </button>
            <button matButton="outlined" (click)="updateMatchStatus('cancelled')">
              <mat-icon>cancel</mat-icon> Cancel Match
            </button>
            <button matButton="outlined" (click)="updateMatchStatus('postponed')">
              <mat-icon>schedule</mat-icon> Postpone Match
            </button>
            <button matButton="outlined" (click)="clearAllEvents()">
              <mat-icon>clear_all</mat-icon> Clear Events
            </button>
          </div>
        </section>
      }

      <!-- Match Info Banner -->
      <div class="card flex flex-wrap items-center justify-between gap-4 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <mat-icon class="text-secondary">event</mat-icon>
          <div>
            <p class="text-secondary text-sm">{{ matchInfo().league }}</p>
            <p class="font-medium">
              {{ matchInfo().date | date: 'fullDate' }} • {{ matchInfo().time }}
            </p>
            <p class="text-secondary text-sm">{{ matchInfo().venue }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="status-chip" [class]="'status-' + matchInfo().status">
            {{ getStatusLabel(matchInfo().status) }}
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
                Match Settings
              </mat-panel-title>
            </mat-expansion-panel-header>

            <div class="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
              <mat-form-field appearance="outline">
                <mat-label>Match Status</mat-label>
                <mat-select
                  [value]="matchInfo().status"
                  (selectionChange)="updateMatchStatus($event.value)"
                >
                  <mat-option value="scheduled">Scheduled</mat-option>
                  <mat-option value="live">Live</mat-option>
                  <mat-option value="finished">Finished</mat-option>
                  <mat-option value="rescheduled">Rescheduled</mat-option>
                  <mat-option value="postponed">Postponed</mat-option>
                  <mat-option value="cancelled">Cancelled</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Match Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="datePicker"
                  [value]="matchInfo().date"
                  (dateChange)="updateMatchDate($event.value)"
                />
                <mat-datepicker-toggle matIconSuffix [for]="datePicker" />
                <mat-datepicker #datePicker />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Match Time</mat-label>
                <input
                  matInput
                  type="time"
                  [value]="matchInfo().time"
                  (change)="updateMatchTime($any($event.target).value)"
                />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Venue</mat-label>
                <input
                  matInput
                  [value]="matchInfo().venue"
                  (change)="updateVenue($any($event.target).value)"
                />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>League</mat-label>
                <input
                  matInput
                  [value]="matchInfo().league"
                  (change)="updateLeague($any($event.target).value)"
                />
              </mat-form-field>
            </div>
          </mat-expansion-panel>

          <!-- Home Team Management -->
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon class="mr-2">groups</mat-icon>
                {{ homeTeam().name }} (Home)
              </mat-panel-title>
              <!-- <mat-panel-description>
                {{ homeTeam().players.length }} players
              </mat-panel-description> -->
            </mat-expansion-panel-header>

            <div class="py-4">
              <div class="mb-4 flex flex-wrap gap-4">
                <mat-form-field appearance="outline" class="min-w-[200px] flex-1">
                  <mat-label>Team Name</mat-label>
                  <input
                    matInput
                    [value]="homeTeam().name"
                    (change)="updateTeamName('home', $any($event.target).value)"
                  />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-24">
                  <mat-label>Score</mat-label>
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

              <div class="mb-4 flex items-center justify-between">
                <h4 class="font-semibold">Players ({{ homeTeam().players.length }})</h4>
                <button matButton="outlined" (click)="addPlayer('home')">
                  <mat-icon>add</mat-icon> Add Player
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
                      <mat-label>Name</mat-label>
                      <input
                        matInput
                        [value]="player.name"
                        (change)="
                          updatePlayer('home', player.id, 'name', $any($event.target).value)
                        "
                      />
                    </mat-form-field>
                    <div class="flex flex-col gap-2">
                      <mat-form-field appearance="outline" class="w-20">
                        <mat-label>#</mat-label>
                        <input
                          matInput
                          type="number"
                          [value]="player.number"
                          (change)="
                            updatePlayer('home', player.id, 'number', +$any($event.target).value)
                          "
                        />
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="flex-1">
                        <mat-label>Position</mat-label>
                        <mat-select
                          [value]="player.position"
                          (selectionChange)="
                            updatePlayer('home', player.id, 'position', $event.value)
                          "
                        >
                          <mat-option value="GK">GK</mat-option>
                          <mat-option value="DEF">DEF</mat-option>
                          <mat-option value="MID">MID</mat-option>
                          <mat-option value="FWD">FWD</mat-option>
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
                {{ awayTeam().name }} (Away)
              </mat-panel-title>
              <!-- <mat-panel-description>
                {{ awayTeam().players.length }} players
              </mat-panel-description> -->
            </mat-expansion-panel-header>

            <div class="py-4">
              <div class="mb-4 flex flex-wrap gap-4">
                <mat-form-field appearance="outline" class="min-w-[200px] flex-1">
                  <mat-label>Team Name</mat-label>
                  <input
                    matInput
                    [value]="awayTeam().name"
                    (change)="updateTeamName('away', $any($event.target).value)"
                  />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-24">
                  <mat-label>Score</mat-label>
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

              <div class="mb-4 flex items-center justify-between">
                <h4 class="font-semibold">Players ({{ awayTeam().players.length }})</h4>
                <button matButton="outlined" (click)="addPlayer('away')">
                  <mat-icon>add</mat-icon> Add Player
                </button>
              </div>

              <div class="players-grid">
                @for (player of awayTeam().players; track player.id) {
                  <div class="player-card">
                    <div class="player-card-header">
                      <span class="player-number">#{{ player.number }}</span>
                      <button
                        matIconButton
                        color="warn"
                        (click)="removePlayer('away', player.id)"
                        class="h-8! w-8!"
                      >
                        <mat-icon class="text-lg!">close</mat-icon>
                      </button>
                    </div>
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Name</mat-label>
                      <input
                        matInput
                        [value]="player.name"
                        (change)="
                          updatePlayer('away', player.id, 'name', $any($event.target).value)
                        "
                      />
                    </mat-form-field>
                    <div class="flex flex-col gap-2">
                      <mat-form-field appearance="outline" class="w-20">
                        <mat-label>#</mat-label>
                        <input
                          matInput
                          type="number"
                          [value]="player.number"
                          (change)="
                            updatePlayer('away', player.id, 'number', +$any($event.target).value)
                          "
                        />
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="flex-1">
                        <mat-label>Position</mat-label>
                        <mat-select
                          [value]="player.position"
                          (selectionChange)="
                            updatePlayer('away', player.id, 'position', $event.value)
                          "
                        >
                          <mat-option value="GK">GK</mat-option>
                          <mat-option value="DEF">DEF</mat-option>
                          <mat-option value="MID">MID</mat-option>
                          <mat-option value="FWD">FWD</mat-option>
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
        <!-- <div class="score-card card rounded-xl p-4">
          <p class="text-secondary text-sm font-medium">{{ homeTeam().name }}</p>
          <p class="text-4xl md:text-5xl font-bold">{{ homeTeam().score }}</p>
        </div> -->
        <div
          class="card flex min-w-[140px] flex-1 flex-col items-center gap-3 rounded-xl p-4 sm:flex-row md:p-6"
        >
          <img
            class="h-14 w-14 sm:h-16 sm:w-16"
            [alt]="homeTeam().name + ' Logo'"
            [src]="homeTeam().logo"
          />
          <div class="text-center sm:text-left">
            <p class="text-secondary text-sm font-medium">Home</p>
            <p class="text-lg font-bold md:text-xl">{{ homeTeam().name }}</p>
            <p class="text-primary text-3xl font-black md:text-4xl">{{ homeTeam().score }}</p>
          </div>
        </div>

        <!-- Timer -->
        <div class="timer-card rounded-xl p-4">
          @if (matchInfo().status === 'live') {
            <div class="flex items-center justify-center gap-2">
              <span class="relative flex h-3 w-3">
                <span
                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
                ></span>
                <span class="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </span>
              <p class="text-primary text-sm font-semibold uppercase">Live</p>
            </div>
          } @else {
            <div class="flex justify-center">
              <span class="status-chip" [class]="'status-' + matchInfo().status">
                {{ getStatusLabel(matchInfo().status) }}
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
              class="time-display my-2 text-center font-mono text-3xl font-bold md:text-4xl"
              (click)="startTimeEdit()"
              title="Click to edit time"
            >
              {{ formattedTime() }}
            </p>
          }
          @if (matchInfo().status === 'live' || matchInfo().status === 'scheduled') {
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
        <!-- <div class="score-card card rounded-xl p-4">
          <p class="text-secondary text-sm font-medium text-right md:text-left">{{ awayTeam().name }}</p>
          <p class="text-4xl md:text-5xl font-bold">{{ awayTeam().score }}</p>
        </div> -->
        <div
          class="card flex min-w-[140px] flex-1 flex-col-reverse items-center justify-end gap-3 rounded-xl p-4 sm:flex-row md:p-6"
        >
          <div class="text-center sm:text-right">
            <p class="text-secondary text-sm font-medium">Away</p>
            <p class="text-lg font-bold md:text-xl">{{ awayTeam().name }}</p>
            <p class="text-primary text-3xl font-black md:text-4xl">{{ awayTeam().score }}</p>
          </div>
          <img
            class="h-14 w-14 sm:h-16 sm:w-16"
            [alt]="awayTeam().name + ' Logo'"
            [src]="awayTeam().logo"
          />
        </div>
      </div>

      <!-- Team Lineups & Actions -->
      @if (matchInfo().status === 'live') {
        <section>
          <h2 class="mb-4 px-2 text-xl font-bold">Team Lineups & Actions</h2>
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <!-- Home Team -->
            <div class="card rounded-xl border border-(--mat-sys-outline-variant) p-4">
              <h3 class="mb-3 px-2 text-lg font-semibold">{{ homeTeam().name }}</h3>
              <div class="space-y-1">
                @for (player of homeTeam().players; track player.id) {
                  <div
                    class="player-row grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg p-2"
                  >
                    <div>
                      <p class="text-sm md:text-base">#{{ player.number }} {{ player.name }}</p>
                      <p class="text-secondary text-xs">{{ getPositionLabel(player.position) }}</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-1 md:gap-2">
                      <button
                        class="action-btn goal"
                        (click)="logEvent('goal', player, homeTeam())"
                      >
                        Goal
                      </button>
                      <button
                        class="action-btn assist"
                        (click)="logEvent('assist', player, homeTeam())"
                      >
                        Assist
                      </button>
                      <button
                        class="action-btn yellow"
                        (click)="logEvent('yellow_card', player, homeTeam())"
                      >
                        Yellow
                      </button>
                      <button
                        class="action-btn red"
                        (click)="logEvent('red_card', player, homeTeam())"
                      >
                        Red
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Away Team -->
            <div class="card rounded-xl border border-(--mat-sys-outline-variant) p-4">
              <h3 class="mb-3 px-2 text-lg font-semibold">{{ awayTeam().name }}</h3>
              <div class="space-y-1">
                @for (player of awayTeam().players; track player.id) {
                  <div
                    class="player-row grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg p-2"
                  >
                    <div>
                      <p class="text-sm md:text-base">#{{ player.number }} {{ player.name }}</p>
                      <p class="text-secondary text-xs">{{ getPositionLabel(player.position) }}</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-1 md:gap-2">
                      <button
                        class="action-btn goal"
                        (click)="logEvent('goal', player, awayTeam())"
                      >
                        Goal
                      </button>
                      <button
                        class="action-btn assist"
                        (click)="logEvent('assist', player, awayTeam())"
                      >
                        Assist
                      </button>
                      <button
                        class="action-btn yellow"
                        (click)="logEvent('yellow_card', player, awayTeam())"
                      >
                        Yellow
                      </button>
                      <button
                        class="action-btn red"
                        (click)="logEvent('red_card', player, awayTeam())"
                      >
                        Red
                      </button>
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
        <h2 class="mb-4 px-2 text-xl font-bold">Event Log</h2>
        <div class="card overflow-hidden rounded-xl border border-(--mat-sys-outline-variant)">
          @if (events().length === 0) {
            <div class="text-secondary p-8 text-center">
              <mat-icon class="mb-2 text-5xl! opacity-50">sports_soccer</mat-icon>
              <p>No events logged yet. Start the match and log events!</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="table-header">
                    <th
                      class="w-24 px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
                    >
                      Time
                    </th>
                    <th
                      class="w-32 px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
                    >
                      Event
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                      Player
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                      Team
                    </th>
                    <th
                      class="w-20 px-4 py-3 text-right text-xs font-medium tracking-wider uppercase"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-(--mat-sys-outline-variant)">
                  @for (event of events(); track event.id) {
                    <tr>
                      <td class="text-secondary px-4 py-3 font-mono text-sm whitespace-nowrap">
                        {{ event.time }}
                      </td>
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
                      <td class="text-secondary px-4 py-3 text-sm whitespace-nowrap">
                        {{ event.team.name }}
                      </td>
                      <td class="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          matIconButton
                          class="h-8! w-8!"
                          (click)="removeEvent(event.id)"
                          aria-label="Remove event"
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

    .score-card {
      display: flex;
      justify-content: space-between;
      align-items: center;

      @media (min-width: 768px) {
        flex: 1;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;

        &:last-child {
          align-items: flex-end;
        }
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

      /* Hide spinner buttons */
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

    .player-edit-row {
      background-color: var(--mat-sys-surface-container-low);
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
      transition:
        border-color 0.2s,
        box-shadow 0.2s;

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

      &.status-live {
        background-color: color-mix(in srgb, #22c55e 20%, transparent);
        color: #4ade80;
      }

      &.status-finished {
        background-color: color-mix(in srgb, #6b7280 20%, transparent);
        color: #9ca3af;
      }

      &.status-rescheduled {
        background-color: color-mix(in srgb, #f59e0b 20%, transparent);
        color: #fbbf24;
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

      &.goal {
        background-color: color-mix(in srgb, #22c55e 20%, transparent);
        color: #4ade80;
        &:hover {
          background-color: color-mix(in srgb, #22c55e 30%, transparent);
        }
      }

      &.assist {
        background-color: color-mix(in srgb, #3b82f6 20%, transparent);
        color: #60a5fa;
        &:hover {
          background-color: color-mix(in srgb, #3b82f6 30%, transparent);
        }
      }

      &.yellow {
        background-color: color-mix(in srgb, #eab308 20%, transparent);
        color: #facc15;
        &:hover {
          background-color: color-mix(in srgb, #eab308 30%, transparent);
        }
      }

      &.red {
        background-color: color-mix(in srgb, #ef4444 20%, transparent);
        color: #f87171;
        &:hover {
          background-color: color-mix(in srgb, #ef4444 30%, transparent);
        }
      }
    }

    mat-form-field {
      font-size: 14px;
    }
  `,
})
export default class LiveMatchLogger implements OnInit, OnDestroy {
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  showAdminPanel = false;

  // Time editing
  isEditingTime = false;
  editMinutes = 0;
  editSeconds = 0;

  // Undo/Redo history
  private readonly MAX_HISTORY = 50;
  private undoStack: HistoryState[] = [];
  private redoStack: HistoryState[] = [];
  canUndo = signal(false);
  canRedo = signal(false);

  elapsedSeconds = signal(0);
  isRunning = signal(false);
  events = signal<MatchEvent[]>([]);

  matchInfo = signal<MatchInfo>({
    date: new Date(),
    time: '20:00',
    venue: 'Old Trafford',
    league: 'Premier League',
    status: 'scheduled',
  });

  homeTeam = signal<Team>({
    id: 'home',
    name: 'Manchester United',
    score: 0,
    logo: 'https://api.sofascore.app/api/v1/team/35/image',
    players: [
      { id: 'h1', number: 7, name: 'B. Fernandes', position: 'MID', teamId: 'home' },
      { id: 'h2', number: 10, name: 'M. Rashford', position: 'FWD', teamId: 'home' },
      { id: 'h3', number: 1, name: 'A. Onana', position: 'GK', teamId: 'home' },
      { id: 'h4', number: 6, name: 'L. Martínez', position: 'DEF', teamId: 'home' },
      { id: 'h5', number: 5, name: 'H. Maguire', position: 'DEF', teamId: 'home' },
    ],
  });

  awayTeam = signal<Team>({
    id: 'away',
    name: 'Liverpool',
    score: 0,
    logo: 'https://api.sofascore.app/api/v1/team/44/image',
    players: [
      { id: 'a1', number: 4, name: 'V. van Dijk', position: 'DEF', teamId: 'away' },
      { id: 'a2', number: 11, name: 'M. Salah', position: 'FWD', teamId: 'away' },
      { id: 'a3', number: 1, name: 'Alisson B.', position: 'GK', teamId: 'away' },
      { id: 'a4', number: 66, name: 'T. Alexander-Arnold', position: 'DEF', teamId: 'away' },
      { id: 'a5', number: 9, name: 'D. Núñez', position: 'FWD', teamId: 'away' },
    ],
  });

  formattedTime = computed(() => {
    const minutes = Math.floor(this.elapsedSeconds() / 60);
    const seconds = this.elapsedSeconds() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  ngOnInit(): void {
    // Auto-start could be enabled here
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // ============ Timer Controls ============

  startTimer(): void {
    if (this.timerInterval) return;

    // Auto-set status to live when starting
    if (this.matchInfo().status === 'scheduled') {
      this.updateMatchStatus('live');
    }

    this.isRunning.set(true);
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.update((s) => s + 1);
    }, 1000);
  }

  pauseTimer(): void {
    this.stopTimer();
    this.isRunning.set(false);
  }

  resetTimer(): void {
    this.stopTimer();
    this.isRunning.set(false);
    this.elapsedSeconds.set(0);
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
  }

  cancelTimeEdit(): void {
    this.isEditingTime = false;
  }

  // ============ Undo/Redo ============

  private saveToHistory(): void {
    const state: HistoryState = {
      homeTeam: JSON.parse(JSON.stringify(this.homeTeam())),
      awayTeam: JSON.parse(JSON.stringify(this.awayTeam())),
      events: JSON.parse(JSON.stringify(this.events())),
      elapsedSeconds: this.elapsedSeconds(),
      matchInfo: JSON.parse(JSON.stringify(this.matchInfo())),
    };

    this.undoStack.push(state);

    // Limit history size
    if (this.undoStack.length > this.MAX_HISTORY) {
      this.undoStack.shift();
    }

    // Clear redo stack when new action is performed
    this.redoStack = [];

    this.updateHistorySignals();
  }

  undo(): void {
    if (this.undoStack.length === 0) return;

    // Save current state to redo stack
    const currentState: HistoryState = {
      homeTeam: JSON.parse(JSON.stringify(this.homeTeam())),
      awayTeam: JSON.parse(JSON.stringify(this.awayTeam())),
      events: JSON.parse(JSON.stringify(this.events())),
      elapsedSeconds: this.elapsedSeconds(),
      matchInfo: JSON.parse(JSON.stringify(this.matchInfo())),
    };
    this.redoStack.push(currentState);

    // Restore previous state
    const previousState = this.undoStack.pop()!;
    this.restoreState(previousState);

    this.updateHistorySignals();
  }

  redo(): void {
    if (this.redoStack.length === 0) return;

    // Save current state to undo stack
    const currentState: HistoryState = {
      homeTeam: JSON.parse(JSON.stringify(this.homeTeam())),
      awayTeam: JSON.parse(JSON.stringify(this.awayTeam())),
      events: JSON.parse(JSON.stringify(this.events())),
      elapsedSeconds: this.elapsedSeconds(),
      matchInfo: JSON.parse(JSON.stringify(this.matchInfo())),
    };
    this.undoStack.push(currentState);

    // Restore next state
    const nextState = this.redoStack.pop()!;
    this.restoreState(nextState);

    this.updateHistorySignals();
  }

  private restoreState(state: HistoryState): void {
    this.homeTeam.set(state.homeTeam);
    this.awayTeam.set(state.awayTeam);
    this.events.set(state.events);
    this.elapsedSeconds.set(state.elapsedSeconds);
    this.matchInfo.set({
      ...state.matchInfo,
      date: new Date(state.matchInfo.date),
    });
  }

  private updateHistorySignals(): void {
    this.canUndo.set(this.undoStack.length > 0);
    this.canRedo.set(this.redoStack.length > 0);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ============ Match Info Updates ============

  updateMatchStatus(status: MatchStatus): void {
    this.saveToHistory();
    this.matchInfo.update((info) => ({ ...info, status }));

    if (status === 'finished' || status === 'cancelled' || status === 'postponed') {
      this.pauseTimer();
    }
  }

  updateMatchDate(date: Date | null): void {
    if (date) {
      this.saveToHistory();
      this.matchInfo.update((info) => ({ ...info, date }));
    }
  }

  updateMatchTime(time: string): void {
    this.saveToHistory();
    this.matchInfo.update((info) => ({ ...info, time }));
  }

  updateVenue(venue: string): void {
    this.saveToHistory();
    this.matchInfo.update((info) => ({ ...info, venue }));
  }

  updateLeague(league: string): void {
    this.saveToHistory();
    this.matchInfo.update((info) => ({ ...info, league }));
  }

  // ============ Team Updates ============

  updateTeamName(teamId: 'home' | 'away', name: string): void {
    this.saveToHistory();
    const teamSignal = teamId === 'home' ? this.homeTeam : this.awayTeam;
    teamSignal.update((team) => ({ ...team, name }));
  }

  updateTeamScore(teamId: 'home' | 'away', score: number): void {
    this.saveToHistory();
    const teamSignal = teamId === 'home' ? this.homeTeam : this.awayTeam;
    teamSignal.update((team) => ({ ...team, score: Math.max(0, score) }));
  }

  // ============ Player Management ============

  addPlayer(teamId: 'home' | 'away'): void {
    this.saveToHistory();
    const teamSignal = teamId === 'home' ? this.homeTeam : this.awayTeam;
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      number: this.getNextPlayerNumber(teamSignal()),
      name: 'New Player',
      position: 'MID',
      teamId,
    };
    teamSignal.update((team) => ({
      ...team,
      players: [newPlayer, ...team.players], // Add at beginning
    }));
  }

  removePlayer(teamId: 'home' | 'away', playerId: string): void {
    this.saveToHistory();
    const teamSignal = teamId === 'home' ? this.homeTeam : this.awayTeam;
    teamSignal.update((team) => ({
      ...team,
      players: team.players.filter((p) => p.id !== playerId),
    }));
  }

  updatePlayer(
    teamId: 'home' | 'away',
    playerId: string,
    field: keyof Player,
    value: string | number,
  ): void {
    this.saveToHistory();
    const teamSignal = teamId === 'home' ? this.homeTeam : this.awayTeam;
    teamSignal.update((team) => ({
      ...team,
      players: team.players.map((p) => (p.id === playerId ? { ...p, [field]: value } : p)),
    }));
  }

  private getNextPlayerNumber(team: Team): number {
    const usedNumbers = team.players.map((p) => p.number);
    for (let i = 1; i <= 99; i++) {
      if (!usedNumbers.includes(i)) return i;
    }
    return 99;
  }

  // ============ Event Logging ============

  logEvent(type: MatchEvent['type'], player: Player, team: Team): void {
    this.saveToHistory();
    const event: MatchEvent = {
      id: crypto.randomUUID(),
      time: this.formattedTime(),
      type,
      player,
      team,
    };

    this.events.update((events) => [event, ...events]);

    // Update score if goal
    if (type === 'goal') {
      if (team.id === 'home') {
        this.homeTeam.update((t) => ({ ...t, score: t.score + 1 }));
      } else {
        this.awayTeam.update((t) => ({ ...t, score: t.score + 1 }));
      }
    }
  }

  removeEvent(eventId: string): void {
    this.saveToHistory();
    const event = this.events().find((e) => e.id === eventId);
    if (event?.type === 'goal') {
      // Decrease score when removing a goal
      if (event.team.id === 'home') {
        this.homeTeam.update((t) => ({ ...t, score: Math.max(0, t.score - 1) }));
      } else {
        this.awayTeam.update((t) => ({ ...t, score: Math.max(0, t.score - 1) }));
      }
    }
    this.events.update((events) => events.filter((e) => e.id !== eventId));
  }

  clearAllEvents(): void {
    this.saveToHistory();
    this.events.set([]);
    this.homeTeam.update((t) => ({ ...t, score: 0 }));
    this.awayTeam.update((t) => ({ ...t, score: 0 }));
  }

  // ============ UI Helpers ============

  getStatusLabel(status: MatchStatus): string {
    const labels: Record<MatchStatus, string> = {
      scheduled: 'Scheduled',
      live: 'Live',
      finished: 'Finished',
      rescheduled: 'Rescheduled',
      postponed: 'Postponed',
      cancelled: 'Cancelled',
    };
    return labels[status];
  }

  getPositionLabel(position: string): string {
    const labels: Record<string, string> = {
      GK: 'Goalkeeper',
      DEF: 'Defender',
      MID: 'Midfielder',
      FWD: 'Forward',
    };
    return labels[position] || position;
  }

  getEventIcon(type: MatchEvent['type']): string {
    const icons: Record<MatchEvent['type'], string> = {
      goal: 'sports_soccer',
      assist: 'sync_alt',
      yellow_card: 'square',
      red_card: 'square',
      substitution: 'swap_horiz',
    };
    return icons[type];
  }

  getEventColor(type: MatchEvent['type']): string {
    const colors: Record<MatchEvent['type'], string> = {
      goal: '#4ade80',
      assist: '#60a5fa',
      yellow_card: '#facc15',
      red_card: '#f87171',
      substitution: '#a78bfa',
    };
    return colors[type];
  }

  getEventLabel(type: MatchEvent['type']): string {
    const labels: Record<MatchEvent['type'], string> = {
      goal: 'Goal',
      assist: 'Assist',
      yellow_card: 'Yellow Card',
      red_card: 'Red Card',
      substitution: 'Substitution',
    };
    return labels[type];
  }
}
