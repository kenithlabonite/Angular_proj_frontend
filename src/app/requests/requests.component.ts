// src/app/requests/requests.component.ts
import { Component, OnInit } from '@angular/core';
import { RequestService } from '@app/_services/request.service';
import { RequestDto, RequestView } from './request.model';
import { finalize } from 'rxjs/operators';

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
    this.error = '';

    this.requestSvc.getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (list: RequestDto[]) => {
          // If backend returns null/undefined, treat as empty array
          const arr = Array.isArray(list) ? list : [];
          this.requests = arr.map(r => this.toView(r));
        },
        error: (err: any) => {
          console.error('Failed to load requests', err);
          // Prefer readable message from server if present
          this.error = err?.error?.message || err?.message || 'Failed to load requests';
        }
      });
  }

  delete(id: number | null | undefined): void {
    if (!id) return;

    if (!confirm('Are you sure you want to delete this request?')) return;

    this.requestSvc.delete(id).subscribe({
      next: () => {
        // remove locally for immediate UI feedback
        this.requests = this.requests.filter(r => r.id !== id);
      },
      error: (err: any) => {
        console.error('Failed to delete request', err);
        this.error = err?.error?.message || err?.message || 'Failed to delete request';
      }
    });
  }

  // convert server DTO into the view model used by template
  private toView(r: RequestDto): RequestView {
    const id =
      (r as any).id ??
      (r as any).requestId ??
      (r as any).RequestID ??
      null;

    const account = (r as any).Account ?? null;
    const firstName = account?.firstName ?? '';
    const lastName = account?.lastName ?? '';
    const email = account?.email ?? '';

    return {
      id,
      type: r.type ?? '',
      status: r.status ?? '',
      employeeId: (r as any).employeeId ?? (r as any).employeeCode ?? '',
      employeeDisplay: account
        ? `${firstName} ${lastName} (${email})`.trim()
        : '—',
      itemsDisplay: this.normalizeItems(r.items)
    };
  }

  private normalizeItems(raw: any): Array<{ name?: string; quantity?: number }> {
    if (!raw) return [];
    // If the backend already returns an array, keep it
    if (Array.isArray(raw)) return raw as Array<{ name?: string; quantity?: number }>;

    // If it's a JSON string, try to parse
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    // Anything else => return empty
    return [];
  }
}
