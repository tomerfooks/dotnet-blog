import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AuthService } from './auth.service';
import { AuthStateService } from './auth-state.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshInFlight = false;

  constructor(
    private readonly authState: AuthStateService,
    private readonly authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const accessToken = this.authState.getAccessToken();
    const isAuthCall = request.url.includes(`${API_BASE_URL}/auth/`);

    const authorizedRequest = accessToken && !isAuthCall
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      : request;

    return next.handle(authorizedRequest).pipe(
      catchError((error: unknown) => {
        if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthCall) {
          return throwError(() => error);
        }

        if (this.refreshInFlight) {
          return throwError(() => error);
        }

        const refreshToken = this.authState.getRefreshToken();
        if (!refreshToken) {
          this.authState.clearSession();
          return throwError(() => error);
        }

        this.refreshInFlight = true;

        return this.authService.refresh({ refreshToken }).pipe(
          switchMap((session) => {
            this.refreshInFlight = false;
            const retried = request.clone({
              setHeaders: {
                Authorization: `Bearer ${session.accessToken}`
              }
            });
            return next.handle(retried);
          }),
          catchError((refreshError) => {
            this.refreshInFlight = false;
            this.authState.clearSession();
            return throwError(() => refreshError);
          })
        );
      })
    );
  }
}
