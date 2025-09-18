// src/app/requests/request-edit/request-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestService } from '../_services/request.service';
import { EmployeeService } from '../_services/employee.service';
import { RequestDto } from './request.model';

@Component({
  selector: 'app-request-edit',
  templateUrl: './request-edit.component.html'
})
export class RequestEditComponent implements OnInit {
  form!: FormGroup;
  id?: number;
  loading = false;
  error = '';
  submitting = false;
  allowedTypes = ['equipment', 'leave', 'resources'];

  employees: Array<{
    id: string;
    displayName: string;
    email: string;
    role: string;
    position: string;
    department: string;
  }> = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private requestSvc: RequestService,
    private employeeSvc: EmployeeService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id')) || undefined;

    this.form = this.fb.group({
      type: ['', Validators.required],
      employeeId: ['', Validators.required], // ✅ always bind to employeeId
      items: this.fb.array([])
    });

    this.loadEmployees();

    if (this.id) {
      this.load();
    } else {
      this.addItem();
    }
  }

  // ✅ Fetch employees from backend
  private loadEmployees(): void {
    this.employeeSvc.getAll().subscribe({
      next: (res) => {
        this.employees = (res || []).map((e: any) => ({
          id: e.EmployeeID ?? e.employeeCode ?? '',
          displayName: `${e.Account?.firstName ?? ''} ${e.Account?.lastName ?? ''} (${e.Account?.email ?? '—'})`,
          email: e.Account?.email ?? '',
          role: e.Account?.role ?? '',
          position: e.position ?? '',
          department: e.department ?? ''
        }));
      },
      error: (err) => console.error('Failed to load employees', err)
    });
  }

  // ✅ Getter for form array
  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  private newItem(data?: any): FormGroup {
    return this.fb.group({
      name: [data?.name || '', Validators.required],
      quantity: [data?.quantity || 1, [Validators.required, Validators.min(1)]]
    });
  }

  addItem(): void {
    this.items.push(this.newItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  // ✅ Load request for editing
  private load(): void {
    this.loading = true;
    this.requestSvc.getById(this.id!).subscribe({
      next: (res: RequestDto) => {
        this.form.patchValue({
          type: res.type ?? '',
          employeeId: res.employeeId ?? res.employeeCode ?? '' // ✅ safe fallback
        });

        this.items.clear();
        let parsedItems: any[] = [];
        try {
          parsedItems = typeof res.items === 'string' ? JSON.parse(res.items) : res.items;
        } catch {
          parsedItems = [];
        }
        if (Array.isArray(parsedItems)) {
          parsedItems.forEach((it) => this.items.push(this.newItem(it)));
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load request', err);
        this.error = 'Failed to load request';
        this.loading = false;
      }
    });
  }

  // ✅ Save or update request
  save(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    const payload = {
      ...this.form.value,
      items: JSON.stringify(this.form.value.items)
    };

    const action = this.id
      ? this.requestSvc.update(this.id, payload)
      : this.requestSvc.create(payload);

    action.subscribe({
      next: () => this.router.navigate(['/requests']),
      error: (err) => {
        console.error('Failed to save request', err);
        this.error = 'Failed to save request';
      }
    }).add(() => (this.submitting = false));
  }

  cancel(): void {
    this.router.navigate(['/requests']);
  }
}
