import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <!-- Back to Home Button -->
        <a routerLink="/matches" class="back-home-btn" aria-label="Volver al inicio">
          <mat-icon>arrow_back</mat-icon>
          <span>Volver al inicio</span>
        </a>

        <!-- Logo -->
        <div class="logo-section mt-9">
          <h1 class="logo"><span class="ice">ICE</span>PLAY</h1>
          <p class="subtitle">Panel de Administración</p>
        </div>

        <!-- Error Message -->
        @if (authService.error(); as error) {
          <div class="error-banner">
            <mat-icon>error_outline</mat-icon>
            <span>{{ error }}</span>
          </div>
        }

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <mat-form-field appearance="outline">
            <mat-label>Correo electrónico</mat-label>
            <input
              matInput
              type="email"
              formControlName="email"
              placeholder="admin@ejemplo.com"
              autocomplete="email"
            />
            <mat-icon matPrefix>email</mat-icon>
            @if (loginForm.controls.email.hasError('required')) {
              <mat-error>El correo es requerido</mat-error>
            } @else if (loginForm.controls.email.hasError('email')) {
              <mat-error>Ingresa un correo válido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Contraseña</mat-label>
            <input
              matInput
              [type]="hidePassword() ? 'password' : 'text'"
              formControlName="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <mat-icon matPrefix>lock</mat-icon>
            <button
              type="button"
              matIconButton
              matSuffix
              (click)="hidePassword.set(!hidePassword())"
              [attr.aria-label]="hidePassword() ? 'Mostrar contraseña' : 'Ocultar contraseña'"
            >
              <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (loginForm.controls.password.hasError('required')) {
              <mat-error>La contraseña es requerida</mat-error>
            } @else if (loginForm.controls.password.hasError('minlength')) {
              <mat-error>Mínimo 6 caracteres</mat-error>
            }
          </mat-form-field>

          @if (authService.isLoading()) {
            <button matButton="filled" type="submit" class="submit-btn" disabled>
              <span class="btn-content">
                <mat-spinner diameter="20" />
                <span>Ingresando...</span>
              </span>
            </button>
          } @else {
            <button
              matButton="filled"
              type="submit"
              class="submit-btn"
              [disabled]="loginForm.invalid"
            >
              <span class="btn-content">
                <mat-icon>login</mat-icon>
                <span>Ingresar</span>
              </span>
            </button>
          }
        </form>

        <!-- Demo Credentials -->
        <div class="demo-section">
          <p class="demo-title">Credenciales de demostración:</p>
          <div class="demo-credentials">
            <button
              type="button"
              class="demo-btn"
              (click)="fillDemoCredentials('super@fropen.com', 'admin123')"
            >
              <span class="demo-role">Super Admin</span>
              <span class="demo-email">super&#64;fropen.com</span>
            </button>
            <button
              type="button"
              class="demo-btn"
              (click)="fillDemoCredentials('admin@ligaquito.com', 'admin123')"
            >
              <span class="demo-role">Admin</span>
              <span class="demo-email">admin&#64;ligaquito.com</span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <p class="footer-text">
          Acceso exclusivo para administradores autorizados.
          <br />
          © {{ currentYear }} IcePlay by Fropen
        </p>
      </div>
    </div>
  `,
  styles: `
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: linear-gradient(
        135deg,
        var(--mat-sys-surface) 0%,
        var(--mat-sys-surface-container) 100%
      );
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: var(--mat-sys-surface-container);
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      position: relative;
    }

    .back-home-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.5rem;
      margin-bottom: 5rem;
      color: var(--mat-sys-on-surface-variant);
      text-decoration: none;
      font-size: 0.875rem;
      border-radius: 8px;
      transition: all 0.2s;
      position: absolute;
      top: 1rem;
      left: 1rem;

      &:hover {
        // background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-primary);
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .logo-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      font-family: 'Russo One', sans-serif;
      font-weight: 400;
      font-size: 2.5rem;
      letter-spacing: 0.09em;
      margin: 0;

      .ice {
        color: #7dd3fc;
        text-shadow: 0 0 20px rgba(125, 211, 252, 0.5);
      }
    }

    .subtitle {
      color: var(--mat-sys-on-surface-variant);
      margin: 1rem 0 0;
      font-size: 0.875rem;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: #f87171;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      mat-form-field {
        width: 100%;
      }
    }

    /* Fix visibility button inside form field */
    ::ng-deep .mat-mdc-form-field-icon-suffix {
      padding: 0 4px 0 0 !important;
    }

    .submit-btn {
      margin-top: 0.5rem;
      height: 48px;
      font-size: 1rem;
      width: 100%;
    }

    .btn-content {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin: 1rem 0;

      mat-spinner {
        flex-shrink: 0;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
    }

    .demo-section {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    .demo-title {
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
      text-align: center;
      margin: 0 0 0.75rem;
    }

    .demo-credentials {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .demo-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: var(--mat-sys-surface-container-high);
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--mat-sys-surface-container-highest);
        border-color: var(--mat-sys-primary);
      }

      .demo-role {
        font-weight: 600;
        font-size: 0.8125rem;
        color: var(--mat-sys-primary);
      }

      .demo-email {
        font-size: 0.75rem;
        color: var(--mat-sys-on-surface-variant);
        font-family: monospace;
      }
    }

    .footer-text {
      margin: 1.5rem 0 0;
      text-align: center;
      font-size: 0.75rem;
      color: var(--mat-sys-outline);
      line-height: 1.5;
    }
  `,
})
export default class LoginPage {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);

  hidePassword = signal(true);
  currentYear = new Date().getFullYear();

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.getRawValue();
    await this.authService.login({ email, password });
  }

  fillDemoCredentials(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
    this.authService.clearError();
  }
}
