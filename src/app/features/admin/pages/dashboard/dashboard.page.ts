import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../../core/services/auth.service';
import { SPORT_CONFIGS, type Sport } from '../../../../core/models';

interface StatCard {
  icon: string;
  label: string;
  value: number;
  change?: number;
  route: string;
}

interface UpcomingMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  sport: Sport;
}

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatDividerModule,
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <header class="dashboard-header">
        <div>
          <h1 class="title">Bienvenido, {{ authService.user()?.firstName }}</h1>
          <p class="subtitle">Panel de administración de tu organización</p>
        </div>
        <div class="header-actions">
          <button matButton="filled" routerLink="/admin/matches/new">
            <mat-icon>add</mat-icon>
            Nuevo Partido
          </button>
        </div>
      </header>

      <!-- Stats Cards -->
      <section class="stats-grid">
        @for (stat of stats(); track stat.label) {
          <a [routerLink]="stat.route" class="stat-card">
            <div class="stat-icon" [style.background]="getIconBg(stat.icon)">
              <mat-icon>{{ stat.icon }}</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
            @if (stat.change !== undefined) {
              <div class="stat-change" [class.positive]="stat.change > 0">
                <mat-icon>{{ stat.change > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                <span>{{ stat.change > 0 ? '+' : '' }}{{ stat.change }}%</span>
              </div>
            }
          </a>
        }
      </section>

      <!-- Quick Actions -->
      <section class="section">
        <h2 class="section-title pb-5">Acciones Rápidas</h2>
        <div class="quick-actions">
          <a routerLink="/admin/championships/new" class="action-card">
            <mat-icon>add_circle</mat-icon>
            <span>Nuevo Campeonato</span>
          </a>
          <a routerLink="/admin/teams/new" class="action-card">
            <mat-icon>group_add</mat-icon>
            <span>Agregar Equipo</span>
          </a>
          <a routerLink="/admin/players/new" class="action-card">
            <mat-icon>person_add</mat-icon>
            <span>Agregar Jugador</span>
          </a>
          <a routerLink="/admin/fixtures/generate" class="action-card">
            <mat-icon>calendar_month</mat-icon>
            <span>Generar Fixture</span>
          </a>
          <a routerLink="/admin/matches" class="action-card">
            <mat-icon>sports</mat-icon>
            <span>Control Partido</span>
          </a>
          <a routerLink="/admin/standings" class="action-card">
            <mat-icon>leaderboard</mat-icon>
            <span>Ver Tabla</span>
          </a>
        </div>
      </section>

      <div class="two-columns">
        <!-- Upcoming Matches -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Próximos Partidos</h2>
            <a matButton routerLink="/admin/matches" class="view-all">
              Ver todos
              <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>

          <div class="matches-list">
            @for (match of upcomingMatches(); track match.id) {
              <div class="match-card">
                <div class="match-sport">
                  <mat-icon>{{ getSportIcon(match.sport) }}</mat-icon>
                </div>
                <div class="match-teams">
                  <span class="team-name">{{ match.homeTeam }}</span>
                  <span class="vs">vs</span>
                  <span class="team-name">{{ match.awayTeam }}</span>
                </div>
                <div class="match-info">
                  <span class="match-date">{{ match.date }}</span>
                  <span class="match-time">{{ match.time }}</span>
                </div>
                <button matIconButton [matMenuTriggerFor]="matchMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #matchMenu="matMenu">
                  <button mat-menu-item routerLink="/admin/match/{{ match.id }}/control">
                    <mat-icon>sports</mat-icon>
                    <span>Controlar Partido</span>
                  </button>
                  <button mat-menu-item>
                    <mat-icon>edit</mat-icon>
                    <span>Editar</span>
                  </button>
                  <mat-divider />
                  <button mat-menu-item class="text-red-500">
                    <mat-icon>delete</mat-icon>
                    <span>Eliminar</span>
                  </button>
                </mat-menu>
              </div>
            } @empty {
              <div class="empty-state">
                <mat-icon>event_busy</mat-icon>
                <p>No hay partidos programados</p>
                <button matButton="outlined" routerLink="/admin/fixtures">Crear Fixture</button>
              </div>
            }
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Actividad Reciente</h2>
          </div>

          <div class="activity-list">
            @for (activity of recentActivity(); track activity.id) {
              <div class="activity-item">
                <div class="activity-icon" [style.background]="activity.color">
                  <mat-icon>{{ activity.icon }}</mat-icon>
                </div>
                <div class="activity-content">
                  <p class="activity-text">{{ activity.text }}</p>
                  <span class="activity-time">{{ activity.time }}</span>
                </div>
              </div>
            }
          </div>
        </section>
      </div>
    </div>
  `,
  styles: `
    .dashboard-container {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
    }

    .subtitle {
      color: var(--mat-sys-on-surface-variant);
      margin: 0.25rem 0 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
      transition:
        transform 0.2s,
        box-shadow 0.2s;
      overflow: hidden;
      min-width: 0;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      @media (min-width: 640px) {
        padding: 1.25rem;
        gap: 1rem;
      }
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      @media (min-width: 640px) {
        width: 48px;
        height: 48px;
        border-radius: 12px;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }
    }

    .stat-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.2;

      @media (min-width: 640px) {
        font-size: 1.5rem;
      }
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @media (min-width: 640px) {
        font-size: 0.875rem;
      }
    }

    .stat-change {
      display: none;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.7rem;
      color: #ef4444;
      flex-shrink: 0;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      background: rgba(239, 68, 68, 0.1);

      &.positive {
        color: #22c55e;
        background: rgba(34, 197, 94, 0.1);
      }

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      @media (min-width: 480px) {
        display: flex;
      }

      @media (min-width: 640px) {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    .section {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .section-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }

    .view-all {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      background: var(--mat-sys-surface-container-high);
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      transition:
        transform 0.2s,
        background-color 0.2s;

      &:hover {
        transform: translateY(-2px);
        background: var(--mat-sys-surface-container-highest);
      }

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--mat-sys-primary);
      }

      span {
        font-size: 0.875rem;
        font-weight: 500;
        text-align: center;
      }
    }

    .two-columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .matches-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .match-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--mat-sys-surface-container-high);
      border-radius: 8px;
    }

    .match-sport {
      color: var(--mat-sys-primary);
    }

    .match-teams {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .team-name {
      font-weight: 500;
    }

    .vs {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.75rem;
    }

    .match-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 0.75rem;
    }

    .match-date {
      color: var(--mat-sys-on-surface-variant);
    }

    .match-time {
      font-weight: 600;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--mat-sys-on-surface-variant);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        opacity: 0.5;
      }

      p {
        margin: 0.5rem 0 1rem;
      }
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .activity-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .activity-content {
      flex: 1;
    }

    .activity-text {
      margin: 0;
      font-size: 0.875rem;
    }

    .activity-time {
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export default class DashboardPage {
  authService = inject(AuthService);

  stats = signal<StatCard[]>([
    { icon: 'emoji_events', label: 'Campeonatos', value: 3, route: '/admin/championships' },
    { icon: 'groups', label: 'Equipos', value: 24, route: '/admin/teams' },
    { icon: 'person', label: 'Jugadores', value: 312, change: 12, route: '/admin/players' },
    { icon: 'sports', label: 'Partidos', value: 156, route: '/admin/matches' },
  ]);

  upcomingMatches = signal<UpcomingMatch[]>([
    {
      id: '1',
      homeTeam: 'FC Barcelona',
      awayTeam: 'Real Madrid',
      date: 'Hoy',
      time: '16:00',
      venue: 'Camp Nou',
      sport: 'football',
    },
    {
      id: '2',
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      date: 'Mañana',
      time: '19:30',
      venue: 'Staples Center',
      sport: 'basketball',
    },
    {
      id: '3',
      homeTeam: 'Tigres',
      awayTeam: 'Panteras',
      date: '15 Dic',
      time: '15:00',
      venue: 'Coliseo Municipal',
      sport: 'volleyball',
    },
  ]);

  recentActivity = signal([
    {
      id: '1',
      icon: 'sports_soccer',
      text: 'Barcelona 3-1 Valencia (Finalizado)',
      time: 'Hace 2 horas',
      color: '#22c55e',
    },
    {
      id: '2',
      icon: 'person_add',
      text: 'Nuevo jugador: Carlos Mendoza',
      time: 'Hace 4 horas',
      color: '#3b82f6',
    },
    {
      id: '3',
      icon: 'edit',
      text: 'Fixture actualizado para Jornada 12',
      time: 'Ayer',
      color: '#f59e0b',
    },
    {
      id: '4',
      icon: 'group_add',
      text: 'Nuevo equipo registrado: Halcones FC',
      time: 'Hace 2 días',
      color: '#a855f7',
    },
  ]);

  getIconBg(icon: string): string {
    const colors: Record<string, string> = {
      emoji_events: '#f59e0b',
      groups: '#3b82f6',
      person: '#22c55e',
      sports: '#ef4444',
    };
    return colors[icon] || '#6b7280';
  }

  getSportIcon(sport: Sport): string {
    return SPORT_CONFIGS[sport].icon;
  }
}
