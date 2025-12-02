import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-organization-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="flex items-center gap-3">
          <a matIconButton routerLink="/super-admin/organizations">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <div>
            <h1 class="page-title">Nueva Organización</h1>
            <p class="page-subtitle">Crear organización y su primer administrador</p>
          </div>
        </div>
      </header>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card">
        <div class="form-section">
          <h2 class="section-title">Información de la Organización</h2>

          <div class="form-grid">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre de la Organización</mat-label>
              <input matInput formControlName="name" placeholder="Ej: Liga Deportiva Norte" />
              @if (form.controls.name.hasError('required')) {
                <mat-error>El nombre es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>País</mat-label>
              <mat-select formControlName="country">
                <mat-option value="Ecuador">Ecuador</mat-option>
                <mat-option value="Colombia">Colombia</mat-option>
                <mat-option value="Peru">Perú</mat-option>
                <mat-option value="Mexico">México</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Ciudad</mat-label>
              <input matInput formControlName="city" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email de Contacto</mat-label>
              <input matInput type="email" formControlName="contactEmail" />
              @if (form.controls.contactEmail.hasError('email')) {
                <mat-error>Ingresa un email válido</mat-error>
              }
            </mat-form-field>
          </div>
        </div>

        <mat-divider />

        <div class="form-section">
          <h2 class="section-title">Primer Administrador</h2>
          <p class="section-description">
            Se creará un usuario administrador con acceso a esta organización
          </p>

          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="adminFirstName" />
              @if (form.controls.adminFirstName.hasError('required')) {
                <mat-error>El nombre es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Apellido</mat-label>
              <input matInput formControlName="adminLastName" />
              @if (form.controls.adminLastName.hasError('required')) {
                <mat-error>El apellido es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email del Administrador</mat-label>
              <input matInput type="email" formControlName="adminEmail" />
              @if (form.controls.adminEmail.hasError('required')) {
                <mat-error>El email es requerido</mat-error>
              } @else if (form.controls.adminEmail.hasError('email')) {
                <mat-error>Ingresa un email válido</mat-error>
              }
              <mat-hint>Se enviará una invitación a este correo</mat-hint>
            </mat-form-field>
          </div>
        </div>

        <div class="form-actions">
          <button matButton="outlined" type="button" routerLink="/super-admin/organizations">Cancelar</button>
          <button matButton="filled" type="submit" [disabled]="form.invalid">
            <mat-icon>save</mat-icon>
            Crear Organización
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
      padding: 1rem 0;
    }
    .section-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.5rem;
      color: var(--mat-sys-primary);
    }
    .section-description {
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
      margin: 0 0 1rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
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
      margin-top: 1rem;
    }
    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export default class OrganizationFormPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    country: ['Ecuador', Validators.required],
    city: [''],
    contactEmail: ['', [Validators.required, Validators.email]],
    adminFirstName: ['', Validators.required],
    adminLastName: ['', Validators.required],
    adminEmail: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Form submitted:', this.form.getRawValue());
      this.router.navigate(['/super-admin/organizations']);
    }
  }
}
