import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { findMatchById, Match, MatchEvent } from '../../../../data/matches-data';

@Component({
  selector: 'app-match-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule, MatTabsModule, RouterLink],
  template: `
    @if (match(); as m) {
      <div class="flex min-h-full flex-col gap-6 p-4 md:p-6">
        <!-- Breadcrumbs -->
        <nav class="flex flex-wrap items-center gap-2 text-sm">
          <a
            routerLink="/matches"
            class="text-secondary hover:text-primary flex cursor-pointer items-center gap-1"
          >
            <mat-icon class="text-base!">arrow_back</mat-icon>
            Matches
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
                <p class="text-secondary text-sm font-medium">Home</p>
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
                    Scheduled
                  </span>
                  <p class="text-2xl font-bold">{{ m.time }}</p>
                }
                @case ('live') {
                  <span
                    class="animate-pulse rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 uppercase"
                  >
                    Live - {{ m.minute }}'
                  </span>
                }
                @case ('finished') {
                  <span
                    class="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400 uppercase"
                  >
                    Full Time
                  </span>
                }
              }
              <p class="text-secondary text-sm">{{ m.displayDate }}</p>
              <p class="text-secondary text-xs">{{ m.league }}</p>
            </div>

            <!-- Away Team -->
            <div
              class="card flex min-w-[140px] flex-1 flex-col-reverse items-center justify-end gap-3 rounded-xl p-4 sm:flex-row md:p-6"
            >
              <div class="text-center sm:text-right">
                <p class="text-secondary text-sm font-medium">Away</p>
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
          <mat-tab label="Summary">
            <div class="py-4">
              <h2 class="mb-4 text-xl font-bold">Match Events</h2>

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
                            Time
                          </th>
                          <th
                            class="w-32 px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
                          >
                            Event
                          </th>
                          <th
                            class="px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
                          >
                            Description
                          </th>
                          <th
                            class="px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
                          >
                            Team
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
                  <p class="text-secondary">No events recorded yet.</p>
                </div>
              }
            </div>
          </mat-tab>

          <mat-tab label="Statistics">
            <div class="py-4">
              <p class="text-secondary">Statistics coming soon...</p>
            </div>
          </mat-tab>

          <mat-tab label="Line-ups">
            <div class="py-4">
              <p class="text-secondary">Line-ups coming soon...</p>
            </div>
          </mat-tab>

          <mat-tab label="H2H">
            <div class="py-4">
              <p class="text-secondary">Head to head coming soon...</p>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    } @else {
      <div class="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <mat-icon class="text-6xl! opacity-50">error_outline</mat-icon>
        <h2 class="text-xl font-bold">Match not found</h2>
        <p class="text-secondary">The match you're looking for doesn't exist.</p>
        <a routerLink="/matches" class="text-primary flex items-center gap-1 hover:underline">
          <mat-icon class="text-base!">arrow_back</mat-icon>
          Back to matches
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
export default class MatchDetails {
  matchId = input.required<string>();

  match = computed<Match | undefined>(() => findMatchById(this.matchId()));

  getEventIcon(type: MatchEvent['type']): string {
    const icons: Record<MatchEvent['type'], string> = {
      goal: 'sports_soccer',
      substitution: 'swap_vert',
      yellow_card: 'square',
      red_card: 'square',
    };
    return icons[type];
  }

  getEventColor(type: MatchEvent['type']): string {
    const colors: Record<MatchEvent['type'], string> = {
      goal: '#4ade80',
      substitution: 'var(--mat-sys-on-surface-variant)',
      yellow_card: '#facc15',
      red_card: '#f87171',
    };
    return colors[type];
  }

  getEventLabel(type: MatchEvent['type']): string {
    const labels: Record<MatchEvent['type'], string> = {
      goal: 'Goal',
      substitution: 'Substitution',
      yellow_card: 'Yellow Card',
      red_card: 'Red Card',
    };
    return labels[type];
  }
}
