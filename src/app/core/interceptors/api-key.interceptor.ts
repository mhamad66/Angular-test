import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.apiKey && req.url.includes(environment.apiBaseUrl)) {
    const clonedReq = req.clone({
      setHeaders: {
        'x-api-key': environment.apiKey
      }
    });
    return next(clonedReq);
  }
  return next(req);
};
