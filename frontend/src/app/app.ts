import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStateService } from './core/auth/auth-state.service';
import { AuthService } from './core/auth/auth.service';

type Theme = 'light' | 'dark';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly storageKey = 'blog-theme';
  protected theme: Theme = 'light';

  constructor(
    protected readonly authState: AuthStateService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.theme = this.getInitialTheme();
    this.applyTheme(this.theme);
  }

  protected toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.theme);
    localStorage.setItem(this.storageKey, this.theme);
  }

  protected isDarkMode(): boolean {
    return this.theme === 'dark';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigateByUrl('/signin'),
      error: () => this.router.navigateByUrl('/signin')
    });
  }

  private getInitialTheme(): Theme {
    const storedTheme = localStorage.getItem(this.storageKey);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
