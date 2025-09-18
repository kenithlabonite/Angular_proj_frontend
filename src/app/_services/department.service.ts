import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Department {
  id?: number | string;
  name?: string;
  description?: string;
  employeeCounts?: Number;
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly baseUrl: string;

  constructor(private http: HttpClient) {
    // Default to localhost:4000 if not configured in environment
    this.baseUrl = (environment && (environment as any).apiUrl)
      ? (environment as any).apiUrl.replace(/\/+$/, '')
      : 'http://localhost:4000';
  }

  private buildUrl(path: string = ''): string {
    const url = `${this.baseUrl}/departments${path}`;
    console.debug('[DepartmentService] ->', url);
    return url;
  }

  /** Get all departments */
  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(this.buildUrl())
      .pipe(catchError(this.handleError));
  }

  /** Get department by id */
  getById(id: string | number): Observable<Department> {
    return this.http.get<Department>(this.buildUrl(`/${id}`))
      .pipe(catchError(this.handleError));
  }

  /** Create a department */
  create(payload: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(this.buildUrl(), payload)
      .pipe(catchError(this.handleError));
  }

  /** Update a department */
  update(id: string | number, payload: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(this.buildUrl(`/${id}`), payload)
      .pipe(catchError(this.handleError));
  }

  /** Delete a department */
  delete(id: string | number): Observable<any> {
    return this.http.delete(this.buildUrl(`/${id}`))
      .pipe(catchError(this.handleError));
  }

  /** Shared error handler */
  private handleError(err: any) {
    console.error('[DepartmentService] Error:', err);
    const e = (err && err.error) ? err.error : err;
    return throwError(() => e);
  }
}
