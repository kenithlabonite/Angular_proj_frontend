import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee } from '@app/_services/employee.service';
import { DepartmentService, Department } from '@app/_services/department.service';

@Component({
  selector: 'app-employee-transfer',
  templateUrl: './employee-transfer.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EmployeeTransferComponent implements OnInit {
  employee: Employee | null = null;
  departments: Department[] = [];
  selectedDepartmentId: string | number | null = null;

  loading = false;
  errorMessage = '';
  isOpen = true; // modal visibility

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(id);
      this.loadDepartments();
    }
  }

  /** Load employee details by ID */
  private loadEmployee(id: string): void {
    this.employeeService.getById(id).subscribe({
      next: (res: Employee) => {
        this.employee = res;
        this.selectedDepartmentId = res.departmentId ?? null;
      },
      error: () => (this.errorMessage = 'Unable to load employee')
    });
  }

  /** Load all departments */
  private loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (res: Department[]) => (this.departments = res ?? []),
      error: () => (this.errorMessage = 'Unable to load departments')
    });
  }

  /** Transfer employee to selected department */
  transfer(): void {
    if (!this.employee?.EmployeeID || !this.selectedDepartmentId) {
      this.errorMessage = 'Employee or Department is missing';
      return;
    }

    this.loading = true;
    this.employeeService
      .update(this.employee.EmployeeID, { departmentId: this.selectedDepartmentId })
      .subscribe({
        next: () => {
          this.loading = false;
          window.alert(`✅ Employee ${this.employee?.EmployeeID} transferred successfully`);
          this.close();
        },
        error: () => {
          this.loading = false;
          window.alert('❌ Transfer failed');
        }
      });
  }

  /** Close modal and navigate back */
  close(): void {
    this.isOpen = false;
    this.router.navigate(['/employees']);
  }
}
