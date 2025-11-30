import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HeaderActions } from './components/header-actions/header-actions';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, HeaderActions, RouterLink],
  template: `
    <mat-toolbar class="px-2! shadow-md sm:px-4!">
      <!-- Menu button (mobile only) -->
      <button matIconButton aria-label="Open menu" class="md:hidden">
        <mat-icon>menu</mat-icon>
      </button>

      <!-- Logo -->
      <a class="logo" routerLink="/">
        <span class="hidden sm:inline"><span class="ice">ICE</span>PLAY</span>
        <span class="sm:hidden"><span class="ice">I</span>P</span>
      </a>

      <span class="flex-1"></span>

      <app-header-actions />
    </mat-toolbar>
  `,
  styles: `
    :host {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .logo {
      font-family: 'Russo One', sans-serif;
      font-weight: 400;
      font-size: 1.25rem;
      letter-spacing: 0.09em;
      color: inherit;
      text-decoration: none;
      margin-left: 0.5rem;
      cursor: pointer;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.8;
      }

      @media (min-width: 640px) {
        margin-left: 0.75rem;
        font-size: 1.5rem;
      }

      .ice {
        color: #7dd3fc; // sky-300 - ice blue color
        text-shadow: 0 0 10px rgba(125, 211, 252, 0.5);
      }
    }
  `,
})
export class Header {}
