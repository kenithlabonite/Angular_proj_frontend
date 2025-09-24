// src/app/employee/employee-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '@app/_services/employee.service';
import { DepartmentService } from '@app/_services/department.service';
import { AccountService } from '@app/_services/account.service';

@Component({
  templateUrl: './employee-edit.component.html'
})
export class EmployeeEditComponent implements OnInit {
  employee: any = {};        // ✅ holds form data
  accounts: any[] = [];      // ✅ dropdown options
  departments: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(id);
    }
    this.loadAccounts();
    this.loadDepartments();
  }

  /** Load employee data by ID */
  private loadEmployee(id: string): void {
    this.loading = true;
    this.employeeService.getById(id).subscribe({
      next: (res) => {
        this.employee = res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load employee';
        this.loading = false;
      }
    });
  }

  /** Load accounts for dropdown */
  private loadAccounts(): void {
    this.accountService.getAll().subscribe({
      next: (res) => (this.accounts = res),
      error: () => (this.errorMessage = 'Unable to load accounts')
    });
  }

  /** Load departments for dropdown */
  private loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (res) => (this.departments = res),
      error: () => (this.errorMessage = 'Unable to load departments')
    });
  }

  /** Submit form */
  onSubmit(): void {
    if (!this.employee.EmployeeID) {
      this.errorMessage = 'Employee ID is missing';
      return;
    }

    this.loading = true;
    this.employeeService.update(this.employee.EmployeeID, this.employee).subscribe({
      next: () => {
        this.loading = false;
        alert('✅ Employee updated successfully');
        this.router.navigate(['/employees']);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = '❌ Update failed';
      }
    });
  }

  /** Cancel editing */
  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
