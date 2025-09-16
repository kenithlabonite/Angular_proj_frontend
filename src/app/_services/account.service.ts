import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer, Subscription } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Account } from '@app/_models';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
  private accountSubject: BehaviorSubject<Account | null>;
  public account: Observable<Account | null>;

  // internal refresh subscription (uses timer + switchMap)
  private refreshSubscription?: Subscription;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    const saved = localStorage.getItem('account');
    this.accountSubject = new BehaviorSubject<Account | null>(saved ? JSON.parse(saved) : null);
    this.account = this.accountSubject.asObservable();

    // start refresh flow if there's a valid token loaded
    if (this.accountSubject.value?.jwtToken) {
      this.scheduleRefreshFromCurrentToken();
    }
  }

  public get accountValue(): Account | null {
    return this.accountSubject.value;
  }

  // ---------------- Auth actions ----------------

  login(email: string, password: string): Observable<Account> {
    return this.http.post<Account>(`${baseUrl}/authenticate`, { email, password }, { withCredentials: true })
      .pipe(
        tap(account => this.applyNewAccount(account)),
        catchError(err => this.handleError(err))
      );
  }

  logout(): void {
    // best-effort revoke
    this.http.post(`${baseUrl}/revoke-token`, {}, { withCredentials: true }).subscribe({
      error: () => { /* ignore revoke errors */ }
    });

    this.clearAccount();
    this.router.navigate(['/account/login']);
  }

  refreshToken(): Observable<Account> {
    return this.http.post<Account>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        tap(account => this.applyNewAccount(account)),
        catchError(err => this.handleError(err))
      );
  }

  // ---------------- Account CRUD ----------------

  register(account: Account) {
    return this.http.post(`${baseUrl}/register`, account).pipe(catchError(err => this.handleError(err)));
  }

  verifyEmail(token: string) {
    return this.http.post(`${baseUrl}/verify-email`, { token }).pipe(catchError(err => this.handleError(err)));
  }

  forgotPassword(email: string) {
    return this.http.post(`${baseUrl}/forgot-password`, { email }).pipe(catchError(err => this.handleError(err)));
  }

  validateResetToken(token: string) {
    return this.http.post(`${baseUrl}/validate-reset-token`, { token }).pipe(catchError(err => this.handleError(err)));
  }

  resetPassword(token: string, password: string, confirmPassword: string) {
    return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword })
      .pipe(catchError(err => this.handleError(err)));
  }

  getAll(): Observable<Account[]> {
    return this.http.get<Account[]>(baseUrl).pipe(catchError(err => this.handleError(err)));
  }

  getById(id: string): Observable<Account> {
    return this.http.get<Account>(`${baseUrl}/${id}`).pipe(catchError(err => this.handleError(err)));
  }

  create(params: any) {
    return this.http.post(baseUrl, params).pipe(catchError(err => this.handleError(err)));
  }

  update(id: string, params: any) {
    return this.http.put<Account>(`${baseUrl}/${id}`, params)
      .pipe(
        map(account => {
          // if the currently logged-in account was updated, merge & persist
          if (account && account.id === this.accountValue?.id) {
            const merged = { ...this.accountValue!, ...account };
            this.applyNewAccount(merged);
            return merged;
          }
          return account;
        }),
        catchError(err => this.handleError(err))
      );
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`)
      .pipe(
        tap(() => {
          if (id === this.accountValue?.id) {
            this.logout();
          }
        }),
        catchError(err => this.handleError(err))
      );
  }

  // ---------------- Helpers ----------------

  private applyNewAccount(account: Account | null) {
    // persist account to localStorage (change to sessionStorage if you prefer)
    if (account) {
      localStorage.setItem('account', JSON.stringify(account));
      this.accountSubject.next(account);
      this.scheduleRefreshFromCurrentToken();
    } else {
      this.clearAccount();
    }
  }

  private clearAccount() {
    localStorage.removeItem('account');
    this.accountSubject.next(null);
    this.cancelScheduledRefresh();
  }

  private scheduleRefreshFromCurrentToken() {
    this.cancelScheduledRefresh();

    const token = this.accountValue?.jwtToken;
    if (!token) return;

    const expiresInMs = this.computeMsUntilRefresh(token);
    if (expiresInMs <= 0) {
      // token expired / about to expire — refresh immediately
      this.refreshToken().subscribe({
        error: () => { /* caller should handle authentication errors */ }
      });
      return;
    }

    // use timer to trigger refresh, then switchMap to call refresh endpoint
    this.refreshSubscription = timer(expiresInMs).pipe(
      switchMap(() => this.refreshToken())
    ).subscribe({
      // subscription kept to allow cancellation later
      error: () => { /* ignore; other parts handle auth failures */ }
    });
  }

  private cancelScheduledRefresh() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = undefined;
    }
  }

  /**
   * Compute milliseconds until we should refresh the token.
   * We refresh 60 seconds before expiry (unless that yields <= 0).
   */
  private computeMsUntilRefresh(jwtToken: string): number {
    try {
      const parts = jwtToken.split('.');
      if (parts.length < 2) return 0;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload?.exp) return 0;
      const expiryMs = payload.exp * 1000;
      const refreshAt = expiryMs - (60 * 1000); // 1 minute before expiry
      return refreshAt - Date.now();
    } catch (e) {
      console.warn('Failed to parse JWT', e);
      return 0;
    }
  }

  private handleError(error: HttpErrorResponse) {
    // You can format detailed errors here if desired
    const err = error.error?.message || error.message || 'Server error';
    return throwError(() => ({ status: error.status, message: err }));
  }
}
