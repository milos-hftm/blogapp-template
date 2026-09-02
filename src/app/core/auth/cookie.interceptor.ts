import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const cookieInterceptor: HttpInterceptorFn = (request, next) => {
  if (!environment.authEnabled || !request.url.startsWith(environment.bffUrl)) {
    return next(request);
  }

  return next(
    request.clone({
      withCredentials: true,
      setHeaders: { 'X-Requested-With': 'XMLHttpRequest' },
    }),
  );
};
