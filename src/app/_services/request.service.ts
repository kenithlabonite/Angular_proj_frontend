// src/app/_services/request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestDto } from '../requests/request.model'; // <-- correct relative path

@Injectable({ providedIn: 'root' })
export class RequestService {
  private base = 'http://localhost:4000/requests';

  constructor(private http: HttpClient) {}

  getAll(): Observable<RequestDto[]> {
    return this.http.get<RequestDto[]>(this.base);
  }

  getById(id: number): Observable<RequestDto> {
    return this.http.get<RequestDto>(`${this.base}/${id}`);
  }

  create(payload: Partial<RequestDto>) {
    return this.http.post<RequestDto>(this.base, payload);
  }

  update(id: number, payload: Partial<RequestDto>) {
    return this.http.put<RequestDto>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
