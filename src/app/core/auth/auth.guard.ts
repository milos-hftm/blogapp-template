import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthStore } from './auth-store';

export const authGuard: CanMatchFn = async (route, segments: UrlSegment[]) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!environment.authEnabled) {
    return router.createUrlTree(['/']);
  }

  await authStore.ready;

  const expectedRoles = (route.data?.['roles'] as string[] | undefined) ?? [];
  const hasRole =
    expectedRoles.length === 0 || expectedRoles.every((role) => authStore.roles().includes(role));

  if (authStore.isAuthenticated() && hasRole) {
    return true;
  }

  const returnUrl = '/' + segments.map((segment) => segment.path).join('/');
  const queryParams: Record<string, string> = { returnUrl };

  if (authStore.isAuthenticated()) {
    queryParams['error'] = 'access_denied';
  }

  return router.createUrlTree(['/login'], { queryParams });
};
