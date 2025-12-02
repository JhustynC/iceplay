import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

interface Organization {
  id: string;
  name: string;
  country: string;
  contactEmail: string;
  adminsCount: number;
  championshipsCount: number;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-organizations-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="page-title">Organizaciones</h1>
          <p class="page-subtitle">Gestiona todas las organizaciones del sistema</p>
        </div>
        <button matButton="filled" routerLink="/super-admin/organizations/new">
          <mat-icon>add</mat-icon>
          Nueva Organización
        </button>
      </header>

      <div class="content-card">
        <table mat-table [dataSource]="organizations()" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Organización</th>
            <td mat-cell *matCellDef="let org">
              <div class="flex items-center gap-3">
                <div class="org-avatar">{{ org.name.charAt(0) }}</div>
                <div>
                  <span class="font-medium">{{ org.name }}</span>
                  <span class="text-secondary block text-sm">{{ org.country }}</span>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="contact">
            <th mat-header-cell *matHeaderCellDef>Contacto</th>
            <td mat-cell *matCellDef="let org">{{ org.contactEmail }}</td>
          </ng-container>

          <ng-container matColumnDef="admins">
            <th mat-header-cell *matHeaderCellDef>Admins</th>
            <td mat-cell *matCellDef="let org">{{ org.adminsCount }}</td>
          </ng-container>

          <ng-container matColumnDef="championships">
            <th mat-header-cell *matHeaderCellDef>Campeonatos</th>
            <td mat-cell *matCellDef="let org">{{ org.championshipsCount }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let org">
              <mat-chip [class]="org.isActive ? 'status-active' : 'status-inactive'">
                {{ org.isActive ? 'Activa' : 'Inactiva' }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let org">
              <button matIconButton [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <a mat-menu-item [routerLink]="['/super-admin/organizations', org.id]">
                  <mat-icon>visibility</mat-icon>
                  Ver detalles
                </a>
                <button mat-menu-item>
                  <mat-icon>edit</mat-icon>
                  Editar
                </button>
                <button mat-menu-item>
                  <mat-icon>{{ org.isActive ? 'block' : 'check_circle' }}</mat-icon>
                  {{ org.isActive ? 'Desactivar' : 'Activar' }}
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
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
    .org-avatar {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }
    .status-active {
      --mat-chip-label-text-color: #22c55e;
      --mat-chip-elevated-container-color: rgba(34, 197, 94, 0.15);
    }
    .status-inactive {
      --mat-chip-label-text-color: #ef4444;
      --mat-chip-elevated-container-color: rgba(239, 68, 68, 0.15);
    }
  `,
})
export default class OrganizationsListPage {
  displayedColumns = ['name', 'contact', 'admins', 'championships', 'status', 'actions'];

  organizations = signal<Organization[]>([
    {
      id: '1',
      name: 'Liga Deportiva Quito Norte',
      country: 'Ecuador',
      contactEmail: 'admin@ligaquito.com',
      adminsCount: 2,
      championshipsCount: 4,
      isActive: true,
      createdAt: '2024-06-01',
    },
    {
      id: '2',
      name: 'Federación Baloncesto Guayaquil',
      country: 'Ecuador',
      contactEmail: 'admin@febg.com',
      adminsCount: 3,
      championshipsCount: 2,
      isActive: true,
      createdAt: '2024-08-15',
    },
    {
      id: '3',
      name: 'Club Deportivo Los Andes',
      country: 'Colombia',
      contactEmail: 'info@losandes.com',
      adminsCount: 1,
      championshipsCount: 1,
      isActive: false,
      createdAt: '2024-09-20',
    },
  ]);
}
