import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  readonly returnUrl = input('/');
  readonly error = input<string | undefined>();

  protected readonly authEnabled = environment.authEnabled;
  protected readonly errorMessage = computed(() => {
    switch (this.error()) {
      case 'access_denied':
        return 'Anmeldung wurde abgebrochen.';
      case 'expired':
        return 'Anmeldung ist abgelaufen. Bitte erneut versuchen.';
      case 'failed':
        return 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.';
      default:
        return null;
    }
  });

  signIn(): void {
    if (!this.authEnabled) {
      return;
    }

    const returnUrl = encodeURIComponent(this.safeReturnUrl(this.returnUrl()));
    window.location.href = `${environment.bffUrl}/auth/login?returnUrl=${returnUrl}`;
  }

  private safeReturnUrl(url: string): string {
    return url.startsWith('/') && !url.startsWith('//') ? url : '/';
  }
}
