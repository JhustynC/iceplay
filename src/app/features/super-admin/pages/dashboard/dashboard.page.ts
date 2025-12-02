import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../../core/services/auth.service';

interface StatCard {
  icon: string;
  label: string;
  value: number;
  change?: number;
  color: string;
}

interface Organization {
  id: string;
  name: string;
  country: string;
  adminsCount: number;
  championshipsCount: number;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-super-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <header class="dashboard-header">
        <div>
          <h1 class="title">Panel de Control</h1>
          <p class="subtitle">Bienvenido, {{ authService.userFullName() }} - Super Administrador</p>
        </div>
        <div class="header-actions">
          <button matButton="filled" routerLink="/super-admin/organizations/new">
            <mat-icon>add</mat-icon>
            Nueva Organización
          </button>
        </div>
      </header>

      <!-- Stats Cards -->
      <section class="stats-grid">
        @for (stat of stats(); track stat.label) {
          <div class="stat-card">
            <div class="stat-icon" [style.background]="stat.color">
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
          </div>
        }
      </section>

      <!-- Quick Actions -->
      <section class="section">
        <h2 class="section-title">Acciones Rápidas</h2>
        <div class="quick-actions">
          <a routerLink="/super-admin/organizations/new" class="action-card">
            <mat-icon>business</mat-icon>
            <span>Crear Organización</span>
          </a>
          <a routerLink="/super-admin/announcements/new" class="action-card">
            <mat-icon>campaign</mat-icon>
            <span>Nuevo Anuncio</span>
          </a>
          <a routerLink="/super-admin/admins" class="action-card">
            <mat-icon>manage_accounts</mat-icon>
            <span>Gestionar Admins</span>
          </a>
          <a routerLink="/super-admin/reports" class="action-card">
            <mat-icon>analytics</mat-icon>
            <span>Ver Reportes</span>
          </a>
        </div>
      </section>

      <div class="two-columns">
        <!-- Recent Organizations -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Organizaciones Recientes</h2>
            <a matButton routerLink="/super-admin/organizations">
              Ver todas
              <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>

          <div class="org-list">
            @for (org of organizations(); track org.id) {
              <div class="org-card">
                <div class="org-avatar">{{ org.name.charAt(0) }}</div>
                <div class="org-info">
                  <h3 class="org-name">{{ org.name }}</h3>
                  <p class="org-meta">
                    <mat-icon>location_on</mat-icon>
                    {{ org.country }}
                  </p>
                </div>
                <div class="org-stats">
                  <span class="org-stat">
                    <mat-icon>person</mat-icon>
                    {{ org.adminsCount }}
                  </span>
                  <span class="org-stat">
                    <mat-icon>emoji_events</mat-icon>
                    {{ org.championshipsCount }}
                  </span>
                </div>
                <mat-chip-set>
                  @if (org.isActive) {
                    <mat-chip class="chip-active">Activa</mat-chip>
                  } @else {
                    <mat-chip class="chip-inactive">Inactiva</mat-chip>
                  }
                </mat-chip-set>
              </div>
            }
          </div>
        </section>

        <!-- System Activity -->
        <section class="section">
          <h2 class="section-title">Actividad del Sistema</h2>
          <div class="activity-list">
            @for (activity of systemActivity(); track activity.id) {
              <div class="activity-item">
                <div class="activity-dot" [style.background]="activity.color"></div>
                <div class="activity-content">
                  <p>{{ activity.message }}</p>
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
      cursor: pointer;
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
      margin-top: 0.125rem;
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
      margin: 0 0 1rem;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
      grid-template-columns: 1fr;
      gap: 1.5rem;

      @media (min-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .org-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .org-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--mat-sys-surface-container-high);
      border-radius: 8px;
      flex-wrap: wrap;

      @media (min-width: 480px) {
        padding: 1rem;
        gap: 1rem;
        flex-wrap: nowrap;
      }
    }

    .org-avatar {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      display: flex;
      font-size: 0.875rem;
      flex-shrink: 0;

      @media (min-width: 480px) {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        font-size: 1rem;
      }

      align-items: center;
      justify-content: center;
      font-weight: 700;
    }

    .org-info {
      flex: 1;
      min-width: 0;
      order: 2;
      width: calc(100% - 60px);

      @media (min-width: 480px) {
        order: 0;
        width: auto;
      }
    }

    .org-name {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @media (min-width: 480px) {
        font-size: 0.9375rem;
      }
    }

    .org-meta {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin: 0;
      font-size: 0.7rem;
      color: var(--mat-sys-on-surface-variant);

      @media (min-width: 480px) {
        font-size: 0.75rem;
      }

      mat-icon {
        font-size: 12px;
        width: 12px;
        height: 12px;

        @media (min-width: 480px) {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }
      }
    }

    .org-stats {
      display: none;
      gap: 0.5rem;

      @media (min-width: 640px) {
        display: flex;
      }
    }

    .org-stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    mat-chip-set {
      display: none;

      @media (min-width: 480px) {
        display: block;
      }
    }

    .chip-active {
      --mat-chip-label-text-color: #22c55e;
      --mat-chip-elevated-container-color: rgba(34, 197, 94, 0.15);
    }

    .chip-inactive {
      --mat-chip-label-text-color: #ef4444;
      --mat-chip-elevated-container-color: rgba(239, 68, 68, 0.15);
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      @media (min-width: 480px) {
        gap: 1rem;
      }
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;

      @media (min-width: 480px) {
        gap: 0.75rem;
      }
    }

    .activity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
    }

    .activity-content {
      flex: 1;

      p {
        margin: 0;
        font-size: 0.875rem;
      }
    }

    .activity-time {
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export default class SuperAdminDashboardPage {
  authService = inject(AuthService);

  stats = signal<StatCard[]>([
    { icon: 'business', label: 'Organizaciones', value: 15, change: 20, color: '#3b82f6' },
    { icon: 'people', label: 'Administradores', value: 42, change: 8, color: '#22c55e' },
    { icon: 'emoji_events', label: 'Campeonatos Activos', value: 28, color: '#f59e0b' },
    { icon: 'sports', label: 'Partidos Hoy', value: 12, color: '#ef4444' },
  ]);

  organizations = signal<Organization[]>([
    {
      id: '1',
      name: 'Liga Deportiva Quito Norte',
      country: 'Ecuador',
      adminsCount: 2,
      championshipsCount: 4,
      isActive: true,
      createdAt: '2024-06-01',
    },
    {
      id: '2',
      name: 'Federación de Baloncesto Guayaquil',
      country: 'Ecuador',
      adminsCount: 3,
      championshipsCount: 2,
      isActive: true,
      createdAt: '2024-08-15',
    },
    {
      id: '3',
      name: 'Club Deportivo Los Andes',
      country: 'Colombia',
      adminsCount: 1,
      championshipsCount: 1,
      isActive: false,
      createdAt: '2024-09-20',
    },
  ]);

  systemActivity = signal([
    {
      id: '1',
      message: 'Nueva organización creada: Liga Norte FC',
      time: 'Hace 2 horas',
      color: '#22c55e',
    },
    {
      id: '2',
      message: 'Admin agregado a Liga Deportiva Quito',
      time: 'Hace 5 horas',
      color: '#3b82f6',
    },
    { id: '3', message: 'Campeonato finalizado: Copa Verano 2024', time: 'Ayer', color: '#f59e0b' },
    {
      id: '4',
      message: 'Organización desactivada: Club Inactivo',
      time: 'Hace 2 días',
      color: '#ef4444',
    },
    {
      id: '5',
      message: 'Anuncio publicado: Nuevas funciones',
      time: 'Hace 3 días',
      color: '#a855f7',
    },
  ]);
}
