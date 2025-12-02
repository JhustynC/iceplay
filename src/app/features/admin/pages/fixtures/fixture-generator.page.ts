import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-fixture-generator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, MatButtonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="flex items-center gap-3">
          <a matIconButton routerLink="/admin/fixtures">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <h1 class="page-title">Generar Fixture</h1>
        </div>
      </header>
      <div class="content-card">
        <p class="text-secondary py-8 text-center">
          Generador automático de fixture (en desarrollo)
        </p>
      </div>
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
  `,
})
export default class FixtureGeneratorPage {}
