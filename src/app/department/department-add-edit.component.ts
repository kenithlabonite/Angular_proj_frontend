// src/app/department/department-add-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentService, Department } from '@app/_services/department.service';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-department-add-edit',
  templateUrl: './department-add-edit.component.html'
})
export class DepartmentAddEditComponent implements OnInit {
  form!: FormGroup;
  id?: string | number;
  loading = false;
  submitting = false;
  title = 'Add Department';

  constructor(
    private fb: FormBuilder,
    private deptSvc: DepartmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      employeeCount: [''] // optional if backend supports it
    });

    if (this.id) {
      this.title = 'Edit Department';
      this.loadDepartment();
    }
  }

  private loadDepartment(): void {
    this.loading = true;
    this.deptSvc.getById(this.id!)
      .pipe(first())
      .subscribe({
        next: (d: Department) => {
          this.loading = false;
          this.form.patchValue({
            name: d?.name ?? d?.Name ?? '',
            description: d?.description ?? d?.Description ?? '',
            employeeCount: d?.employeeCount ?? d?.EmployeeCount ?? ''
          });
        },
        error: () => {
          this.loading = false;
          alert('Failed to load department details');
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting = true;

    const payload: Partial<Department> = {
      name: this.form.value.name,
      description: this.form.value.description,
      ...(this.form.value.employeeCount !== '' 
        ? { employeeCount: Number(this.form.value.employeeCount) } 
        : {})
    };

    const request$ = this.id
      ? this.deptSvc.update(this.id, payload) // PUT /departments/:id
      : this.deptSvc.create(payload);         // POST /departments

    request$
      .pipe(first())
      .subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/departments']);
        },
        error: (err) => {
          this.submitting = false;
          alert(err?.message || (this.id ? 'Update failed' : 'Create failed'));
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/departments']);
  }
}
