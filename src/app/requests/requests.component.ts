// src/app/requests/requests.component.ts
import { Component, OnInit } from '@angular/core';
import { RequestService } from '@app/_services/request.service';
import { RequestDto, RequestView } from './request.model';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html'
})
export class RequestsComponent implements OnInit {
  requests: RequestView[] = [];
  loading = false;
  error = '';

  constructor(private requestSvc: RequestService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.requestSvc.getAll().subscribe({
      next: (list: RequestDto[]) => {
        this.requests = list.map(r => ({
          // ✅ make sure id is always mapped
          id: r.id ?? (r as any).requestId ?? (r as any).RequestID ?? null,
          type: r.type,
          status: r.status,
          employeeId: r.employeeId ?? r.employeeCode ?? '',
          employeeDisplay: r.Account
            ? `${r.Account.firstName ?? ''} ${r.Account.lastName ?? ''} (${r.Account.email ?? ''})`
            : '—',
          itemsDisplay: this.normalizeItems(r.items)
        }));
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load requests', err);
        this.error = 'Failed to load requests';
        this.loading = false;
      }
    });
  }

  delete(id: number): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this request?')) {
      this.requestSvc.delete(id).subscribe({
        next: () => {
          this.requests = this.requests.filter(r => r.id !== id);
        },
        error: (err: any) => {
          console.error('Failed to delete request', err);
          this.error = 'Failed to delete request';
        }
      });
    }
  }

  private normalizeItems(raw: any): Array<{ name?: string; quantity?: number }> {
    let parsed: any[] = [];
    try {
      parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      parsed = [];
    }
    return Array.isArray(parsed) ? parsed : [];
  }
}
