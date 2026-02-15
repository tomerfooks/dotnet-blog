import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { extractErrorMessage } from '../../../core/api/problem-details';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <h1>Create account</h1>
      <p class="muted">New users default to Guest unless another role is selected.</p>

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

        <label>
          Role (optional)
          <select formControlName="role">
            <option value="">Guest (default)</option>
            <option value="guest">Guest</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <button type="submit" [disabled]="loading">{{ loading ? 'Creating...' : 'Create account' }}</button>
        <small class="error" *ngIf="errorMessage">{{ errorMessage }}</small>
      </form>

      <p class="muted">Already have an account? <a routerLink="/signin">Sign in</a>.</p>
    </section>
  `
})
export class SignupPage {
  loading = false;
  errorMessage = '';
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
    role: ['']
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
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

    const value = this.form.getRawValue();
    this.authService
      .signup({
        email: value.email ?? '',
        password: value.password ?? '',
        role: (value.role || undefined) as 'guest' | 'editor' | 'admin' | undefined
      })
      .subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: (error) => {
          this.errorMessage = extractErrorMessage(error);
          this.loading = false;
        }
      });
  }
}
