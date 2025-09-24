import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // ✅ import map

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  constructor(private http: HttpClient) {}

  // Get all workflows (optionally filter by employeeId)
  getAll(employeeId?: string): Observable<any[]> {
    return this.http
      .get<any[]>(`${environment.apiUrl}/workflows`, {
        params: employeeId ? { employeeId } : {}
      })
      .pipe(
        map((workflows: any[]) =>
          workflows.map((wf: any) => ({
            ...wf,
            details:
              typeof wf.details === 'object'
                ? JSON.stringify(wf.details) // fallback to string
                : wf.details
          }))
        )
      );
  }

  // Get workflow by ID
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/workflows/${id}`).pipe(
      map((wf: any) => ({
        ...wf,
        details:
          typeof wf.details === 'object'
            ? JSON.stringify(wf.details)
            : wf.details
      }))
    );
  }
}
