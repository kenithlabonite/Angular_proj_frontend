// src/app/employee/employee.component.ts
import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '@app/_services/employee.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Employee {
  EmployeeID: string;
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  position: string;
  department: string;
  hireDate: string;
  status: string;
}

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html'
})
export class EmployeeComponent implements OnInit {
  employees: Employee[] = [];
  loading = false;
  errorMessage = '';

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.loading = true;
    this.errorMessage = '';

    this.employeeService
      .getAll()
      .pipe(
        catchError(err => {
          console.error('Employee load failed', err);
          this.errorMessage = 'Unable to load employees';
          this.loading = false;
          return of([]); // fallback: empty list
        })
      )
      .subscribe((res: any[]) => {
        this.employees = (res || [])
          .map(e => this.mapEmployee(e))
          .filter(emp => emp.status.toLowerCase() === 'active');

        this.loading = false;
      });
  }

  /** Map raw backend data to Employee view model */
  private mapEmployee(e: any): Employee {
    return {
      EmployeeID: e.employeeCode ?? '',
      accountId: e.accountId ?? '',
      firstName: e.Account?.firstName ?? '',
      lastName: e.Account?.lastName ?? '',
      email: e.Account?.email ?? '',
      role: e.Account?.role ?? '',
      position: e.position ?? '',
      department: e.department ?? '',
      hireDate: e.hireDate ?? '',
      status: e.status ?? ''
    };
  }

  /** Future action: open transfer modal */
  openTransfer(employee: Employee): void {
    console.log('Transfer clicked for', employee);
    // 👉 Here you can trigger a modal/alert to transfer employee
  }

  /** Optional: handle deletion */
  deleteEmployee(employee: Employee): void {
    console.log('Delete clicked for', employee);
    // 👉 Confirm + call delete API
  }
}
