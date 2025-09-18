import { Component, OnInit } from '@angular/core';
import { DepartmentService, Department } from '@app/_services/department.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { first, catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-departments',
  templateUrl: './department.component.html'
})
export class DepartmentComponent implements OnInit {
  departments: Department[] = [];
  rawResponse: any = null;
  loading = false;
  error = '';

  constructor(private deptSvc: DepartmentService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.deptSvc.getAll()
      .pipe(
        first(),
        catchError(err => {
          console.error('[DepartmentComponent] load error', err);
          this.error = 'Unable to load departments';
          return of([] as Department[]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((res: Department[]) => {
        this.rawResponse = res;
        console.debug('[DepartmentComponent] raw response:', res);

        // ✅ Use backend response directly
        this.departments = (res || []).map(d => ({
          id: d.id ?? (d as any).ID ?? (d as any).departmentId ?? null,
          name: d.name ?? (d as any).Name ?? (d as any).departmentName ?? '',
          description: d.description ?? (d as any).Description ?? '',
          // Trust backend employeeCount
          employeeCounts: d.employeeCounts !== undefined && d.employeeCounts !== null
            ? Number(d.employeeCounts)
            : 0,
          raw: d
        }));
      });
  }

  refresh(): void {
    this.load();
  }

  onAdd(): void {
    this.router.navigate(['/departments/add']);
  }

  onEdit(d: Department): void {
    const id = d.id ?? (d as any).ID ?? (d as any).departmentId;
    if (id) {
      this.router.navigate(['/departments', id, 'edit']);
    }
  }
}
