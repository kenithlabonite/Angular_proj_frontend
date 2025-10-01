// src/app/_services/request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface RequestModel {
  requestId?: number;
  accountId?: number;
  type?: string;
  items?: string;
  quantity?: number;
  status?: string;
  created?: string;
  updated?: string;
  Account?: any;
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RequestModel[]> {
    return this.http.get<RequestModel[]>(`${this.baseUrl}/requests`);
  }

  getById(requestId: number | string) {
    return this.http.get<RequestModel>(`${this.baseUrl}/requests/${requestId}`);
  }

  create(payload: Partial<RequestModel>) {
    return this.http.post<RequestModel>(`${this.baseUrl}/requests`, payload);
  }

  update(requestId: number | string, payload: Partial<RequestModel>) {
    return this.http.put<RequestModel>(`${this.baseUrl}/requests/${requestId}`, payload);
  }

  delete(requestId: number | string) {
    return this.http.delete(`${this.baseUrl}/requests/${requestId}`);
  }
}
