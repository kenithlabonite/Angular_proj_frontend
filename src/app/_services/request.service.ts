// src/app/_services/request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestDto } from '../requests/request.model';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private baseUrl = 'http://localhost:4000/requests';

  constructor(private http: HttpClient) {}

  // Get all requests
  getAll(): Observable<RequestDto[]> {
    return this.http.get<RequestDto[]>(this.baseUrl);
  }

  // Get single request by ID
  getById(id: number): Observable<RequestDto> {
    return this.http.get<RequestDto>(`${this.baseUrl}/${id}`);
  }

  // Create a new request
  create(payload: Partial<RequestDto>): Observable<RequestDto> {
    return this.http.post<RequestDto>(this.baseUrl, payload);
  }

  // Update an existing request
  update(id: number, payload: Partial<RequestDto>): Observable<RequestDto> {
    return this.http.put<RequestDto>(`${this.baseUrl}/${id}`, payload);
  }

  // Delete a request
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
