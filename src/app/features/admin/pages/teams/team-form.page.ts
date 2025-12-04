import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamService } from '../../../../core/services/team.service';
import { ChampionshipService } from '../../../../core/services/championship.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Championship } from '../../../../core/models/championship.model';
import { Team, UpdateTeamDto } from '../../../../core/models/team.model';

@Component({
  selector: 'app-team-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="flex items-center gap-3">
          <a matIconButton routerLink="/admin/teams">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <h1 class="page-title">{{ isEditMode() ? 'Editar Equipo' : 'Nuevo Equipo' }}</h1>
        </div>
      </header>

      @if (isLoading()) {
        <div class="content-card">
          <p class="text-secondary text-center py-8">Cargando...</p>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card">
          <div class="form-section">
            <h2 class="section-title">Información General</h2>

            <div class="form-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Campeonato</mat-label>
                <mat-select formControlName="championshipId">
                  @for (champ of championships(); track champ.id) {
                    <mat-option [value]="champ.id">{{ champ.name }}</mat-option>
                  }
                </mat-select>
                @if (form.controls.championshipId.hasError('required')) {
                  <mat-error>Selecciona un campeonato</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre del Equipo</mat-label>
                <input matInput formControlName="name" placeholder="Ej: Los Rayos FC" />
                @if (form.controls.name.hasError('required')) {
                  <mat-error>El nombre es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nombre Corto</mat-label>
                <input matInput formControlName="shortName" placeholder="Ej: RAY" maxlength="5" />
                @if (form.controls.shortName.hasError('required')) {
                  <mat-error>El nombre corto es requerido</mat-error>
                }
                @if (form.controls.shortName.hasError('maxlength')) {
                  <mat-error>Máximo 5 caracteres</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ciudad</mat-label>
                <input matInput formControlName="city" placeholder="Ej: Quito" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Estadio/Sede</mat-label>
                <input matInput formControlName="homeVenue" placeholder="Ej: Estadio Central" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>URL del Logo</mat-label>
                <input matInput formControlName="logo" placeholder="https://..." type="url" />
              </mat-form-field>
            </div>
          </div>

          <div class="form-section">
            <h2 class="section-title">Colores del Equipo</h2>

            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Color Principal</mat-label>
                <input matInput formControlName="primaryColor" type="color" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Color Secundario</mat-label>
                <input matInput formControlName="secondaryColor" type="color" />
              </mat-form-field>
            </div>
          </div>

          <div class="form-section">
            <h2 class="section-title">Información del Entrenador</h2>

            <div class="form-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre del Entrenador</mat-label>
                <input matInput formControlName="managerName" placeholder="Ej: Carlos Pérez" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="managerPhone" placeholder="+593..." />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="managerEmail" type="email" placeholder="entrenador@ejemplo.com" />
                @if (form.controls.managerEmail.hasError('email')) {
                  <mat-error>Ingresa un email válido</mat-error>
                }
              </mat-form-field>
            </div>
          </div>

          <div class="form-actions">
            <button matButton="outlined" type="button" routerLink="/admin/teams">Cancelar</button>
            <button matButton="filled" type="submit" [disabled]="form.invalid || isSaving()">
              <mat-icon>save</mat-icon>
              {{ isEditMode() ? 'Guardar Cambios' : 'Crear Equipo' }}
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
    .content-card {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      padding: 2rem;
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
export default class TeamFormPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private teamService = inject(TeamService);
  private championshipService = inject(ChampionshipService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  championships = signal<Championship[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  isEditMode = signal(false);
  teamId = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    championshipId: ['', Validators.required],
    name: ['', [Validators.required, Validators.minLength(3)]],
    shortName: ['', [Validators.required, Validators.maxLength(5)]],
    city: [''],
    homeVenue: [''],
    logo: [''],
    primaryColor: ['#1e40af', Validators.required],
    secondaryColor: ['#ffffff', Validators.required],
    managerName: [''],
    managerPhone: [''],
    managerEmail: ['', Validators.email],
  });

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user?.organizationId) {
        this.loadChampionships(user.organizationId);
      }
    });

    // Check if editing
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id && id !== 'new') {
        this.isEditMode.set(true);
        this.teamId.set(id);
        this.loadTeam(id);
      }
    });
  }

  private loadChampionships(organizationId: string): void {
    this.championshipService.getChampionships(organizationId).subscribe({
      next: (championships) => {
        // Include championships that are open for registration or active
        this.championships.set(
          championships.filter((c) => c.status === 'active' || c.status === 'registration' || c.status === 'draft')
        );
      },
      error: (error) => {
        console.error('Error loading championships', error);
      },
    });
  }

  private loadTeam(id: string): void {
    this.isLoading.set(true);
    this.teamService.getTeamById(id).subscribe({
      next: (team) => {
        this.form.patchValue({
          championshipId: team.championshipId,
          name: team.name,
          shortName: team.shortName,
          city: team.city || '',
          homeVenue: team.homeVenue || '',
          logo: team.logo || '',
          primaryColor: team.primaryColor,
          secondaryColor: team.secondaryColor,
          managerName: team.managerName || '',
          managerPhone: team.managerPhone || '',
          managerEmail: team.managerEmail || '',
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading team', error);
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const user = this.authService.currentUser();
    if (!user?.organizationId) {
      alert('Error: No se pudo obtener la organización del usuario');
      this.isSaving.set(false);
      return;
    }

    const formValue = this.form.getRawValue();
    const { championshipId, ...teamData } = formValue;

    if (this.isEditMode() && this.teamId()) {
      // Update existing team - include championshipId if it changed
      const updateData: UpdateTeamDto = {
        ...teamData,
        championshipId: championshipId, // Include championshipId in update
      };
      this.teamService.updateTeam(this.teamId()!, updateData).subscribe({
        next: () => {
          this.router.navigate(['/admin/teams']);
        },
        error: (error) => {
          console.error('Error updating team', error);
          alert('Error al actualizar el equipo');
          this.isSaving.set(false);
        },
      });
    } else {
      // Create new team
      this.teamService.createTeam({ ...teamData, championshipId, organizationId: user.organizationId }).subscribe({
        next: () => {
          this.router.navigate(['/admin/teams']);
        },
        error: (error) => {
          console.error('Error creating team', error);
          alert('Error al crear el equipo');
          this.isSaving.set(false);
        },
      });
    }
  }
}
