import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, shareReplay, map } from 'rxjs/operators';
import { User, PageResponse, SingleUserResponse } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly userCache = new Map<number, User>();
  private readonly pageCache = new Map<number, PageResponse>();
  private readonly inFlightRequests = new Map<string, Observable<unknown>>();

  getUsers(page: number = 1): Observable<PageResponse> {
    const cached = this.pageCache.get(page);
    if (cached) {
      return of(cached);
    }

    const requestKey = `page-${page}`;
    const inFlight = this.inFlightRequests.get(requestKey);
    if (inFlight) {
      return inFlight as Observable<PageResponse>;
    }

    const request$ = this.http.get<PageResponse>(`${environment.apiBaseUrl}/users?page=${page}`).pipe(
      tap(response => {
        this.pageCache.set(page, response);
        response.data.forEach(user => this.userCache.set(user.id, user));
        this.inFlightRequests.delete(requestKey);
      }),
      shareReplay(1)
    );

    this.inFlightRequests.set(requestKey, request$);
    return request$;
  }

  getUser(id: number): Observable<User> {
    const cached = this.userCache.get(id);
    if (cached) {
      return of(cached);
    }

    const requestKey = `user-${id}`;
    const inFlight = this.inFlightRequests.get(requestKey);
    if (inFlight) {
      return inFlight as Observable<User>;
    }

    const request$ = this.http.get<SingleUserResponse>(`${environment.apiBaseUrl}/users/${id}`).pipe(
      map(response => response.data),
      tap(user => {
        this.userCache.set(id, user);
        this.inFlightRequests.delete(requestKey);
      }),
      shareReplay(1)
    );

    this.inFlightRequests.set(requestKey, request$);
    return request$;
  }

  clearCache(): void {
    this.userCache.clear();
    this.pageCache.clear();
    this.inFlightRequests.clear();
  }
}
