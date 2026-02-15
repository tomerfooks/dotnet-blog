import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { extractErrorMessage } from '../../../core/api/problem-details';

@Component({
  selector: 'app-signin-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <h1>Sign in</h1>
      <p class="muted">Access editor and admin features with your account.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="stack">
        <label>
          Email
          <input type="email" formControlName="email" />
        </label>
        <small class="error" *ngIf="showError('email')">Enter a valid email (max 256).</small>

        <label>
          Password
          <input type="password" formControlName="password" />
        </label>
        <small class="error" *ngIf="showError('password')">Password must be 8-128 characters.</small>

        <button type="submit" [disabled]="loading">{{ loading ? 'Signing in...' : 'Sign in' }}</button>
        <small class="error" *ngIf="errorMessage">{{ errorMessage }}</small>
      </form>

      <p class="muted">No account? <a routerLink="/signup">Create one</a>.</p>
    </section>
  `
})
export class SigninPage {
  loading = false;
  errorMessage = '';
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]]
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  showError(name: 'email' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.dirty || control.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.signin(this.form.getRawValue() as { email: string; password: string }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || '/');
      },
      error: (error) => {
        this.errorMessage = extractErrorMessage(error);
        this.loading = false;
      }
    });
  }
}
