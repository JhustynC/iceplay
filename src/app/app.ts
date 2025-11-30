import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layouts/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  template: `
    <app-header></app-header>
    <router-outlet />
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: var(--mat-sys-surface);
    }
  `,
})
export class App {}
