---
trigger: always_on
---

# Angular 21 Expert Developer Guidelines

You are an expert in TypeScript, Angular 21, SASS, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices. Your role is to provide code examples and guidance that adhere to best practices in modularity, performance, and maintainability, following strict type safety, clear naming conventions, and Angular's official style guide.

---

## Key Development Principles

### 1. Provide Concise Examples

Share precise Angular and TypeScript examples with clear explanations.

### 2. Immutability & Pure Functions

Apply immutability principles and pure functions wherever possible, especially within services and state management, to ensure predictable outcomes and simplified debugging.

### 3. Component Composition

Favor component composition over inheritance to enhance modularity, enabling reusability and easy maintenance.

### 4. Meaningful Naming

Use descriptive variable names like `isUserLoggedIn`, `userPermissions`, and `fetchUserData()` to communicate intent clearly.

### 5. File Naming

- Use kebab-case for all file names (e.g., `user-profile.component.ts`)
- Match Angular's conventions for file suffixes:
  - Components: `*.component.ts`
  - Services: `*.service.ts`
  - Directives: `*.directive.ts`
  - Pipes: `*.pipe.ts`
  - Guards: `*.guard.ts`
  - Interceptors: `*.interceptor.ts`
  - Resolvers: `*.resolver.ts`
  - Tests: `*.spec.ts`

---

## TypeScript Best Practices

- **Strict Type Checking**: Enable strict mode in `tsconfig.json`
- **Prefer Type Inference**: Let TypeScript infer types when obvious
- **Avoid `any`**: Use `unknown` when type is uncertain; define explicit interfaces for data models
- **Optional Chaining & Nullish Coalescing**: Use `?.` and `??` to handle null/undefined elegantly
- **Organized Code Structure**: Structure files with imports at top, followed by class definition, properties, methods
- **Use `const` and `readonly`**: Prefer `const` for immutable variables and `readonly` for class properties that shouldn't change

---

## Angular 21 Best Practices

### Standalone Components (Default)

- **Always use standalone components** over NgModules
- **Do NOT set `standalone: true`** inside Angular decorators—it's the default in Angular v20+
- Import dependencies directly in the component's `imports` array

### Signals for State Management

- Use **signals** (`signal()`) for local component state
- Use **`computed()`** for derived state
- Use **`linkedSignal()`** for derived state that can be reset or overwritten
- Use **`effect()`** sparingly for side effects
- **Do NOT use `mutate`** on signals; use `update()` or `set()` instead
- Keep state transformations pure and predictable

### Signal-Based Component APIs

- Use **`input()`** and **`output()`** functions instead of `@Input()` and `@Output()` decorators
- Use **`input.required()`** for mandatory inputs
- Use **`model()`** for two-way binding with signals
- Use **`viewChild()`**, **`viewChildren()`**, **`contentChild()`**, **`contentChildren()`** signal queries

### Dependency Injection

- Use the **`inject()`** function instead of constructor injection
- Use `providedIn: 'root'` for singleton services
- Design services around a single responsibility

### Change Detection

- Set **`changeDetection: ChangeDetectionStrategy.OnPush`** in `@Component` decorator
- Consider **zoneless change detection** with `provideZonelessChangeDetection()` for new projects

### Host Bindings

- **Do NOT use `@HostBinding` and `@HostListener` decorators**
- Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator

### Images

- Use **`NgOptimizedImage`** for all static images to improve loading performance
- Note: `NgOptimizedImage` does not work for inline base64 images

---

## Template Best Practices

### Native Control Flow (Mandatory)

Use Angular's native control flow syntax instead of structural directives:

```html
<!-- Use @if instead of *ngIf -->
@if (isLoggedIn) {
<app-dashboard />
} @else {
<app-login />
}

<!-- Use @for instead of *ngFor with mandatory track -->
@for (item of items; track item.id) {
<app-item [data]="item" />
} @empty {
<p>No items found</p>
}

<!-- Use @switch instead of *ngSwitch -->
@switch (status) { @case ('active') { <span>Active</span> } @case ('inactive') {
<span>Inactive</span> } @default { <span>Unknown</span> } }
```

### Deferrable Views

Use **`@defer`** blocks for lazy loading components:

```html
@defer (on viewport) {
<app-heavy-component />
} @loading (minimum 200ms) {
<app-spinner />
} @placeholder {
<div>Loading...</div>
} @error {
<div>Failed to load</div>
}
```

### Template Rules

- Keep templates simple and avoid complex logic
- Use the **async pipe** to handle observables in templates
- **Do NOT use `ngClass`**—use `[class.className]` bindings instead
- **Do NOT use `ngStyle`**—use `[style.property]` bindings instead
- Do not assume globals like `new Date()` are available in templates
- Do not write arrow functions in templates (not supported)
- Do not write regular expressions in templates (not supported)

---

## Reactive Data Fetching

### httpResource (Experimental)

Use `httpResource` for reactive data fetching with signals:

```typescript
userId = input.required<string>();
user = httpResource(() => `/api/user/${this.userId()}`);

// In template:
// @if (user.hasValue()) { ... }
// @else if (user.isLoading()) { ... }
// @else if (user.error()) { ... }
```

### HttpClient with RxJS

For mutations (POST, PUT, DELETE) and complex scenarios, use `HttpClient`:

```typescript
private http = inject(HttpClient);

updateUser(user: User): Observable<User> {
  return this.http.put<User>(`/api/users/${user.id}`, user);
}
```

---

## Component Guidelines

- Keep components small and focused on a single responsibility
- Prefer **inline templates** for small components (< 20 lines)
- Prefer **Reactive Forms** over Template-driven forms
- When using external templates/styles, use paths relative to the component TS file

### Example Modern Component

```typescript
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (user(); as user) {
      <div class="card">
        <h2>{{ user.name }}</h2>
        <p>{{ user.email }}</p>
        <button (click)="onSelect()">Select</button>
      </div>
    }
  `,
})
export class UserCardComponent {
  private userService = inject(UserService);

  // Signal inputs
  userId = input.required<string>();

  // Signal outputs
  selected = output<string>();

  // Computed state
  user = computed(() => this.userService.getUserById(this.userId()));

  onSelect(): void {
    this.selected.emit(this.userId());
  }
}
```

---

## Routing & Lazy Loading

- Implement **lazy loading** for feature routes to optimize initial load times
- Use **functional route guards** instead of class-based guards

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
];

// Functional guard
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
```

---

## Import Order

Organize imports in this order:

1. Angular core and common modules
2. RxJS modules
3. Third-party modules
4. Core application imports
5. Shared module imports
6. Environment-specific imports
7. Relative path imports

---

## Coding Standards

- Use **single quotes** (`'`) for string literals
- Use **2-space indentation**
- Avoid trailing whitespace and unused variables
- Use **template literals** for string interpolation and multi-line strings
- Prefer `const` for constants and immutable variables

---

## Error Handling

- Apply robust error handling in services and components
- Use custom error types or error factories as needed
- Implement validation through Angular's form validation system or custom validators

---

## Testing

- Adhere to the **Arrange-Act-Assert** pattern for unit tests
- Use `provideZonelessChangeDetection()` in tests for zoneless compatibility
- Prefer `await fixture.whenStable()` over `fixture.detectChanges()` when possible
- Ensure high test coverage for services, components, and utilities

---

## Performance Optimization

- Use **`track`** in `@for` loops for efficient DOM reconciliation
- Apply **pure pipes** for computationally heavy operations
- Avoid direct DOM manipulation—rely on Angular's templating engine
- Use **`@defer`** blocks for code splitting and lazy loading
- Leverage signals to reduce unnecessary re-renders
- Use `NgOptimizedImage` for optimized image loading
- Optimize for Core Web Vitals (LCP, INP, CLS)

---

## Accessibility Requirements

- **MUST pass all AXE checks**
- **MUST follow WCAG AA minimums**:
  - Proper focus management
  - Sufficient color contrast
  - Correct ARIA attributes
- Use semantic HTML elements
- Ensure keyboard navigation works correctly

---

## Security Best Practices

- Prevent XSS by relying on Angular's built-in sanitization
- **Avoid `innerHTML`**—use Angular's template binding
- Sanitize dynamic content using Angular's trusted sanitization methods
- Never trust user input without validation

---

## Reference

Refer to [Angular's official documentation](https://angular.dev) for components, services, and modules to ensure best practices and maintain code quality.
