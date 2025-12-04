import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SPORT_CONFIGS, type Championship, type Sport } from '../../../../core/models';
import { ChampionshipStatus } from '../../../../core/models/championship.model';
import { ChampionshipService } from '../../../../core/services/championship.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-championships-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="page-title">Campeonatos</h1>
          <p class="page-subtitle">Gestiona los campeonatos de tu organización</p>
        </div>
        <button matButton="filled" routerLink="/admin/championships/new">
          <mat-icon>add</mat-icon>
          Nuevo Campeonato
        </button>
      </header>

      <div class="content-card">
        @if (championships().length > 0) {
          <table mat-table [dataSource]="championships()" class="w-full">
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let item">
                <div class="flex items-center gap-3">
                  <div class="sport-icon" [style.background]="getSportColor(item.sport)">
                    <mat-icon>{{ getSportIcon(item.sport) }}</mat-icon>
                  </div>
                  <div>
                    <span class="font-medium">{{ item.name }}</span>
                    <span class="text-secondary block text-sm">{{ item.season }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Sport Column -->
            <ng-container matColumnDef="sport">
              <th mat-header-cell *matHeaderCellDef>Deporte</th>
              <td mat-cell *matCellDef="let item">{{ getSportLabel(item.sport) }}</td>
            </ng-container>

            <!-- Teams Column -->
            <ng-container matColumnDef="teams">
              <th mat-header-cell *matHeaderCellDef>Equipos</th>
              <td mat-cell *matCellDef="let item">{{ item.totalTeams || 0 }}</td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let item">
                <mat-form-field appearance="outline" class="status-select">
                  <mat-select
                    [value]="item.status"
                    (selectionChange)="updateChampionshipStatus(item.id, $event.value)"
                  >
                    @for (status of availableStatuses; track status.value) {
                      <mat-option [value]="status.value">
                        {{ status.label }}
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let item">
                <button matIconButton [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <a mat-menu-item [routerLink]="['/admin/championships', item.id]">
                    <mat-icon>visibility</mat-icon>
                    <span>Ver detalles</span>
                  </a>
                  <a mat-menu-item [routerLink]="['/admin/championships', item.id, 'edit']">
                    <mat-icon>edit</mat-icon>
                    <span>Editar</span>
                  </a>
                  <mat-divider></mat-divider>
                  <div class="text-secondary px-4 py-2 text-xs font-semibold">Cambiar Estado</div>
                  @for (status of availableStatuses; track status.value) {
                    <button
                      mat-menu-item
                      (click)="updateChampionshipStatus(item.id, status.value)"
                      [class.selected-status]="item.status === status.value"
                    >
                      <mat-icon>{{ getStatusIcon(status.value) }}</mat-icon>
                      <span>{{ status.label }}</span>
                      @if (item.status === status.value) {
                        <mat-icon class="ml-auto">check</mat-icon>
                      }
                    </button>
                  }
                  <mat-divider></mat-divider>
                  <button mat-menu-item>
                    <mat-icon>content_copy</mat-icon>
                    <span>Duplicar</span>
                  </button>
                  <button mat-menu-item class="text-red-500">
                    <mat-icon>delete</mat-icon>
                    <span>Eliminar</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        } @else {
          <div class="empty-state">
            <mat-icon>emoji_events</mat-icon>
            <h3>No hay campeonatos</h3>
            <p>Crea tu primer campeonato para comenzar</p>
            <button matButton="filled" routerLink="/admin/championships/new">
              <mat-icon>add</mat-icon>
              Crear Campeonato
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .page-container {
      padding: 1.5rem;
      max-width: 1200px;
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

    .content-card {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      overflow: hidden;
    }

    .sport-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .status-draft {
      --mat-chip-label-text-color: #6b7280;
      --mat-chip-elevated-container-color: rgba(107, 114, 128, 0.15);
    }

    .status-active {
      --mat-chip-label-text-color: #22c55e;
      --mat-chip-elevated-container-color: rgba(34, 197, 94, 0.15);
    }

    .status-finished {
      --mat-chip-label-text-color: #3b82f6;
      --mat-chip-elevated-container-color: rgba(59, 130, 246, 0.15);
    }

    .status-registration {
      --mat-chip-label-text-color: #f59e0b;
      --mat-chip-elevated-container-color: rgba(245, 158, 11, 0.15);
    }

    .status-cancelled {
      --mat-chip-label-text-color: #ef4444;
      --mat-chip-elevated-container-color: rgba(239, 68, 68, 0.15);
    }

    .status-select {
      width: 140px;
      font-size: 0.875rem;
    }

    .status-select ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .selected-status {
      background-color: var(--mat-sys-surface-container-high);
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
        margin: 0 0 1.5rem;
      }
    }
  `,
})
export default class ChampionshipsListPage {
  displayedColumns = ['name', 'sport', 'teams', 'status', 'actions'];

  championshipService = inject(ChampionshipService);
  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);

  championships = signal<Championship[]>([]);

  availableStatuses: { value: ChampionshipStatus; label: string }[] = [
    { value: 'draft', label: 'Borrador' },
    { value: 'registration', label: 'Inscripciones' },
    { value: 'active', label: 'Activo' },
    { value: 'finished', label: 'Finalizado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user && user.organizationId) {
        this.championshipService.getChampionships(user.organizationId).subscribe((data) => {
          this.championships.set(data);
        });
      }
    });
  }

  getSportIcon(sport: Sport): string {
    return SPORT_CONFIGS[sport]?.icon || 'sports_soccer';
  }

  getSportLabel(sport: Sport): string {
    return SPORT_CONFIGS[sport]?.label || sport;
  }

  getSportColor(sport: Sport): string {
    const colors: Record<string, string> = {
      football: '#22c55e',
      basketball: '#f59e0b',
      volleyball: '#3b82f6',
    };
    return colors[sport] || '#6b7280';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Borrador',
      registration: 'Inscripciones',
      active: 'Activo',
      finished: 'Finalizado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  }

  getStatusIcon(status: ChampionshipStatus): string {
    const icons: Record<ChampionshipStatus, string> = {
      draft: 'drafts',
      registration: 'how_to_reg',
      active: 'play_circle',
      finished: 'check_circle',
      cancelled: 'cancel',
    };
    return icons[status] || 'help';
  }

  updateChampionshipStatus(championshipId: string, newStatus: ChampionshipStatus): void {
    this.championshipService.updateChampionship(championshipId, { status: newStatus }).subscribe({
      next: (updatedChampionship) => {
        // Update the championship in the list
        this.championships.update((champs) =>
          champs.map((c) => (c.id === championshipId ? updatedChampionship : c)),
        );
        this.snackBar.open(`Estado cambiado a "${this.getStatusLabel(newStatus)}"`, 'Cerrar', {
          duration: 3000,
        });
      },
      error: (error) => {
        console.error('Error updating championship status', error);
        this.snackBar.open('Error al cambiar el estado del campeonato', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }
}
