import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  inject,
  signal,
  effect,
  OnDestroy,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { I18nService } from '../../../../core/services/i18n.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { MatchService } from '../../../../core/services/match.service';
import { MatchEventService } from '../../../../core/services/match-event.service';
import { TeamService } from '../../../../core/services/team.service';
import { ChampionshipService } from '../../../../core/services/championship.service';
import { Match as BackendMatch } from '../../../../core/models/match.model';
import { MatchEvent } from '../../../../core/models/event.model';
import { Team } from '../../../../core/models/team.model';
import { Championship } from '../../../../core/models/championship.model';

interface DisplayMatch {
  id: string;
  homeTeam: { id: string; name: string; logo: string };
  awayTeam: { id: string; name: string; logo: string };
  status: 'scheduled' | 'live' | 'finished';
  time?: string;
  minute?: string;
  homeScore?: number;
  awayScore?: number;
  date: Date;
  league: string;
  events?: DisplayEvent[];
}

interface DisplayEvent {
  minute: string;
  type: string;
  description: string;
  teamName: string;
}

@Component({
  selector: 'app-match-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule, MatTabsModule, RouterLink, TranslatePipe],
  template: `
    @if (isLoading()) {
      <div class="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <mat-icon class="animate-spin text-6xl! opacity-50">refresh</mat-icon>
        <p class="text-secondary">{{ 'common.loading' | translate }}</p>
      </div>
    } @else if (match(); as m) {
      <div class="flex min-h-full flex-col gap-6 p-4 md:p-6">
        <!-- Breadcrumbs -->
        <nav class="flex flex-wrap items-center gap-2 text-sm">
          <a
            routerLink="/matches"
            class="text-secondary hover:text-primary flex cursor-pointer items-center gap-1"
          >
            <mat-icon class="text-base!">arrow_back</mat-icon>
            {{ 'common.matches' | translate }}
          </a>
          <span class="text-tertiary">/</span>
          <span class="text-secondary">{{ m.league }}</span>
          <span class="text-tertiary">/</span>
          <span>{{ m.homeTeam.name }} vs {{ m.awayTeam.name }}</span>
        </nav>

        <div>
          <!-- Match Header -->
          <div class="flex flex-col gap-4 md:flex-row md:flex-wrap">
            <!-- Home Team -->
            <div
              class="card flex min-w-[140px] flex-1 flex-col items-center gap-3 rounded-xl p-4 sm:flex-row md:p-6"
            >
              <img
                class="h-14 w-14 sm:h-16 sm:w-16"
                [alt]="m.homeTeam.name + ' Logo'"
                [src]="m.homeTeam.logo"
              />
              <div class="text-center sm:text-left">
                <p class="text-secondary text-sm font-medium">{{ 'match.home' | translate }}</p>
                <p class="text-lg font-bold md:text-xl">{{ m.homeTeam.name }}</p>
                @if (m.status !== 'scheduled') {
                  <p class="text-primary text-3xl font-black md:text-4xl">{{ m.homeScore }}</p>
                }
              </div>
            </div>

            <!-- Match Info -->
            <div
              class="status-card flex min-w-[140px] flex-1 flex-col items-center justify-center gap-2 rounded-xl p-4 md:p-6"
            >
              @switch (m.status) {
                @case ('scheduled') {
                  <span
                    class="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400 uppercase"
                  >
                    {{ 'match.status.scheduled' | translate }}
                  </span>
                  <p class="text-2xl font-bold">{{ m.time }}</p>
                }
                @case ('live') {
                  <span
                    class="animate-pulse rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 uppercase"
                  >
                    {{ 'match.status.live' | translate }} - {{ m.minute }}'
                  </span>
                }
                @case ('finished') {
                  <span
                    class="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400 uppercase"
                  >
                    {{ 'match.status.fullTime' | translate }}
                  </span>
                }
              }
              <p class="text-secondary text-sm">{{ formattedMatchDate(m) }}</p>
              <p class="text-secondary text-xs">{{ m.league }}</p>
            </div>

            <!-- Away Team -->
            <div
              class="card flex min-w-[140px] flex-1 flex-col-reverse items-center justify-end gap-3 rounded-xl p-4 sm:flex-row md:p-6"
            >
              <div class="text-center sm:text-right">
                <p class="text-secondary text-sm font-medium">{{ 'match.away' | translate }}</p>
                <p class="text-lg font-bold md:text-xl">{{ m.awayTeam.name }}</p>
                @if (m.status !== 'scheduled') {
                  <p class="text-primary text-3xl font-black md:text-4xl">{{ m.awayScore }}</p>
                }
              </div>
              <img
                class="h-14 w-14 sm:h-16 sm:w-16"
                [alt]="m.awayTeam.name + ' Logo'"
                [src]="m.awayTeam.logo"
              />
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <mat-tab-group>
          <mat-tab [label]="'match.tabs.summary' | translate">
            <div class="py-4">
              <h2 class="mb-4 text-xl font-bold">{{ 'match.matchEvents' | translate }}</h2>

              @if (m.events && m.events.length > 0) {
                <div
                  class="card overflow-hidden rounded-xl border border-(--mat-sys-outline-variant)"
                >
                  <div class="overflow-x-auto">
                    <table class="w-full">
                      <thead>
                        <tr class="table-header">
                          <th
                            class="w-24 px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
                          >
                            {{ 'match.table.time' | translate }}
                          </th>
                          <th
                            class="w-32 px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
                          >
                            {{ 'match.table.event' | translate }}
                          </th>
                          <th
                            class="px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
                          >
                            {{ 'match.table.description' | translate }}
                          </th>
                          <th
                            class="px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
                          >
                            {{ 'match.table.team' | translate }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-(--mat-sys-outline-variant)">
                        @for (event of m.events; track event.minute + event.type) {
                          <tr>
                            <td
                              class="text-secondary px-4 py-3 font-mono text-sm font-bold whitespace-nowrap"
                            >
                              {{ event.minute }}
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap">
                              <span
                                class="inline-flex items-center gap-2 text-sm font-semibold"
                                [style.color]="getEventColor(event.type)"
                              >
                                <mat-icon class="text-base!">{{
                                  getEventIcon(event.type)
                                }}</mat-icon>
                                {{ getEventLabel(event.type) }}
                              </span>
                            </td>
                            <td class="px-4 py-3 text-sm">{{ event.description }}</td>
                            <td class="text-secondary px-4 py-3 text-sm whitespace-nowrap">
                              {{ event.teamName }}
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              } @else {
                <div class="card rounded-xl p-8 text-center">
                  <mat-icon class="mb-2 text-5xl! opacity-50">event_note</mat-icon>
                  <p class="text-secondary">{{ 'match.noEvents' | translate }}</p>
                </div>
              }
            </div>
          </mat-tab>

          <mat-tab [label]="'match.tabs.statistics' | translate">
            <div class="py-4">
              <p class="text-secondary">{{ 'match.comingSoon.statistics' | translate }}</p>
            </div>
          </mat-tab>

          <mat-tab [label]="'match.tabs.lineups' | translate">
            <div class="py-4">
              <p class="text-secondary">{{ 'match.comingSoon.lineups' | translate }}</p>
            </div>
          </mat-tab>

          <mat-tab [label]="'match.tabs.h2h' | translate">
            <div class="py-4">
              <p class="text-secondary">{{ 'match.comingSoon.h2h' | translate }}</p>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    } @else {
      <div class="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <mat-icon class="text-6xl! opacity-50">error_outline</mat-icon>
        <h2 class="text-xl font-bold">{{ 'match.notFound.title' | translate }}</h2>
        <p class="text-secondary">{{ 'match.notFound.message' | translate }}</p>
        <a routerLink="/matches" class="text-primary flex items-center gap-1 hover:underline">
          <mat-icon class="text-base!">arrow_back</mat-icon>
          {{ 'match.notFound.backToMatches' | translate }}
        </a>
      </div>
    }
  `,
  styles: `
    .card {
      background-color: var(--mat-sys-surface-container);
    }

    .status-card {
      background-color: color-mix(in srgb, var(--mat-sys-primary) 10%, transparent);
    }

    .table-header {
      background-color: var(--mat-sys-surface-container-high);
      color: var(--mat-sys-on-surface-variant);
    }

    .score-header {
      display: flex;
      flex-direction: column;
      gap: 12px;

      @media (min-width: 768px) {
        flex-direction: row;
      }
    }
  `,
})
export default class MatchDetails implements OnDestroy {
  private readonly i18nService = inject(I18nService);
  private readonly matchService = inject(MatchService);
  private readonly matchEventService = inject(MatchEventService);
  private readonly teamService = inject(TeamService);
  private readonly championshipService = inject(ChampionshipService);

  matchId = input.required<string>();

  private matchData = signal<BackendMatch | null>(null);
  private homeTeam = signal<Team | null>(null);
  private awayTeam = signal<Team | null>(null);
  private championship = signal<Championship | null>(null);
  private events = signal<MatchEvent[]>([]);
  private eventSubscription?: Subscription;
  isLoading = signal(true);

  match = computed<DisplayMatch | null>(() => {
    const m = this.matchData();
    const home = this.homeTeam();
    const away = this.awayTeam();
    const champ = this.championship();
    const evts = this.events();

    if (!m || !home || !away || !champ) return null;

    return {
      id: m.id,
      homeTeam: {
        id: home.id,
        name: home.name,
        logo: home.logo || 'https://via.placeholder.com/50',
      },
      awayTeam: {
        id: away.id,
        name: away.name,
        logo: away.logo || 'https://via.placeholder.com/50',
      },
      status: this.mapMatchStatus(m.status),
      time: m.scheduledTime,
      minute: m.status === 'live' ? Math.floor(m.elapsedSeconds / 60).toString() : undefined,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      date: m.scheduledDate,
      league: champ.name,
      events: this.transformEvents(evts, home, away),
    };
  });

  constructor() {
    effect(() => {
      const id = this.matchId();
      if (id) {
        this.loadMatch(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.eventSubscription?.unsubscribe();
  }

  private loadMatch(id: string): void {
    this.isLoading.set(true);
    this.matchService.getMatchById(id).subscribe({
      next: (match) => {
        this.matchData.set(match);
        const isLive =
          match.status === 'live' || match.status === 'warmup' || match.status === 'halftime';

        // Load teams and championship
        forkJoin({
          homeTeam: this.teamService.getTeamById(match.homeTeamId),
          awayTeam: this.teamService.getTeamById(match.awayTeamId),
          championship: this.championshipService.getChampionshipById(match.championshipId),
        }).subscribe({
          next: ({ homeTeam, awayTeam, championship }) => {
            this.homeTeam.set(homeTeam);
            this.awayTeam.set(awayTeam);
            this.championship.set(championship);
            this.isLoading.set(false);

            // Load events with polling if live
            this.loadEvents(id, isLive);
          },
          error: (error) => {
            console.error('Error loading match details', error);
            this.isLoading.set(false);
          },
        });
      },
      error: (error) => {
        console.error('Error loading match', error);
        this.isLoading.set(false);
      },
    });
  }

  private loadEvents(matchId: string, isLive: boolean): void {
    // Unsubscribe from previous polling if exists
    this.eventSubscription?.unsubscribe();

    // Use polling if live, single fetch otherwise
    this.eventSubscription = this.matchEventService
      .getMatchEventsWithPolling(matchId, isLive)
      .subscribe({
        next: (events) => {
          this.events.set(events);
        },
        error: (error) => {
          console.error('Error loading events', error);
        },
      });
  }

  private transformEvents(events: MatchEvent[], homeTeam: Team, awayTeam: Team): DisplayEvent[] {
    return events
      .map((event) => {
        const team = event.teamId === homeTeam.id ? homeTeam : awayTeam;
        return {
          minute: event.extraMinute ? `${event.minute}+${event.extraMinute}'` : `${event.minute}'`,
          type: event.type,
          description: event.description || '',
          teamName: team.name,
        };
      })
      .sort((a, b) => {
        // Sort by minute
        const minuteA = parseInt(a.minute.replace(/[^0-9]/g, '')) || 0;
        const minuteB = parseInt(b.minute.replace(/[^0-9]/g, '')) || 0;
        return minuteA - minuteB;
      });
  }

  private mapMatchStatus(status: string): 'scheduled' | 'live' | 'finished' {
    if (
      status === 'live' ||
      status === 'warmup' ||
      status === 'halftime' ||
      status === 'break' ||
      status === 'overtime' ||
      status === 'penalties'
    ) {
      return 'live';
    }
    if (status === 'finished') {
      return 'finished';
    }
    return 'scheduled';
  }

  /**
   * Formats match date according to current language
   */
  formattedMatchDate(match: DisplayMatch): string {
    return this.i18nService.formatDate(match.date, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  getEventIcon(type: string): string {
    const icons: Record<string, string> = {
      goal: 'sports_soccer',
      point: 'sports_soccer',
      substitution: 'swap_vert',
      yellow_card: 'square',
      red_card: 'square',
      assist: 'sports_soccer',
      foul: 'warning',
    };
    return icons[type] || 'event';
  }

  getEventColor(type: string): string {
    const colors: Record<string, string> = {
      goal: '#4ade80',
      point: '#4ade80',
      substitution: 'var(--mat-sys-on-surface-variant)',
      yellow_card: '#facc15',
      red_card: '#f87171',
      assist: '#60a5fa',
      foul: '#f59e0b',
    };
    return colors[type] || 'var(--mat-sys-on-surface-variant)';
  }

  getEventLabel(type: string): string {
    const labels: Record<string, string> = {
      goal: this.i18nService.translate('match.events.goal'),
      point: this.i18nService.translate('match.events.goal'),
      substitution: this.i18nService.translate('match.events.substitution'),
      yellow_card: this.i18nService.translate('match.events.yellowCard'),
      red_card: this.i18nService.translate('match.events.redCard'),
      assist: this.i18nService.translate('match.events.assist') || 'Assist',
      foul: this.i18nService.translate('match.events.foul') || 'Foul',
    };
    return labels[type] || type;
  }
}
