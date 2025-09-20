// src/app/_services/employee.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Employee {
  EmployeeID?: string;          // generated EMP###
  id?: number | string;         // DB primary key (if separate)
  accountId?: number | string;  // linked account
  email?: string;
  position?: string;
  department?: string;
  hireDate?: string;            // yyyy-mm-dd
  status?: 'active' | 'inactive';
  [key: string]: any;
}

export type CreateEmployeePayload = Partial<Employee>;

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private baseUrl = environment?.apiUrl
    ? environment.apiUrl.replace(/\/+$/, '')
    : '';

  constructor(private http: HttpClient) {}

  private buildUrl(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    if (!this.baseUrl) return p;
    return `${this.baseUrl}${p}`.replace(/\/\/+/g, '/').replace(':/', '://');
  }

  private buildHeaders(token?: string | null): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private handleError = (err: any) => {
    const payload = err?.error ?? err;
    console.error('[EmployeeService] error:', payload);
    return throwError(() => payload);
  };

  /** Get all employees */
  getAll(params?: Record<string, any>): Observable<Employee[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    const url = this.buildUrl('/employees');
    return this.http.get<Employee[]>(url, { params: httpParams }).pipe(
      tap(res => console.debug('[EmployeeService] getAll ->', res)),
      catchError(this.handleError)
    );
  }

  /** Get the next auto-generated EmployeeID (EMP###) */
  getNextId(): Observable<{ nextId: string }> {
    const url = this.buildUrl('/employees/next-id');
    return this.http.get<{ nextId: string }>(url).pipe(
      tap(res => console.debug('[EmployeeService] getNextId ->', res)),
      catchError(this.handleError)
    );
  }

  /** Create a new employee */
  create(payload: CreateEmployeePayload, token?: string | null): Observable<Employee> {
    const url = this.buildUrl('/employees');
    const headers = this.buildHeaders(token);
    return this.http.post<Employee>(url, payload, { headers }).pipe(
      tap(res => console.debug('[EmployeeService] create ->', res)),
      catchError(this.handleError)
    );
  }

  /** Get employee by ID */
  getById(id: string | number): Observable<Employee> {
    const url = this.buildUrl(`/employees/${id}`);
    return this.http.get<Employee>(url).pipe(
      tap(res => console.debug('[EmployeeService] getById ->', res)),
      catchError(this.handleError)
    );
  }

  /** Update employee */
  update(id: string | number, payload: Partial<Employee>, token?: string | null): Observable<Employee> {
    const url = this.buildUrl(`/employees/${id}`);
    const headers = this.buildHeaders(token);
    return this.http.put<Employee>(url, payload, { headers }).pipe(
      tap(res => console.debug('[EmployeeService] update ->', res)),
      catchError(this.handleError)
    );
  }

  /** Delete employee */
  delete(id: string | number, token?: string | null): Observable<any> {
    const url = this.buildUrl(`/employees/${id}`);
    const headers = this.buildHeaders(token);
    return this.http.delete(url, { headers }).pipe(
      tap(() => console.debug(`[EmployeeService] delete -> ${id}`)),
      catchError(this.handleError)
    );
  }
}
