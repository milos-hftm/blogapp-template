import { Component, effect, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly themeStorageKey = 'blog-theme';

  protected readonly title = 'HFTM Web Applications (IN353)';
  protected readonly isDarkTheme = signal(this.getInitialTheme());

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
