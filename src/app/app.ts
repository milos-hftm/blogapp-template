import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { environment } from '../environments/environment';
import { AuthStore } from './core/auth/auth-store';
import { LayoutService } from './core/layout.service';

@Component({
  selector: 'app-root',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly authStore = inject(AuthStore);
  protected readonly layout = inject(LayoutService);

  private readonly themeStorageKey = 'blog-theme';

  protected readonly title = 'HFTM Web Applications (IN353)';
  protected readonly authEnabled = environment.authEnabled;
  protected readonly isDarkTheme = signal(this.getInitialTheme());
  protected readonly displayName = computed(
    () => this.authStore.user()?.preferred_username || this.authStore.user()?.name || '',
  );
  protected readonly canCreateBlog = computed(() => this.authStore.roles().includes('user'));

  constructor() {
    effect(() => {
      const darkTheme = this.isDarkTheme();

      document.body.classList.toggle('dark-theme', darkTheme);
      this.saveTheme(darkTheme);
    });
  }

  protected toggleTheme(): void {
    this.isDarkTheme.update((darkTheme) => !darkTheme);
  }

  protected logout(): void {
    void this.authStore.logout();
  }

  private getInitialTheme(): boolean {
    const storedTheme = this.readStoredTheme();

    if (storedTheme) {
      return storedTheme === 'dark';
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  private readStoredTheme(): string | null {
    try {
      return localStorage.getItem(this.themeStorageKey);
    } catch {
      return null;
    }
  }

  private saveTheme(darkTheme: boolean): void {
    try {
      localStorage.setItem(this.themeStorageKey, darkTheme ? 'dark' : 'light');
    } catch {
      return;
    }
  }
}
