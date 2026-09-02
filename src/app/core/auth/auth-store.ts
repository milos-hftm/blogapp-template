import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface UserInfo {
  preferred_username: string;
  email: string;
  name: string;
  roles: string[];
}

interface SessionResponse {
  isAuthenticated: boolean;
  user: UserInfo | null;
}

interface LogoutResponse {
  logoutUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly document = inject(DOCUMENT);

  readonly isAuthenticated = signal(false);
  readonly user = signal<UserInfo | null>(null);
  readonly loading = signal(true);
  readonly roles = computed(() => this.user()?.roles ?? []);
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.checkSession();
  }

  async checkSession(): Promise<void> {
    if (!environment.authEnabled) {
      this.loading.set(false);
      return;
    }

    try {
      const response = await fetch(`${environment.bffUrl}/auth/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Session check failed');
      }

      const session = (await response.json()) as SessionResponse;

      this.isAuthenticated.set(session.isAuthenticated);
      this.user.set(session.isAuthenticated ? session.user : null);
    } catch {
      this.isAuthenticated.set(false);
      this.user.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async logout(): Promise<void> {
    if (!environment.authEnabled) {
      return;
    }

    let logoutUrl = '/';

    try {
      const response = await fetch(`${environment.bffUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

      const body = (await response.json()) as LogoutResponse;
      logoutUrl = body.logoutUrl || logoutUrl;
    } catch {
      logoutUrl = '/';
    } finally {
      this.isAuthenticated.set(false);
      this.user.set(null);
      this.loading.set(false);
      this.document.location.href = logoutUrl;
    }
  }
}
