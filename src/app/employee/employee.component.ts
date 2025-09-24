// src/app/employee/employee.component.ts
import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '@app/_services/employee.service';
import { DepartmentService } from '@app/_services/department.service';
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
  departmentName: string;
  hireDate: string;
  status: string;
}

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html'
})
export class EmployeeComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  departments: any[] = [];
  loading = false;
  errorMessage = '';

  // ✅ transfer popup state
  transferVisible = false;
  selectedEmployee: Employee | null = null;
  selectedDepartmentId: string | number | null = null;

  // ✅ filter control
  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  // ✅ alert state (replaces window.alert)
  alertMessage: string | null = null;
  alertType: 'success' | 'error' = 'success';

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
  }

  /** Load all employees */
  private loadEmployees(): void {
    this.loading = true;
    this.employeeService
      .getAll()
      .pipe(
        catchError(err => {
          console.error('Employee load failed', err);
          this.errorMessage = 'Unable to load employees';
          this.loading = false;
          return of([]);
        })
      )
      .subscribe((res: any[]) => {
        this.employees = (res || []).map(e => this.mapEmployee(e));
        this.applyFilter();
        this.loading = false;
      });
  }

  /** Load departments */
  private loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: res => (this.departments = res),
      error: () => (this.errorMessage = 'Unable to load departments')
    });
  }

  /** Map backend → frontend */
  private mapEmployee(e: any): Employee {
    return {
      EmployeeID: e.EmployeeID ?? e.employeeCode ?? '',
      accountId: e.accountId ?? '',
      firstName: e.Account?.firstName ?? '',
      lastName: e.Account?.lastName ?? '',
      email: e.Account?.email ?? '',
      role: e.Account?.role ?? '',
      position: e.position ?? '',
      departmentName: e.Department?.departmentName ?? '—',
      hireDate: e.hireDate ?? '',
      status: e.status ?? 'active'
    };
  }

  /** Filter employees */
  applyFilter(): void {
    if (this.filterStatus === 'all') {
      this.filteredEmployees = [...this.employees];
    } else {
      this.filteredEmployees = this.employees.filter(
        emp => emp.status === this.filterStatus
      );
    }
  }

  /** Toggle employee status */
  toggleStatus(emp: Employee): void {
    const newStatus = emp.status === 'active' ? 'inactive' : 'active';
    this.employeeService.update(emp.EmployeeID, { status: newStatus }).subscribe({
      next: () => {
        emp.status = newStatus;
        this.applyFilter();
        this.showAlert(`✅ Status updated to ${newStatus}`, 'success');
      },
      error: () => this.showAlert('❌ Failed to update status', 'error')
    });
  }

  /** Open transfer popup */
  openTransfer(employee: Employee): void {
    this.selectedEmployee = employee;

    const currentDept = this.departments.find(
      d =>
        d.name === employee.departmentName ||
        d.departmentName === employee.departmentName
    );
    this.selectedDepartmentId = currentDept ? currentDept.id : null;

    this.transferVisible = true;
  }

  /** Close transfer popup */
  closeTransfer(): void {
    this.transferVisible = false;
    this.selectedEmployee = null;
    this.selectedDepartmentId = null;
  }

  /** Confirm transfer */
  confirmTransfer(): void {
    if (!this.selectedEmployee?.EmployeeID || !this.selectedDepartmentId) {
      this.showAlert('❌ Please select a department', 'error');
      return;
    }

    this.employeeService
      .update(this.selectedEmployee.EmployeeID, {
        departmentId: this.selectedDepartmentId
      })
      .subscribe({
        next: () => {
          this.showAlert(
            `✅ Employee ${this.selectedEmployee?.EmployeeID} transferred successfully`,
            'success'
          );
          this.closeTransfer();
          this.loadEmployees();
        },
        error: () => this.showAlert('❌ Transfer failed', 'error')
      });
  }

  /** ✅ Show alert (top-center, auto-hide) */
  private showAlert(message: string, type: 'success' | 'error') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => (this.alertMessage = null), 3000);
  }
}
