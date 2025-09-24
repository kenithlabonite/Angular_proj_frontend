// src/app/department/department-add-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { DepartmentService, Department } from '@app/_services/department.service';

@Component({
  selector: 'app-department-add-edit',
  templateUrl: './department-add-edit.component.html'
})
export class DepartmentAddEditComponent implements OnInit {
  form!: FormGroup;
  id?: string | number;
  loading = false;
  submitting = false;
  submitted = false;   // 👈 add this
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
      departmentName: ['', Validators.required],
      description: ['']
    });

    if (this.id) {
      this.title = 'Edit Department';
      this.loadDepartment();
    }
  }

  // 👇 add this getter so you can write f['departmentName'] in the template
  get f() {
    return this.form.controls;
  }

  private loadDepartment(): void {
    this.loading = true;
    this.deptSvc.getById(this.id!)
      .pipe(first())
      .subscribe({
        next: (d: Department) => {
          this.loading = false;
          this.form.patchValue({
            departmentName: d?.departmentName ?? '',
            description: d?.description ?? ''
          });
        },
        error: () => {
          this.loading = false;
          alert('Failed to load department details');
        }
      });
  }

  onSubmit(): void {
    this.submitted = true;  // 👈 mark as submitted so validation works
    if (this.form.invalid) return;

    this.submitting = true;
    const payload: Partial<Department> = {
      departmentName: this.f['departmentName'].value,
      description: this.f['description'].value
    };

    const request$ = this.id
      ? this.deptSvc.update(this.id, payload)
      : this.deptSvc.create(payload);

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
