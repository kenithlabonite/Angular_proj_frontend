import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkflowService } from '@app/_services/workflow.service';

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html'
})
export class WorkflowsComponent implements OnInit {
  workflows: any[] = [];
  employeeId?: string;
  loading = false;
  error: string | null = null; // ✅ add this

  constructor(
    private workflowService: WorkflowService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.employeeId =
      this.route.snapshot.queryParamMap.get('employeeId') || undefined;
    this.loadWorkflows();
  }

  loadWorkflows(): void {
    this.loading = true;
    this.error = null; // reset error before loading

    this.workflowService.getAll(this.employeeId).subscribe({
      next: (data: any[]) => {
        this.workflows = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading workflows', err);
        this.error = 'Failed to load workflows'; // ✅ set error message
        this.loading = false;
      }
    });
  }
}
