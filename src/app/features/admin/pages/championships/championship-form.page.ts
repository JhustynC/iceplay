import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  computed,
} from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getAvailableSports } from '../../../../core/models';
import { ChampionshipService } from '../../../../core/services/championship.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  CreateChampionshipDto,
  UpdateChampionshipDto,
  getDefaultChampionshipSettings,
  ChampionshipFormat,
  ChampionshipSettings,
  Championship,
} from '../../../../core/models/championship.model';
import { Sport } from '../../../../core/models/sport-config.model';
import { filter, switchMap } from 'rxjs';

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
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="flex items-center gap-3">
          <a matIconButton routerLink="/admin/championships">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <div>
            <h1 class="page-title">
              {{ isEditMode() ? 'Editar Campeonato' : 'Nuevo Campeonato' }}
            </h1>
            <p class="page-subtitle">
              {{
                isEditMode()
                  ? 'Modifica los detalles del campeonato'
                  : 'Configura los detalles del campeonato'
              }}
            </p>
          </div>
        </div>
      </header>

      @if (isLoading()) {
        <div class="form-card flex items-center justify-center py-8">
          <mat-spinner [diameter]="40"></mat-spinner>
        </div>
      } @else {
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
                <mat-select formControlName="sport" [disabled]="isEditMode()">
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
                @if (isEditMode()) {
                  <mat-hint>El deporte no se puede cambiar después de crear el campeonato</mat-hint>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Temporada</mat-label>
                <input matInput formControlName="season" placeholder="Ej: 2024-2025" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Formato</mat-label>
                <mat-select formControlName="format" [disabled]="isEditMode()">
                  <mat-option value="league">Liga (Todos contra todos)</mat-option>
                  <mat-option value="knockout">Eliminación directa</mat-option>
                  <mat-option value="group_stage">Fase de grupos + Eliminación</mat-option>
                </mat-select>
                @if (isEditMode()) {
                  <mat-hint>El formato no se puede cambiar después de crear el campeonato</mat-hint>
                }
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
            <button
              matButton="outlined"
              type="button"
              routerLink="/admin/championships"
              [disabled]="isSaving()"
            >
              Cancelar
            </button>
            <button matButton="filled" type="submit" [disabled]="form.invalid || isSaving()">
              @if (isSaving()) {
                <mat-spinner [diameter]="20" class="mr-2"></mat-spinner>
              } @else {
                <mat-icon>save</mat-icon>
              }
              {{
                isSaving()
                  ? isEditMode()
                    ? 'Guardando...'
                    : 'Creando...'
                  : isEditMode()
                    ? 'Guardar Cambios'
                    : 'Crear Campeonato'
              }}
            </button>
          </div>
        </form>
      }
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
export default class ChampionshipFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private championshipService = inject(ChampionshipService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  availableSports = getAvailableSports();
  isSaving = signal(false);
  isLoading = signal(false);
  championshipId = signal<string | null>(null);
  championship = signal<Championship | null>(null);

  isEditMode = computed(() => !!this.championshipId());

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    sport: ['football' as Sport, Validators.required],
    season: ['2024-2025'],
    format: ['league' as ChampionshipFormat],
    startDate: [new Date(), Validators.required],
    description: [''],
    pointsForWin: [3],
    pointsForDraw: [1],
    pointsForLoss: [0],
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.championshipId.set(id);
        this.loadChampionship(id);
      }
    });
  }

  private loadChampionship(id: string): void {
    this.isLoading.set(true);
    this.championshipService.getChampionshipById(id).subscribe({
      next: (championship) => {
        this.championship.set(championship);
        // Parse date strings to Date objects
        const startDate =
          championship.startDate instanceof Date
            ? championship.startDate
            : new Date(championship.startDate);

        this.form.patchValue({
          name: championship.name,
          sport: championship.sport,
          season: championship.season,
          format: championship.format,
          startDate: startDate,
          description: championship.description || '',
          pointsForWin: championship.settings?.pointsForWin ?? 3,
          pointsForDraw: championship.settings?.pointsForDraw ?? 1,
          pointsForLoss: championship.settings?.pointsForLoss ?? 0,
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading championship', error);
        this.snackBar.open('Error al cargar el campeonato', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
        this.router.navigate(['/admin/championships']);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.authService.currentUser();
    if (!user?.organizationId) {
      this.snackBar.open('Error: No se pudo obtener la información de la organización', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.isSaving.set(true);
    const formValue = this.form.getRawValue();

    if (this.isEditMode() && this.championshipId()) {
      // Update existing championship
      const championship = this.championship();
      if (!championship) {
        this.snackBar.open('Error: No se pudo cargar el campeonato', 'Cerrar', { duration: 3000 });
        this.isSaving.set(false);
        return;
      }

      // Get current settings or defaults
      const currentSettings =
        championship.settings || getDefaultChampionshipSettings(championship.sport);

      // Merge settings with form values - ensure all required fields are present
      const settings: ChampionshipSettings = {
        ...currentSettings,
        pointsForWin: formValue.pointsForWin ?? currentSettings.pointsForWin,
        pointsForDraw: formValue.pointsForDraw ?? currentSettings.pointsForDraw,
        pointsForLoss: formValue.pointsForLoss ?? currentSettings.pointsForLoss,
        roundsCount: currentSettings.roundsCount,
        tiebreakers: currentSettings.tiebreakers,
        allowDraws: currentSettings.allowDraws,
        extraTimeAllowed: currentSettings.extraTimeAllowed,
        penaltyShootoutAllowed: currentSettings.penaltyShootoutAllowed,
        teamsPerGroup: currentSettings.teamsPerGroup,
        teamsAdvancePerGroup: currentSettings.teamsAdvancePerGroup,
      };

      const updateDto: UpdateChampionshipDto = {
        name: formValue.name,
        description: formValue.description || undefined,
        startDate: formValue.startDate,
        settings,
      };

      this.championshipService
        .updateChampionship(this.championshipId()!, {
          name: updateDto.name,
          description: updateDto.description,
          startDate: updateDto.startDate,
          settings: settings, // Pass complete settings
        } as Partial<Championship>)
        .subscribe({
          next: (updatedChampionship) => {
            this.snackBar.open('Campeonato actualizado exitosamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/admin/championships', updatedChampionship.id]);
          },
          error: (error) => {
            console.error('Error updating championship', error);
            this.snackBar.open('Error al actualizar el campeonato', 'Cerrar', { duration: 3000 });
            this.isSaving.set(false);
          },
        });
    } else {
      // Create new championship
      // Get default settings for the sport
      const defaultSettings = getDefaultChampionshipSettings(formValue.sport as Sport);

      // Merge settings with form values
      const settings: ChampionshipSettings = {
        ...defaultSettings,
        pointsForWin: formValue.pointsForWin ?? defaultSettings.pointsForWin,
        pointsForDraw: formValue.pointsForDraw ?? defaultSettings.pointsForDraw,
        pointsForLoss: formValue.pointsForLoss ?? defaultSettings.pointsForLoss,
      };

      // Create the championship DTO
      const createDto: CreateChampionshipDto = {
        name: formValue.name,
        sport: formValue.sport as Sport,
        format: formValue.format,
        season: formValue.season || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        startDate: formValue.startDate,
        description: formValue.description || undefined,
        settings,
      };

      // Create championship with organizationId
      this.championshipService
        .createChampionship({
          name: createDto.name,
          sport: createDto.sport,
          format: createDto.format,
          season: createDto.season,
          startDate: createDto.startDate,
          description: createDto.description,
          settings: settings, // Pass complete settings
          organizationId: user.organizationId,
          status: 'registration', // Start in registration mode
          totalTeams: 0,
          totalMatches: 0,
          matchesPlayed: 0,
        })
        .subscribe({
          next: (championship) => {
            this.snackBar.open('Campeonato creado exitosamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/admin/championships']);
          },
          error: (error) => {
            console.error('Error creating championship', error);
            this.snackBar.open('Error al crear el campeonato', 'Cerrar', { duration: 3000 });
            this.isSaving.set(false);
          },
        });
    }
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}
