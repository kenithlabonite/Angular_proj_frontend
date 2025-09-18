import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-transfer-employee',
  templateUrl: './employee-transfer.component.html'
})
export class TransferEmployeeComponent {
  @Input() employee: any;
  @Input() departments: string[] = [];
  @Output() transfer = new EventEmitter<{ employeeId: string, department: string }>();
  @Output() closeModal = new EventEmitter<void>();

  selectedDepartment: string = '';

  confirmTransfer() {
    if (!this.selectedDepartment) return;
    this.transfer.emit({ employeeId: this.employee.EmployeeID, department: this.selectedDepartment });
  }

  close() {
    this.closeModal.emit();
  }
}
