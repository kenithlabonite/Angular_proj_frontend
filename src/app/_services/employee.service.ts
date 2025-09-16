import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private baseUrl = environment.apiUrl; // ensure your environment.apiUrl is set
  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/employees`);
  }

  getById(id: any) {
    return this.http.get<any>(`${this.baseUrl}/employees/${id}`);
  }
}
