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

  // statuses supported by backend
  readonly statuses = ['pending', 'approved', 'rejected'];

  // track updating workflows (for spinners/disabled buttons)
  updatingMap: Record<number | string, boolean> = {};

  constructor(
    private workflowService: WorkflowService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.queryParamMap.get('employeeId') || undefined;
    this.loadWorkflows();
  }

  /** Load all workflows (optionally filtered by employee) */
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

  /** Check if workflow is updating */
  isUpdating(id: number | string): boolean {
    return !!this.updatingMap[id];
  }

  /** Map status → badge color */
  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 'bg-warning text-dark';
    if (s === 'approved') return 'bg-success';
    if (s === 'rejected') return 'bg-danger';
    return 'bg-secondary';
  }

  /**
   * Update workflow status (Approve/Reject buttons).
   * Optimistic update → call backend → refresh workflow → rollback if failed.
   */
  updateStatus(wf: any, newStatus: string): void {
    if (!wf || wf.id == null) return;
    const prev = wf.status ?? '';
    if (prev.toLowerCase() === newStatus.toLowerCase()) return;
    if (!this.statuses.includes(newStatus.toLowerCase())) {
      alert('Invalid status selected');
      return;
    }

    // optimistic UI update
    wf.status = newStatus;
    this.updatingMap[wf.id] = true;

    this.workflowService
      .update(wf.id, { status: newStatus })
      .pipe(finalize(() => (this.updatingMap[wf.id] = false)))
      .subscribe({
        next: () => {
          // ensure UI matches backend
          this.workflowService.getById(wf.id).subscribe({
            next: fresh => {
              wf.status = fresh?.status ?? newStatus;
            },
            error: err => {
              console.error('Failed to refresh workflow after update', err);
              wf.status = newStatus;
            }
          });
        },
        error: err => {
          console.error('Failed to update workflow status', { wfId: wf.id, err });
          const msg = err?.error?.message || err?.message || 'Failed to update status';
          alert(msg);
          wf.status = prev; // rollback
        }
      });
  }
}
