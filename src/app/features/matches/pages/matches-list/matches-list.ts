import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterLink } from '@angular/router';
import { MATCHES_DATA, League, Match } from '../../../../data/matches-data';

interface DayOption {
  dayOfWeek: string;
  dayNumber: number;
  month: string;
  isToday: boolean;
  isSelected: boolean;
  date: Date;
}

interface FilteredLeague {
  id: string;
  name: string;
  country: string;
  flagUrl: string;
  matches: Match[];
}

@Component({
  selector: 'app-matches-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    RouterLink,
  ],
  template: `
    <div class="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-6">
      <!-- Date Picker -->
      <div class="card rounded-xl p-3 sm:p-4">
        <!-- Month/Year Header -->
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ currentMonthYear() }}</h2>

          <!-- Calendar Picker -->
          <div class="flex items-center">
            <input
              matInput
              [matDatepicker]="picker"
              [value]="selectedDate()"
              (dateChange)="onDatePickerChange($event)"
              class="hidden-input"
            />
            <mat-datepicker-toggle [for]="picker">
              <mat-icon matDatepickerToggleIcon>calendar_month</mat-icon>
            </mat-datepicker-toggle>
            <mat-datepicker #picker />
          </div>
        </div>

        <!-- Days Navigation -->
        <div class="flex items-center gap-1">
          <button matIconButton (click)="previousDay()" aria-label="Previous day" class="shrink-0">
            <mat-icon>chevron_left</mat-icon>
          </button>

          <div class="flex flex-1 justify-center gap-1 overflow-hidden">
            @for (day of visibleDays(); track day.date.getTime(); let i = $index) {
              <button
                class="day-btn max-w-[60px] flex-1 rounded-lg p-2 transition-all"
                [class.day-selected]="day.isSelected"
                [class.day-today]="day.isToday && !day.isSelected"
                [class.day-hidden]="shouldHideDay(i)"
                (click)="selectDate(day.date)"
              >
                <span class="text-[10px] uppercase sm:text-xs" [class.font-semibold]="day.isToday">
                  {{ day.isToday ? 'HOY' : day.dayOfWeek }}
                </span>
                <p class="text-base font-bold sm:text-lg">{{ day.dayNumber }}</p>
              </button>
            }
          </div>

          <button matIconButton (click)="nextDay()" aria-label="Next day" class="shrink-0">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </div>

      <!-- Leagues and Matches -->
      @for (league of filteredLeagues(); track league.id) {
        <div class="card overflow-hidden rounded-xl">
          <!-- League Header -->
          <div
            class="flex items-center justify-between border-b border-(--mat-sys-outline-variant) p-4"
          >
            <div class="flex items-center gap-3">
              <img
                [src]="league.flagUrl"
                [alt]="league.country + ' flag'"
                class="h-auto w-6 rounded-sm"
              />
              <h2 class="text-lg font-bold">{{ league.name }}</h2>
            </div>
            <button matIconButton aria-label="More options">
              <mat-icon>more_vert</mat-icon>
            </button>
          </div>

          <!-- Matches -->
          <div class="divide-y divide-(--mat-sys-outline-variant)">
            @for (match of league.matches; track match.id) {
              <div
                class="match-row flex cursor-pointer items-center justify-between p-4"
                [routerLink]="['/match', match.id]"
              >
                <!-- Home Team -->
                <div class="flex w-2/5 items-center justify-end gap-3 text-right">
                  <span
                    class="hidden text-sm font-medium sm:inline-block"
                    [class.text-red-500]="match.status === 'live'"
                    >{{ match.homeTeam.name }}</span
                  >
                  <img [src]="match.homeTeam.logo" [alt]="match.homeTeam.name" class="h-7 w-7" />
                </div>

                <!-- Score/Time -->
                <div class="w-1/5 text-center">
                  @switch (match.status) {
                    @case ('scheduled') {
                      <div class="status-badge scheduled">
                        <span class="text-sm font-bold">{{ match.time }}</span>
                      </div>
                    }
                    @case ('live') {
                      <div class="status-badge live">
                        <span class="text-sm font-bold"
                          >{{ match.homeScore }} - {{ match.awayScore }}</span
                        >
                      </div>
                      <span class="text-primary mt-1 block text-xs font-semibold"
                        >{{ match.minute }}'</span
                      >
                    }
                    @case ('finished') {
                      <div class="status-badge finished">
                        <span class="text-sm font-bold"
                          >{{ match.homeScore }} - {{ match.awayScore }}</span
                        >
                      </div>
                      <span class="text-secondary mt-1 block text-xs">Finished</span>
                    }
                  }
                </div>

                <!-- Away Team -->
                <div class="flex w-2/5 items-center justify-start gap-3 text-left">
                  <img [src]="match.awayTeam.logo" [alt]="match.awayTeam.name" class="h-7 w-7" />
                  <span class="hidden text-sm font-medium sm:inline-block">{{
                    match.awayTeam.name
                  }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (filteredLeagues().length === 0) {
        <div class="card rounded-xl p-8 text-center">
          <mat-icon class="mb-2 text-5xl! opacity-50">sports_soccer</mat-icon>
          <p class="text-secondary">No matches scheduled for this date.</p>
        </div>
      }
    </div>
  `,
  styles: `
    .card {
      background-color: var(--mat-sys-surface-container);
    }

    .day-btn {
      color: var(--mat-sys-on-surface-variant);

      &:hover {
        background-color: color-mix(in srgb, var(--mat-sys-primary) 10%, transparent);
      }
    }

    .day-selected {
      background-color: var(--mat-sys-primary) !important;
      color: var(--mat-sys-on-primary) !important;

      span,
      p {
        color: inherit !important;
      }
    }

    .day-today:not(.day-selected) {
      border: 2px solid var(--mat-sys-primary);
    }

    /* Hide extra days on small screens */
    .day-hidden {
      display: none;
    }

    @media (min-width: 640px) {
      .day-hidden {
        display: block;
      }
    }

    .match-row:hover {
      background-color: color-mix(in srgb, var(--mat-sys-primary) 5%, transparent);
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;

      &.scheduled {
        background-color: var(--mat-sys-surface-container-high);
      }

      &.live {
        background-color: #dc2626;
        color: white;
      }

      &.finished {
        background-color: var(--mat-sys-surface-container-high);
      }
    }

    .hidden-input {
      width: 0;
      height: 0;
      opacity: 0;
      position: absolute;
      pointer-events: none;
    }
  `,
})
export default class MatchesList {
  private readonly TOTAL_DAYS = 7; // Total days to show
  private readonly VISIBLE_MOBILE = 3; // Days visible on mobile (centered)

  selectedDate = signal(this.getToday());

  // Generate days centered around selected date
  visibleDays = computed<DayOption[]>(() => {
    const today = this.getToday();
    const selected = this.selectedDate();
    const daysBeforeCenter = Math.floor(this.TOTAL_DAYS / 2);

    const startDate = new Date(selected);
    startDate.setDate(selected.getDate() - daysBeforeCenter);

    const days: DayOption[] = [];
    const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const monthNames = [
      'ENE',
      'FEB',
      'MAR',
      'ABR',
      'MAY',
      'JUN',
      'JUL',
      'AGO',
      'SEP',
      'OCT',
      'NOV',
      'DIC',
    ];

    for (let i = 0; i < this.TOTAL_DAYS; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        dayOfWeek: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        month: monthNames[date.getMonth()],
        isToday: this.isSameDay(date, today),
        isSelected: this.isSameDay(date, selected),
        date: new Date(date),
      });
    }

    return days;
  });

  // Current month and year for header
  currentMonthYear = computed(() => {
    const date = this.selectedDate();
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  });

  private allLeagues = signal<League[]>(MATCHES_DATA);

  // Filter leagues and matches by selected date
  filteredLeagues = computed<FilteredLeague[]>(() => {
    const selectedDateStr = this.formatDateToISO(this.selectedDate());

    const filtered: FilteredLeague[] = [];

    for (const league of this.allLeagues()) {
      const matchesForDate = league.matches.filter(
        (match: Match) => match.date === selectedDateStr,
      );

      if (matchesForDate.length > 0) {
        filtered.push({
          id: league.id,
          name: league.name,
          country: league.country,
          flagUrl: league.flagUrl,
          matches: matchesForDate,
        });
      }
    }

    return filtered;
  });

  private getToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  private formatDateToISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Determine if day should be hidden on mobile (only show center 3)
  shouldHideDay(index: number): boolean {
    const centerIndex = Math.floor(this.TOTAL_DAYS / 2);
    const range = Math.floor(this.VISIBLE_MOBILE / 2);
    return index < centerIndex - range || index > centerIndex + range;
  }

  selectDate(date: Date): void {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    this.selectedDate.set(newDate);
  }

  onDatePickerChange(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      const newDate = new Date(event.value);
      newDate.setHours(0, 0, 0, 0);
      this.selectedDate.set(newDate);
    }
  }

  previousDay(): void {
    const current = this.selectedDate();
    const newDate = new Date(current);
    newDate.setDate(current.getDate() - 1);
    this.selectedDate.set(newDate);
  }

  nextDay(): void {
    const current = this.selectedDate();
    const newDate = new Date(current);
    newDate.setDate(current.getDate() + 1);
    this.selectedDate.set(newDate);
  }
}
