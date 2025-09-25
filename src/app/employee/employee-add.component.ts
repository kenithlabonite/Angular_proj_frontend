// src/app/employee/employee-add.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, of, forkJoin } from 'rxjs';
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
    departmentId: undefined, // store departmentId for backend
    hireDate: '',
    status: 'active'
  };

  // use any[] because backend may return relation payloads that are not in Account model
  accounts: any[] = [];
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
    // load accounts + employees in parallel, then filter accounts that are already used
    const comboSub = forkJoin({
      accounts: this.accountService.getAll().pipe(
        catchError(err => {
          console.error('Failed to load accounts', err);
          return of([]);
        })
      ),
      employees: this.employeeService.getAll().pipe(
        catchError(err => {
          console.error('Failed to load employees', err);
          return of([]);
        })
      )
    }).subscribe(
      ({ accounts, employees }: { accounts: any[]; employees: any[] }) => {
        try {
          // build set of accountIds already used by employees
          const usedAccountIds = new Set(
            (employees || [])
              .map(e => e.accountId)
              .filter(id => id !== undefined && id !== null)
          );

          // filter accounts: must be active and not used
          this.accounts = (accounts || []).filter((a: any) => {
            if (!a) return false;
            // If backend attached Employee relation directly to account, also exclude
            const hasEmployeeRelation = !!(a.Employee && (Array.isArray(a.Employee) ? a.Employee.length > 0 : true));
            return a.status === 'active' && !usedAccountIds.has(a.id) && !hasEmployeeRelation;
          });
        } catch (err) {
          console.error('Error filtering accounts', err);
          // fallback: show only active accounts
          this.accounts = (accounts || []).filter((a: any) => a && a.status === 'active');
        }
      },
      err => {
        console.error('Failed to load accounts/employees', err);
        this.accounts = [];
      }
    );
    this.subs.push(comboSub);

    // Fetch next EmployeeID preview
    const idSub = this.employeeService.getNextId().subscribe({
      next: res => (this.employee.EmployeeID = res?.nextId),
      error: err => {
        console.warn('Could not fetch next EmployeeID preview', err);
        this.employee.EmployeeID = undefined;
      }
    });
    this.subs.push(idSub);

    // Load departments
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
          id: Number(d.id),
          name: d.departmentName
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

    // Build payload to match backend model
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
          err?.message || err?.error?.message || 'Failed to create employee.';
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
