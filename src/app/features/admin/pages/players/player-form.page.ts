import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  effect,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, RouterLink, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { PlayerService, CsvImportResult } from '../../../../core/services/player.service';
import { TeamService } from '../../../../core/services/team.service';
import { ChampionshipService } from '../../../../core/services/championship.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Player, PlayerStatus } from '../../../../core/models/player.model';
import { Team } from '../../../../core/models/team.model';
import { getSportConfig } from '../../../../core/models/sport-config.model';

@Component({
  selector: 'app-player-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="flex items-center gap-3">
          <a matIconButton routerLink="/admin/players">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <h1 class="page-title">{{ isEditMode() ? 'Editar Jugador' : 'Nuevo Jugador' }}</h1>
        </div>
      </header>

      @if (isLoading()) {
        <div class="content-card">
          <p class="text-secondary py-8 text-center">Cargando...</p>
        </div>
      } @else if (isEditMode()) {
        <!-- Edit mode: only show form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card">
          <div class="form-section">
            <h2 class="section-title">Información Personal</h2>

            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Equipo</mat-label>
                <mat-select formControlName="teamId" [disabled]="isEditMode()">
                  @for (team of teams(); track team.id) {
                    <mat-option [value]="team.id">{{ team.name }}</mat-option>
                  }
                </mat-select>
                @if (form.controls.teamId.hasError('required')) {
                  <mat-error>Selecciona un equipo</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Número</mat-label>
                <input matInput type="number" formControlName="number" min="1" max="99" />
                @if (form.controls.number.hasError('required')) {
                  <mat-error>El número es requerido</mat-error>
                }
                @if (form.controls.number.hasError('min') || form.controls.number.hasError('max')) {
                  <mat-error>El número debe estar entre 1 y 99</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="firstName" placeholder="Ej: Lionel" />
                @if (form.controls.firstName.hasError('required')) {
                  <mat-error>El nombre es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Apellido</mat-label>
                <input matInput formControlName="lastName" placeholder="Ej: Messi" />
                @if (form.controls.lastName.hasError('required')) {
                  <mat-error>El apellido es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Número de Identificación</mat-label>
                <input matInput formControlName="document" placeholder="Ej: 1234567890" />
                <mat-hint>Requerido para evitar duplicados</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Posición</mat-label>
                <mat-select formControlName="position">
                  @for (position of availablePositions(); track position.code) {
                    <mat-option [value]="position.code">{{ position.label }}</mat-option>
                  }
                </mat-select>
                @if (form.controls.position.hasError('required')) {
                  <mat-error>Selecciona una posición</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Posición Secundaria (opcional)</mat-label>
                <mat-select formControlName="secondaryPosition">
                  <mat-option value="">Ninguna</mat-option>
                  @for (position of availablePositions(); track position.code) {
                    <mat-option [value]="position.code">{{ position.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fecha de Nacimiento</mat-label>
                <input matInput [matDatepicker]="birthPicker" formControlName="birthDate" />
                <mat-datepicker-toggle matSuffix [for]="birthPicker" />
                <mat-datepicker #birthPicker />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nacionalidad</mat-label>
                <input matInput formControlName="nationality" placeholder="Ej: Ecuador" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Altura (cm)</mat-label>
                <input matInput type="number" formControlName="height" min="100" max="250" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Peso (kg)</mat-label>
                <input matInput type="number" formControlName="weight" min="30" max="200" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>URL de Foto</mat-label>
                <input matInput formControlName="photo" placeholder="https://..." type="url" />
              </mat-form-field>
            </div>
          </div>

          @if (isEditMode()) {
            <div class="form-section">
              <h2 class="section-title">Estado</h2>

              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Estado</mat-label>
                  <mat-select formControlName="status">
                    <mat-option value="active">Activo</mat-option>
                    <mat-option value="injured">Lesionado</mat-option>
                    <mat-option value="suspended">Suspendido</mat-option>
                    <mat-option value="inactive">Inactivo</mat-option>
                  </mat-select>
                </mat-form-field>

                @if (form.controls.status.value === 'suspended') {
                  <mat-form-field appearance="outline">
                    <mat-label>Fecha de Fin de Suspensión</mat-label>
                    <input
                      matInput
                      [matDatepicker]="suspensionPicker"
                      formControlName="suspensionEndDate"
                    />
                    <mat-datepicker-toggle matSuffix [for]="suspensionPicker" />
                    <mat-datepicker #suspensionPicker />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Razón de Suspensión</mat-label>
                    <textarea matInput formControlName="suspensionReason" rows="2"></textarea>
                  </mat-form-field>
                }
              </div>
            </div>
          }

          <div class="form-actions">
            <button matButton="outlined" type="button" routerLink="/admin/players">Cancelar</button>
            <button matButton="filled" type="submit" [disabled]="form.invalid || isSaving()">
              <mat-icon>save</mat-icon>
              {{ isEditMode() ? 'Guardar Cambios' : 'Crear Jugador' }}
            </button>
          </div>
        </form>
      } @else {
        <!-- Create mode: show tabs for manual or CSV import -->
        <mat-tab-group class="form-card">
          <mat-tab label="Crear Manualmente">
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-content">
              <div class="form-section">
                <h2 class="section-title">Información Personal</h2>

                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Equipo</mat-label>
                    <mat-select formControlName="teamId">
                      @for (team of teams(); track team.id) {
                        <mat-option [value]="team.id">{{ team.name }}</mat-option>
                      }
                    </mat-select>
                    @if (form.controls.teamId.hasError('required')) {
                      <mat-error>Selecciona un equipo</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Número</mat-label>
                    <input matInput type="number" formControlName="number" min="0" max="99" />
                    @if (form.controls.number.hasError('required')) {
                      <mat-error>El número es requerido</mat-error>
                    }
                    @if (form.controls.number.hasError('min')) {
                      <mat-error>El número debe ser minimo 0</mat-error>
                    }
                    @if (form.controls.number.hasError('max')) {
                      <mat-error>El número debe ser menor a 100</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Nombre</mat-label>
                    <input matInput formControlName="firstName" placeholder="Ej: Lionel" />
                    @if (form.controls.firstName.hasError('required')) {
                      <mat-error>El nombre es requerido</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Apellido</mat-label>
                    <input matInput formControlName="lastName" placeholder="Ej: Messi" />
                    @if (form.controls.lastName.hasError('required')) {
                      <mat-error>El apellido es requerido</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Número de Identificación</mat-label>
                    <input matInput formControlName="document" placeholder="Ej: 1234567890" />
                    <mat-hint>Requerido para evitar duplicados</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Posición</mat-label>
                    <mat-select formControlName="position">
                      @for (position of availablePositions(); track position.code) {
                        <mat-option [value]="position.code">{{ position.label }}</mat-option>
                      }
                    </mat-select>
                    @if (form.controls.position.hasError('required')) {
                      <mat-error>Selecciona una posición</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Posición Secundaria (opcional)</mat-label>
                    <mat-select formControlName="secondaryPosition">
                      <mat-option value="">Ninguna</mat-option>
                      @for (position of availablePositions(); track position.code) {
                        <mat-option [value]="position.code">{{ position.label }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Fecha de Nacimiento</mat-label>
                    <input matInput [matDatepicker]="birthPicker" formControlName="birthDate" />
                    <mat-datepicker-toggle matSuffix [for]="birthPicker" />
                    <mat-datepicker #birthPicker />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Nacionalidad</mat-label>
                    <input matInput formControlName="nationality" placeholder="Ej: Ecuador" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Altura (cm)</mat-label>
                    <input matInput type="number" formControlName="height" min="100" max="250" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Peso (kg)</mat-label>
                    <input matInput type="number" formControlName="weight" min="30" max="200" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>URL de Foto</mat-label>
                    <input matInput formControlName="photo" placeholder="https://..." type="url" />
                  </mat-form-field>
                </div>
              </div>

              <div class="form-actions">
                <button matButton="outlined" type="button" routerLink="/admin/players">
                  Cancelar
                </button>
                <button matButton="filled" type="submit" [disabled]="form.invalid || isSaving()">
                  <mat-icon>save</mat-icon>
                  Crear Jugador
                </button>
              </div>
            </form>
          </mat-tab>

          <mat-tab label="Importar desde CSV">
            <div class="form-content">
              <div class="form-section">
                <h2 class="section-title">Importar Jugadores desde CSV</h2>
                <p class="section-description">
                  Selecciona un equipo y sube un archivo CSV con el siguiente formato:
                </p>
                <div class="csv-format">
                  <code>
                    documento,nombre,apellido,numero,posicion,fecha_nacimiento,nacionalidad,altura,peso<br />
                    1234567890,Juan,Pérez,10,DEL,1995-05-15,Ecuador,175,70<br />
                    0987654321,Carlos,Rodríguez,7,MED,1998-03-20,Ecuador,180,75
                  </code>
                </div>
                <p class="csv-note">
                  <strong>Nota:</strong> Los campos documento, nombre, apellido, numero y posicion
                  son obligatorios. Los demás campos son opcionales.
                </p>

                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Equipo</mat-label>
                    <mat-select [(ngModel)]="csvTeamId">
                      @for (team of teams(); track team.id) {
                        <mat-option [value]="team.id">{{ team.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <div class="file-upload-area full-width">
                    <input
                      type="file"
                      accept=".csv"
                      (change)="onFileSelected($event)"
                      #fileInput
                      class="file-input"
                    />
                    <button matButton="outlined" type="button" (click)="fileInput.click()">
                      <mat-icon>upload_file</mat-icon>
                      Seleccionar archivo CSV
                    </button>
                    @if (selectedFileName()) {
                      <span class="file-name">{{ selectedFileName() }}</span>
                    }
                  </div>
                </div>

                @if (isImporting()) {
                  <div class="import-progress">
                    <mat-spinner [diameter]="30"></mat-spinner>
                    <span>Importando jugadores...</span>
                  </div>
                }

                @if (importResult(); as result) {
                  <div class="import-result">
                    <h3>Resultado de la Importación</h3>
                    <div class="result-stats">
                      <div class="stat-item success">
                        <mat-icon>check_circle</mat-icon>
                        <span>{{ result.playersImported }} jugadores importados</span>
                      </div>
                      @if (result.playersSkipped.length > 0) {
                        <div class="stat-item warning">
                          <mat-icon>warning</mat-icon>
                          <span>{{ result.playersSkipped.length }} jugadores omitidos</span>
                        </div>
                      }
                      @if (result.errors.length > 0) {
                        <div class="stat-item error">
                          <mat-icon>error</mat-icon>
                          <span>{{ result.errors.length }} errores</span>
                        </div>
                      }
                    </div>

                    @if (result.warnings.length > 0) {
                      <div class="warnings-list">
                        <h4>Advertencias:</h4>
                        <ul>
                          @for (warning of result.warnings; track $index) {
                            <li>{{ warning }}</li>
                          }
                        </ul>
                      </div>
                    }

                    @if (result.errors.length > 0) {
                      <div class="errors-list">
                        <h4>Errores:</h4>
                        <ul>
                          @for (error of result.errors; track $index) {
                            <li>{{ error }}</li>
                          }
                        </ul>
                      </div>
                    }

                    <div class="form-actions">
                      <button matButton="filled" (click)="clearImportResult()">
                        <mat-icon>close</mat-icon>
                        Cerrar
                      </button>
                      <button matButton="outlined" routerLink="/admin/players">
                        Ver Jugadores
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
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
    .form-content {
      padding: 1.5rem 0;
    }
    .section-description {
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 1rem;
    }
    .csv-format {
      background: var(--mat-sys-surface-container-high);
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      overflow-x: auto;
      code {
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
        white-space: pre;
      }
    }
    .csv-note {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }
    .file-upload-area {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 2px dashed var(--mat-sys-outline-variant);
      border-radius: 8px;
      .file-input {
        display: none;
      }
      .file-name {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.875rem;
      }
    }
    .import-progress {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      margin: 1rem 0;
    }
    .import-result {
      margin-top: 1.5rem;
      padding: 1.5rem;
      background: var(--mat-sys-surface-container-high);
      border-radius: 8px;
      h3 {
        margin: 0 0 1rem;
        font-size: 1.125rem;
      }
      .result-stats {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: 6px;
          &.success {
            background: rgba(34, 197, 94, 0.1);
            color: #22c55e;
          }
          &.warning {
            background: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
          }
          &.error {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
          }
        }
      }
      .warnings-list,
      .errors-list {
        margin-top: 1rem;
        h4 {
          margin: 0 0 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }
        ul {
          margin: 0;
          padding-left: 1.5rem;
          li {
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
          }
        }
      }
      .warnings-list {
        color: #f59e0b;
      }
      .errors-list {
        color: #ef4444;
      }
    }
  `,
})
export default class PlayerFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private playerService = inject(PlayerService);
  private teamService = inject(TeamService);
  private championshipService = inject(ChampionshipService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);

  teams = signal<Team[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  isEditMode = signal(false);
  playerId = signal<string | null>(null);
  selectedTeam = signal<Team | null>(null);

  // CSV Import
  csvTeamId = '';
  selectedFileName = signal<string | null>(null);
  isImporting = signal(false);
  importResult = signal<CsvImportResult | null>(null);

  form = this.fb.group({
    teamId: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    document: [''],
    number: [null as number | null, [Validators.required, Validators.min(0), Validators.max(99)]],
    position: ['', Validators.required],
    secondaryPosition: [''],
    birthDate: [null as Date | null],
    nationality: [''],
    height: [null as number | null],
    weight: [null as number | null],
    photo: [''],
    status: ['active' as PlayerStatus],
    suspensionEndDate: [null as Date | null],
    suspensionReason: [''],
  });

  constructor() {
    // Load teams
    effect(() => {
      const user = this.authService.currentUser();
      if (user?.organizationId) {
        this.loadTeams(user.organizationId);
      }
    });

    // Check if editing
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      const teamId = this.route.snapshot.queryParamMap.get('teamId');
      if (id && id !== 'new') {
        this.isEditMode.set(true);
        this.playerId.set(id);
        this.loadPlayer(id);
      } else if (teamId) {
        // Pre-select team if coming from team detail
        this.form.patchValue({ teamId });
        this.loadTeamForPositions(teamId);
      }
    });

    // Update positions when team changes
    effect(() => {
      const teamId = this.form.controls.teamId.value;
      if (teamId) {
        this.loadTeamForPositions(teamId);
      } else {
        // Clear positions if no team selected
        this.availablePositions.set([]);
      }
    });
  }

  ngOnInit(): void {
    // Reload teams when component initializes to ensure fresh data
    const user = this.authService.currentUser();
    if (user?.organizationId) {
      this.loadTeams(user.organizationId);
    }

    // Listen to team selection changes
    this.form.controls.teamId.valueChanges.subscribe((teamId) => {
      if (teamId) {
        // Update selectedTeam immediately from the teams list
        const team = this.teams().find((t) => t.id === teamId);
        if (team) {
          this.selectedTeam.set(team);
        }
        this.loadTeamForPositions(teamId);
      } else {
        this.selectedTeam.set(null);
        this.availablePositions.set([]);
      }
      this.cdr.markForCheck();
    });

    // Reload teams when navigating to this route (new player or edit player)
    // This ensures teams are refreshed when coming from team creation page
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd &&
            (event.urlAfterRedirects === '/admin/players/new' ||
              (event.urlAfterRedirects.startsWith('/admin/players/') &&
                event.urlAfterRedirects.includes('/edit'))),
        ),
      )
      .subscribe(() => {
        const user = this.authService.currentUser();
        if (user?.organizationId) {
          // Force reload teams when navigating to this page
          this.loadTeams(user.organizationId);
        }
      });
  }

  availablePositions = signal<{ code: string; label: string }[]>([]);

  private loadTeams(organizationId: string): void {
    this.teamService.getTeamsByOrganization(organizationId).subscribe({
      next: (teams) => {
        // Filter active teams and sort by name for better UX
        const activeTeams = teams
          .filter((t) => t.isActive)
          .sort((a, b) => a.name.localeCompare(b.name));
        this.teams.set(activeTeams);

        // If a team is already selected in the form, update selectedTeam
        const currentTeamId = this.form.controls.teamId.value;
        if (currentTeamId) {
          const team = activeTeams.find((t) => t.id === currentTeamId);
          if (team) {
            this.selectedTeam.set(team);
            // Reload positions if team was already selected
            this.loadTeamForPositions(currentTeamId);
          } else {
            // Team was removed or deactivated, clear selection
            this.form.patchValue({ teamId: '' });
            this.selectedTeam.set(null);
            this.availablePositions.set([]);
          }
        }

        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading teams', error);
        this.cdr.markForCheck();
      },
    });
  }

  private loadTeamForPositions(teamId: string): void {
    const team = this.teams().find((t) => t.id === teamId);
    if (team) {
      this.selectedTeam.set(team);
      this.loadPositionsFromChampionship(team.championshipId);
    }
  }

  private loadPositionsFromChampionship(championshipId: string): void {
    // Get championship to determine sport and positions
    this.championshipService.getChampionshipById(championshipId).subscribe({
      next: (championship) => {
        const sportConfig = getSportConfig(championship.sport);
        const positions = sportConfig.positions.map((pos) => ({
          code: pos.code,
          label: pos.label,
        }));
        this.availablePositions.set(positions);

        // Map old position values to new codes if needed
        const currentPosition = this.form.controls.position.value;
        if (currentPosition && !positions.find((p) => p.code === currentPosition)) {
          const mappedPosition = this.mapOldPositionToCode(currentPosition, championship.sport);
          if (mappedPosition) {
            this.form.patchValue({ position: mappedPosition });
          }
        }

        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading championship for positions', error);
        // Fallback to football positions if championship can't be loaded
        this.availablePositions.set([
          { code: 'GK', label: 'Portero' },
          { code: 'DEF', label: 'Defensa' },
          { code: 'MID', label: 'Mediocampista' },
          { code: 'FWD', label: 'Delantero' },
        ]);
        this.cdr.markForCheck();
      },
    });
  }

  private mapOldPositionToCode(oldPosition: string, sport: string): string | null {
    const positionMap: Record<string, Record<string, string>> = {
      football: {
        Forward: 'FWD',
        Midfielder: 'MID',
        Defender: 'DEF',
        Goalkeeper: 'GK',
        Goalie: 'GK',
        Striker: 'FWD',
        Winger: 'FWD',
        'Attacking Midfielder': 'MID',
        'Defensive Midfielder': 'MID',
        'Center Back': 'DEF',
        'Full Back': 'DEF',
      },
      basketball: {
        'Point Guard': 'PG',
        'Shooting Guard': 'SG',
        'Small Forward': 'SF',
        'Power Forward': 'PF',
        Center: 'C',
        Guard: 'PG',
        Forward: 'SF',
      },
      volleyball: {
        Setter: 'S',
        'Outside Hitter': 'OH',
        'Middle Blocker': 'MB',
        Opposite: 'OP',
        Libero: 'L',
      },
    };

    const normalizedOldPosition = oldPosition.trim();
    const sportMap = positionMap[sport];
    if (sportMap && sportMap[normalizedOldPosition]) {
      return sportMap[normalizedOldPosition];
    }

    // Try case-insensitive match
    for (const [key, value] of Object.entries(sportMap || {})) {
      if (key.toLowerCase() === normalizedOldPosition.toLowerCase()) {
        return value;
      }
    }

    return null;
  }

  private loadPlayer(id: string): void {
    this.isLoading.set(true);
    this.playerService.getPlayerById(id).subscribe({
      next: (player) => {
        // Map old position values to new codes if needed
        let mappedPosition = player.position;
        let mappedSecondaryPosition = player.secondaryPosition;

        // Load positions first to get the sport
        if (player.championshipId) {
          this.championshipService.getChampionshipById(player.championshipId).subscribe({
            next: (championship) => {
              const sportConfig = getSportConfig(championship.sport);
              const positions = sportConfig.positions.map((pos) => ({
                code: pos.code,
                label: pos.label,
              }));
              this.availablePositions.set(positions);

              // Map old positions to new codes
              if (player.position) {
                const mapped = this.mapOldPositionToCode(player.position, championship.sport);
                if (mapped) {
                  mappedPosition = mapped;
                }
              }
              if (player.secondaryPosition) {
                const mapped = this.mapOldPositionToCode(
                  player.secondaryPosition,
                  championship.sport,
                );
                if (mapped) {
                  mappedSecondaryPosition = mapped;
                }
              }

              // Now patch the form with mapped positions
              this.form.patchValue({
                teamId: player.teamId || '',
                firstName: player.firstName,
                lastName: player.lastName,
                document: player.document || '',
                number: player.number,
                position: mappedPosition,
                secondaryPosition: mappedSecondaryPosition || '',
                birthDate: player.birthDate || null,
                nationality: player.nationality || '',
                height: player.height || null,
                weight: player.weight || null,
                photo: player.photo || '',
                status: player.status || 'active',
                suspensionEndDate: player.suspensionEndDate || null,
                suspensionReason: player.suspensionReason || '',
              });

              this.cdr.markForCheck();
            },
            error: (error) => {
              console.error('Error loading championship', error);
              // Fallback: just patch the form without mapping
              this.form.patchValue({
                teamId: player.teamId || '',
                firstName: player.firstName,
                lastName: player.lastName,
                document: player.document || '',
                number: player.number,
                position: player.position,
                secondaryPosition: player.secondaryPosition || '',
                birthDate: player.birthDate || null,
                nationality: player.nationality || '',
                height: player.height || null,
                weight: player.weight || null,
                photo: player.photo || '',
                status: player.status || 'active',
                suspensionEndDate: player.suspensionEndDate || null,
                suspensionReason: player.suspensionReason || '',
              });
            },
          });
        }

        // Load positions for the dropdown
        if (player.teamId) {
          this.loadTeamForPositions(player.teamId);
        } else if (player.championshipId) {
          // Load positions directly from championship when player has no team
          this.loadPositionsFromChampionship(player.championshipId);
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading player', error);
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      // Log form errors for debugging
      console.log('Form is invalid:', this.form.errors);
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control && control.invalid) {
          console.log(`${key} errors:`, control.errors);
        }
      });
      return;
    }

    this.isSaving.set(true);
    const user = this.authService.currentUser();
    const formValue = this.form.getRawValue();
    const { teamId, ...playerData } = formValue;

    // Validate teamId is not null
    if (!teamId) {
      alert('Error: Por favor, selecciona un equipo válido.');
      this.isSaving.set(false);
      return;
    }

    // Get team from teams list instead of selectedTeam signal
    const team = this.teams().find((t) => t.id === teamId);
    if (!user?.organizationId || !team) {
      alert(
        'Error: No se pudo obtener la información necesaria. Por favor, selecciona un equipo válido.',
      );
      this.isSaving.set(false);
      return;
    }

    // Ensure required fields are not null and convert null to undefined for optional fields
    if (
      !playerData.firstName ||
      !playerData.lastName ||
      !playerData.number ||
      !playerData.position
    ) {
      alert('Error: Por favor, completa todos los campos requeridos.');
      this.isSaving.set(false);
      return;
    }

    // Convert null to undefined for optional fields and ensure required fields are valid
    const cleanPlayerData = {
      firstName: playerData.firstName,
      lastName: playerData.lastName,
      number: playerData.number,
      position: playerData.position,
      secondaryPosition: playerData.secondaryPosition || undefined,
      document: playerData.document || undefined,
      birthDate: playerData.birthDate || undefined,
      nationality: playerData.nationality || undefined,
      height: playerData.height || undefined,
      weight: playerData.weight || undefined,
      photo: playerData.photo || undefined,
    };

    if (this.isEditMode() && this.playerId()) {
      // Update existing player - include status and suspension fields
      // Also include teamId and championshipId to allow team changes
      const updateData = {
        ...cleanPlayerData,
        status: playerData.status || 'active',
        suspensionEndDate: playerData.suspensionEndDate || undefined,
        suspensionReason: playerData.suspensionReason || undefined,
        teamId: teamId, // Include teamId to allow team changes
        championshipId: team.championshipId, // Update championshipId if team changed
      };
      this.playerService.updatePlayer(this.playerId()!, updateData).subscribe({
        next: (updatedPlayer) => {
          // Show success message
          this.snackBar.open('Jugador actualizado exitosamente', 'Cerrar', { duration: 3000 });
          // Navigate back to list with a query param to force refresh
          this.router.navigate(['/admin/players'], { queryParams: { refresh: Date.now() } });
        },
        error: (error) => {
          console.error('Error updating player', error);
          this.snackBar.open('Error al actualizar el jugador', 'Cerrar', { duration: 3000 });
          this.isSaving.set(false);
        },
      });
    } else {
      // Create new player - ensure status is set to 'active' by default
      this.playerService
        .createPlayer({
          ...cleanPlayerData,
          teamId,
          championshipId: team.championshipId,
          organizationId: user.organizationId,
        })
        .subscribe({
          next: () => {
            this.router.navigate(['/admin/players']);
          },
          error: (error) => {
            console.error('Error creating player', error);
            alert('Error al crear el jugador');
            this.isSaving.set(false);
          },
        });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFileName.set(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      this.importCsv(content);
    };
    reader.readAsText(file);
  }

  importCsv(csvContent: string): void {
    if (!this.csvTeamId) {
      alert('Por favor selecciona un equipo primero');
      return;
    }

    const team = this.teams().find((t) => t.id === this.csvTeamId);
    const user = this.authService.currentUser();
    if (!team || !user?.organizationId) {
      alert('Error: No se pudo obtener la información necesaria');
      return;
    }

    this.isImporting.set(true);
    this.importResult.set(null);

    this.playerService
      .importPlayersFromCsv(this.csvTeamId, team.championshipId, user.organizationId, csvContent)
      .subscribe({
        next: (result) => {
          this.isImporting.set(false);
          this.importResult.set(result);
          if (result.playersImported > 0) {
            // Reload teams to update player count
            const user = this.authService.currentUser();
            if (user?.organizationId) {
              this.loadTeams(user.organizationId);
            }
          }
        },
        error: (error) => {
          this.isImporting.set(false);
          this.importResult.set({
            playersImported: 0,
            playersSkipped: [],
            warnings: [],
            errors: [error.message || 'Error al importar jugadores'],
          });
        },
      });
  }

  clearImportResult(): void {
    this.importResult.set(null);
    this.selectedFileName.set(null);
  }
}
