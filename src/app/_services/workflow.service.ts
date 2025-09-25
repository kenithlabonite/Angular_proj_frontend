// src/app/_services/workflow.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private base = `${environment.apiUrl}/workflows`;

  constructor(private http: HttpClient) {}

  // Get all workflows (optionally filter by employeeId)
  getAll(employeeId?: string): Observable<any[]> {
    const options: any = { observe: 'body' as const };
    if (employeeId) options.params = { employeeId };

    return this.http.get<any>(this.base, options).pipe(
      map((res: any) => {
        const workflows = (res || []) as any[];
        return workflows.map((wf: any) => ({
          ...wf,
          details:
            typeof wf.details === 'object' && wf.details !== null
              ? JSON.stringify(wf.details)
              : wf.details
        }));
      })
    );
  }

  // Get single workflow by numeric id
  getById(id: number | string): Observable<any> {
    return this.http
      .get<any>(`${this.base}/${id}`, { observe: 'body' as const })
      .pipe(
        map((wf: any) => ({
          ...wf,
          details:
            typeof wf.details === 'object' && wf.details !== null
              ? JSON.stringify(wf.details)
              : wf.details
        }))
      );
  }

  // Update workflow (use PUT because your backend accepted PUT in Postman)
  update(id: number | string, body: any): Observable<any> {
    return this.http
      .put<any>(`${this.base}/${id}`, body, { observe: 'body' as const })
      .pipe(
        map((wf: any) => ({
          ...wf,
          details:
            typeof wf.details === 'object' && wf.details !== null
              ? JSON.stringify(wf.details)
              : wf.details
        }))
      );
  }
}
