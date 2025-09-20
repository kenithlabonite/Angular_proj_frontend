// src/app/employee/employee-add.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EmployeeService, Employee } from '../_services/employee.service';
import { AccountService } from '../_services/account.service';
import { DepartmentService } from '../_services/department.service';
import { Account } from '../_models';

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-add.component.html'
})
export class EmployeeAddComponent implements OnInit, OnDestroy {
  employee: Partial<Employee> = {
    EmployeeID: undefined,
    accountId: undefined,
    position: '',
    departmentId: undefined, // ✅ store departmentId for backend
    hireDate: '',
    status: 'active'
  };

  accounts: Account[] = [];
  departments: Array<{ id: number; name: string }> = [];

  loading = false;
  errorMessage = '';
  private subs: Subscription[] = [];

  constructor(
    private router: Router,
    private employeeService: EmployeeService,
    private accountService: AccountService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    // ✅ Load accounts (only active)
    const accSub = this.accountService.getAll().subscribe({
      next: res => {
        this.accounts = res.filter(a => a.status === 'active');
      },
      error: err => {
        console.error('Failed to load accounts', err);
        this.accounts = [];
      }
    });
    this.subs.push(accSub);

    // ✅ Fetch next EmployeeID preview
    const idSub = this.employeeService.getNextId().subscribe({
      next: res => (this.employee.EmployeeID = res.nextId),
      error: err => {
        console.warn('Could not fetch next EmployeeID preview', err);
        this.employee.EmployeeID = undefined;
      }
    });
    this.subs.push(idSub);

    // ✅ Load departments from backend
    const deptSub = this.departmentService
      .getAll()
      .pipe(
        catchError(err => {
          console.error('Failed to load departments', err);
          this.errorMessage = 'Unable to load departments';
          return of([]);
        })
      )
      .subscribe(res => {
        this.departments = (res || []).map((d: any) => ({
          id: Number(d.id), // backend: "id"
          name: d.departmentName // backend: "departmentName"
        }));
      });
    this.subs.push(deptSub);
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.employee.accountId) {
      this.errorMessage = 'Please select an account.';
      return;
    }
    if (!this.employee.departmentId) {
      this.errorMessage = 'Please select a department.';
      return;
    }

    // ✅ Build payload to match backend model
    const payload: Partial<Employee> = {
      EmployeeID: this.employee.EmployeeID,
      accountId: this.employee.accountId,
      position: this.employee.position,
      departmentId: this.employee.departmentId,
      hireDate: this.employee.hireDate,
      status: this.employee.status === 'inactive' ? 'inactive' : 'active'
    };

    this.loading = true;
    this.employeeService.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/employees']);
      },
      error: err => {
        console.error('Create employee failed', err);
        this.errorMessage =
          err?.message || err?.error?.message || 'Emaill already exists.';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
