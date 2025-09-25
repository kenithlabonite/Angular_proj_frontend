// src/app/workflows/workflows.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { WorkflowService } from '@app/_services/workflow.service';

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html'
})
export class WorkflowsComponent implements OnInit {
  workflows: any[] = [];
  employeeId?: string;
  loading = false;
  error: string | null = null;

  readonly statuses = ['pending', 'approved', 'rejected'];
  updatingMap: Record<number | string, boolean> = {};

  constructor(
    private workflowService: WorkflowService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.queryParamMap.get('employeeId') || undefined;
    this.loadWorkflows();
  }

  loadWorkflows(): void {
    this.loading = true;
    this.error = null;

    this.workflowService.getAll(this.employeeId).subscribe({
      next: (data: any[]) => {
        this.workflows = data || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading workflows', err);
        this.error = 'Failed to load workflows';
        this.loading = false;
      }
    });
  }

  isUpdating(id: number | string): boolean {
    return !!this.updatingMap[id];
  }

  // color classes for full row
  getRowClass(status: string): any {
    return {
      'table-warning': status === 'pending',
      'table-success': status === 'approved',
      'table-danger': status === 'rejected'
    };
  }

  // classes for select element
 /*  getSelectClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-success text-white';
      case 'rejected':
        return 'bg-danger text-white';
      default:
        return 'bg-warning text-dark';
    }
  } */

  // handle status change: use wf.id (numeric), PUT to backend, then re-fetch the workflow for truth
  onStatusChange(wf: any, newStatus: string): void {
    if (!wf || wf.id == null) return;
    const prev = wf.status ?? '';
    if (prev === newStatus) return;
    if (!this.statuses.includes(newStatus)) {
      alert('Invalid status selected');
      wf.status = prev;
      return;
    }

    this.updatingMap[wf.id] = true;

    this.workflowService
      .update(wf.id, { status: newStatus })
      .pipe(finalize(() => (this.updatingMap[wf.id] = false)))
      .subscribe({
        next: () => {
          // fetch fresh record to ensure UI reflects DB
          this.workflowService.getById(wf.id).subscribe({
            next: fresh => {
              wf.status = fresh?.status ?? newStatus;
            },
            error: (err: any) => {
              // if fetch fails, fall back to optimistic value but log error
              console.error('Failed to refresh workflow after update', err);
              wf.status = newStatus;
            }
          });
        },
        error: (err: any) => {
          console.error('Failed to update workflow status', { wfId: wf.id, err });
          const msg = err?.error?.message || err?.message || 'Failed to update status';
          alert(msg);
          wf.status = prev; // rollback
        }
      });
  }
}
