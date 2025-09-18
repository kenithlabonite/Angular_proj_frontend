// src/app/_services/employee.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export type Employee = {
  EmployeeID?: number | string;
  id?: number | string;
  email?: string;
  position?: string;
  department?: string;
  hireDate?: string;
  status?: string;
  [key: string]: any;
};

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  // Use environment.apiUrl if provided; otherwise use relative base so dev proxy or same-origin works.
  private baseUrl = (environment && environment.apiUrl) ? environment.apiUrl.replace(/\/+$/, '') : '';

  constructor(private http: HttpClient) {}

  /**
   * Get all employees. Optionally pass query params (page, search, etc.) as an object.
   */
  getAll(params?: { [k: string]: any }): Observable<Employee[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => {
        const v = params[k];
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }

    const url = this.buildUrl('/employees');
    console.debug('EmployeeService.getAll() ->', url, 'params:', httpParams.toString());

    return this.http.get<Employee[]>(url, { params: httpParams }).pipe(
      tap(res => console.debug('EmployeeService.getAll() response:', Array.isArray(res) ? `array(${res.length})` : typeof res, res)),
      catchError(this.handleError)
    );
  }

  getById(id: number | string): Observable<Employee> {
    const url = this.buildUrl(`/employees/${id}`);
    console.debug('EmployeeService.getById() ->', url);
    return this.http.get<Employee>(url).pipe(
      tap(res => console.debug('EmployeeService.getById() response:', res)),
      catchError(this.handleError)
    );
  }

  create(payload: Partial<Employee>): Observable<Employee> {
    const url = this.buildUrl('/employees');
    console.debug('EmployeeService.create() ->', url, payload);
    return this.http.post<Employee>(url, payload).pipe(
      tap(res => console.debug('EmployeeService.create() response:', res)),
      catchError(this.handleError)
    );
  }

  update(id: number | string, payload: Partial<Employee>): Observable<Employee> {
    const url = this.buildUrl(`/employees/${id}`);
    console.debug('EmployeeService.update() ->', url, payload);
    return this.http.put<Employee>(url, payload).pipe(
      tap(res => console.debug('EmployeeService.update() response:', res)),
      catchError(this.handleError)
    );
  }

  delete(id: number | string): Observable<any> {
    const url = this.buildUrl(`/employees/${id}`);
    console.debug('EmployeeService.delete() ->', url);
    return this.http.delete(url).pipe(
      tap(res => console.debug('EmployeeService.delete() response:', res)),
      catchError(this.handleError)
    );
  }

  // --- helpers ---
  private buildUrl(path: string) {
    // normalize slashes and preserve protocol if baseUrl contains it
    if (!this.baseUrl) return path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${path}`.replace(/\/\/+/g, '/').replace(':/', '://');
  }

  private handleError = (error: any) => {
    // prefer backend-provided message if present
    const payload = (error && error.error) ? error.error : error;
    console.error('EmployeeService error:', payload);
    return throwError(payload);
  };
}
