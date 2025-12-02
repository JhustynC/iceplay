import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { getAvailableSports } from '../../../../core/models';

@Component({
  selector: 'app-championship-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="flex items-center gap-3">
          <a matIconButton routerLink="/admin/championships">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <div>
            <h1 class="page-title">Nuevo Campeonato</h1>
            <p class="page-subtitle">Configura los detalles del campeonato</p>
          </div>
        </div>
      </header>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card">
        <div class="form-section">
          <h2 class="section-title">Información General</h2>

          <div class="form-grid">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre del Campeonato</mat-label>
              <input matInput formControlName="name" placeholder="Ej: Liga Premier 2024" />
              @if (form.controls.name.hasError('required')) {
                <mat-error>El nombre es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Deporte</mat-label>
              <mat-select formControlName="sport">
                @for (sport of availableSports; track sport.sport) {
                  <mat-option [value]="sport.sport">
                    <div class="flex items-center gap-2">
                      <mat-icon>{{ sport.icon }}</mat-icon>
                      {{ sport.label }}
                    </div>
                  </mat-option>
                }
              </mat-select>
              @if (form.controls.sport.hasError('required')) {
                <mat-error>Selecciona un deporte</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Temporada</mat-label>
              <input matInput formControlName="season" placeholder="Ej: 2024-2025" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Formato</mat-label>
              <mat-select formControlName="format">
                <mat-option value="league">Liga (Todos contra todos)</mat-option>
                <mat-option value="knockout">Eliminación directa</mat-option>
                <mat-option value="group_stage">Fase de grupos + Eliminación</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fecha de Inicio</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
              <mat-datepicker-toggle matSuffix [for]="startPicker" />
              <mat-datepicker #startPicker />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción (opcional)</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>
          </div>
        </div>

        <div class="form-section">
          <h2 class="section-title">Configuración de Puntos</h2>

          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Puntos por Victoria</mat-label>
              <input matInput type="number" formControlName="pointsForWin" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Puntos por Empate</mat-label>
              <input matInput type="number" formControlName="pointsForDraw" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Puntos por Derrota</mat-label>
              <input matInput type="number" formControlName="pointsForLoss" />
            </mat-form-field>
          </div>
        </div>

        <div class="form-actions">
          <button matButton="outlined" type="button" routerLink="/admin/championships">
            Cancelar
          </button>
          <button matButton="filled" type="submit" [disabled]="form.invalid">
            <mat-icon>save</mat-icon>
            Crear Campeonato
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .page-container {
      padding: 1.5rem;
      max-width: 800px;
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

    .page-subtitle {
      color: var(--mat-sys-on-surface-variant);
      margin: 0.25rem 0 0;
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

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--mat-sys-outline-variant);
      margin-top: 1.5rem;
    }
  `,
})
export default class ChampionshipFormPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  availableSports = getAvailableSports();

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    sport: ['football', Validators.required],
    season: ['2024-2025'],
    format: ['league'],
    startDate: [new Date()],
    description: [''],
    pointsForWin: [3],
    pointsForDraw: [1],
    pointsForLoss: [0],
  });

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Form submitted:', this.form.getRawValue());
      // TODO: Call service to create championship
      this.router.navigate(['/admin/championships']);
    }
  }
}
