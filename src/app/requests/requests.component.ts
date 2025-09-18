// src/app/requests/requests.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../_services/request.service';
import { RequestDto, RequestView } from './request.model';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html'
})
export class RequestsComponent implements OnInit {
  requests: RequestView[] = [];
  loading = false;
  error = '';

  constructor(
    private svc: RequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.svc.getAll().subscribe({
      next: (res: RequestDto[]) => {
        this.requests = (res || []).map(r => this.toView(r));
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load requests', err);
        this.error = 'Failed to load requests';
        this.loading = false;
      }
    });
  }

  private toView(r: RequestDto): RequestView {
    // ✅ Normalize employee email
    const employeeEmail = r.Account?.email ?? '—';

    // ✅ Normalize items into an array
    let itemsDisplay: Array<{ name?: string; quantity?: number }> = [];
    if (r.items) {
      try {
        const parsed = typeof r.items === 'string' ? JSON.parse(r.items) : r.items;
        if (Array.isArray(parsed)) {
          itemsDisplay = parsed.map((it: any) => ({
            name: it?.name ?? String(it),
            quantity: it?.quantity
          }));
        } else if (parsed) {
          itemsDisplay = [{ name: parsed.name ?? String(parsed), quantity: parsed.quantity }];
        }
      } catch {
        itemsDisplay = [{ name: String(r.items) }];
      }
    }

    return {
      id: r.id,
      type: r.type,
      status: r.status,
      employeeId: r.employeeId ?? r.employeeCode, // ✅ safe fallback
      employeeDisplay: employeeEmail,
      itemsDisplay
    };
  }

  edit(id?: number): void {
    if (id) {
      this.router.navigate(['/requests/edit', id]);
    }
  }

  add(): void {
    this.router.navigate(['/requests/add']);
  }

  delete(id?: number): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this request?')) {
      this.svc.delete(id).subscribe({
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
}
