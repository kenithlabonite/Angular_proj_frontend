// src/app/_services/account.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Account } from '@app/_models';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
  private accountSubject: BehaviorSubject<Account | null>;
  public account: Observable<Account | null>;

  // store the refresh timer id
  private refreshTokenTimeout?: any;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // Restore account from localStorage if present
    const saved = this.safeGetLocalAccount();
    this.accountSubject = new BehaviorSubject<Account | null>(saved);
    this.account = this.accountSubject.asObservable();

    // If we restored an account, start the refresh timer
    if (saved && saved.jwtToken) {
      try {
        this.startRefreshTokenTimer();
      } catch (e) {
        // ignore timer start errors
        console.warn('Failed to start refresh token timer on init', e);
      }
    }
  }

  public get accountValue() {
    return this.accountSubject.value;
  }

  // ----------------- Auth actions -----------------
  login(email: string, password: string) {
    return this.http.post<any>(`${baseUrl}/authenticate`, { email, password }, { withCredentials: true })
      .pipe(map(account => {
        // store to localStorage and subject
        this.saveLocalAccount(account);
        this.accountSubject.next(account);
        this.startRefreshTokenTimer();
        return account;
      }));
  }

  logout() {
    // revoke token on server (best-effort)
    this.http.post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true }).subscribe({
      next: () => {},
      error: () => {}
    });

    this.stopRefreshTokenTimer();
    this.clearLocalAccount();
    this.accountSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  refreshToken() {
    return this.http.post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(map((account) => {
        if (account) {
          this.saveLocalAccount(account);
          this.accountSubject.next(account);
          this.startRefreshTokenTimer();
        }
        return account;
      }));
  }

  // ----------------- Account management -----------------
  register(account: Account) {
    return this.http.post(`${baseUrl}/register`, account);
  }

  verifyEmail(token: string) {
    return this.http.post(`${baseUrl}/verify-email`, { token });
  }

  forgotPassword(email: string) {
    return this.http.post(`${baseUrl}/forgot-password`, { email });
  }

  validateResetToken(token: string) {
    return this.http.post(`${baseUrl}/validate-reset-token`, { token });
  }

  resetPassword(token: string, password: string, confirmPassword: string) {
    return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
  }

  getAll() {
    return this.http.get<Account[]>(baseUrl);
  }

  getById(id: string) {
    return this.http.get<Account>(`${baseUrl}/${id}`);
  }

  create(params: any) {
    return this.http.post(baseUrl, params);
  }

  update(id: string, params: any) {
    return this.http.put(`${baseUrl}/${id}`, params)
      .pipe(map((account: any) => {
        // update the current account if it was updated
        if (account.id === this.accountValue?.id) {
          // merge updated fields into the stored account (preserve jwtToken)
          const merged = { ...this.accountValue, ...account };
          if (this.accountValue?.jwtToken) merged.jwtToken = this.accountValue.jwtToken;
          this.saveLocalAccount(merged);
          this.accountSubject.next(merged);
        }
        return account;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`)
      .pipe(finalize(() => {
        // auto logout if the logged in account was deleted
        if (id === this.accountValue?.id) {
          this.logout();
        }
      }));
  }

  // ----------------- Helpers: local storage & token timer -----------------
  private safeGetLocalAccount(): Account | null {
    try {
      const raw = localStorage.getItem('account');
      if (!raw) return null;
      return JSON.parse(raw) as Account;
    } catch {
      return null;
    }
  }

  private saveLocalAccount(account: Account | null) {
    try {
      if (!account) {
        localStorage.removeItem('account');
        return;
      }
      localStorage.setItem('account', JSON.stringify(account));
    } catch (e) {
      console.warn('Failed to save account to localStorage', e);
    }
  }

  private clearLocalAccount() {
    try {
      localStorage.removeItem('account');
    } catch { /* ignore */ }
  }

  private startRefreshTokenTimer() {
    this.stopRefreshTokenTimer();

    const token = this.accountValue?.jwtToken;
    if (!token) return;

    // parse json object from base64 encoded jwt token
    const parts = token.split('.');
    if (parts.length < 2) return;

    let jwtToken: any;
    try {
      jwtToken = JSON.parse(atob(parts[1]));
    } catch (e) {
      console.warn('Invalid JWT token format', e);
      return;
    }

    if (!jwtToken || !jwtToken.exp) return;

    // set a timeout to refresh the token a minute before it expires
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);

    // if timeout is negative (already expired) refresh immediately
    const effectiveTimeout = timeout > 0 ? timeout : 0;

    this.refreshTokenTimeout = setTimeout(() => {
      // call refresh and swallow errors (caller can handle)
      this.refreshToken().subscribe({
        next: () => {},
        error: () => {
          // if refresh fails, clear local session
          this.clearLocalAccount();
          this.accountSubject.next(null);
        }
      });
    }, effectiveTimeout);
  }

  private stopRefreshTokenTimer() {
    try {
      if (this.refreshTokenTimeout) {
        clearTimeout(this.refreshTokenTimeout);
        this.refreshTokenTimeout = undefined;
      }
    } catch { /* ignore */ }
  }
}
