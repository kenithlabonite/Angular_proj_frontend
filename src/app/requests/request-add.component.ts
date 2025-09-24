import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from '@app/_services/request.service';
import { EmployeeService } from '@app/_services/employee.service';

@Component({
  selector: 'app-request-add',
  templateUrl: './request-add.component.html'
})
export class RequestAddComponent implements OnInit {
  form!: FormGroup;
  submitting = false;
  employees: any[] = [];
  allowedTypes = ['equipment', 'leave', 'resources'];
  error = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private requestSvc: RequestService,
    private employeeSvc: EmployeeService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      accountId: ['', Validators.required],
      type: ['', Validators.required],
      status: ['pending'],
      items: this.fb.array([this.newItem()])
    });

    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.employeeSvc.getAll().subscribe({
      next: res => {
        this.employees = res.map((e: any) => ({
          accountId: e.Account?.id,
          displayName: `${e.Account?.firstName ?? ''} ${e.Account?.lastName ?? ''} (${e.Account?.email ?? ''})`
        }));
      },
      error: err => console.error('Failed to load employees', err)
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  newItem(data?: any): FormGroup {
    return this.fb.group({
      name: [data?.name || '', Validators.required],
      quantity: [data?.quantity || 1, [Validators.required, Validators.min(1)]]
    });
  }

  addItem(): void {
    this.items.push(this.newItem());
  }

  removeItem(i: number): void {
    this.items.removeAt(i);
  }

  save(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    const payload = {
      ...this.form.value,
      items: JSON.stringify(this.form.value.items),
      quantity: this.form.value.items.reduce((s: number, it: any) => s + (Number(it.quantity) || 0), 0)
    };

    this.requestSvc.create(payload).subscribe({
      next: () => this.router.navigate(['/requests']),
      error: err => {
        console.error('Failed to create request', err);
        this.error = 'Failed to create request';
        this.submitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/requests']);
  }
}
