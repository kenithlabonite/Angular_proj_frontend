import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '@app/_services/employee.service';
import { DepartmentService } from '@app/_services/department.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-transfer',
  templateUrl: './employee-transfer.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EmployeeTransferComponent implements OnInit {
  employee: any;
  departments: any[] = [];
  selectedDepartmentId: string | number | null = null;
  loading = false;
  errorMessage = '';
  isOpen = true; // controls if the dialog is shown

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(id);
      this.loadDepartments();
    }
  }

  private loadEmployee(id: string) {
    this.employeeService.getById(id).subscribe({
      next: (res) => {
        this.employee = res;
        this.selectedDepartmentId = res.departmentId || null;
      },
      error: () => (this.errorMessage = 'Unable to load employee')
    });
  }

  private loadDepartments() {
    this.departmentService.getAll().subscribe({
      next: (res) => (this.departments = res),
      error: () => (this.errorMessage = 'Unable to load departments')
    });
  }

  transfer() {
    if (!this.employee?.EmployeeID || !this.selectedDepartmentId) {
      this.errorMessage = 'Employee or Department is missing';
      return;
    }

    this.loading = true;
    this.employeeService
      .update(this.employee.EmployeeID!, { departmentId: this.selectedDepartmentId })
      .subscribe({
        next: () => {
          this.loading = false;
          window.alert('✅ Employee transferred successfully');
          this.close();
        },
        error: () => {
          this.loading = false;
          window.alert('❌ Transfer failed');
        }
      });
  }

  close() {
    this.isOpen = false; // just hide the dialog instead of navigating
  }
}
