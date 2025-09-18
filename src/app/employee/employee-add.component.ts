import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-add',
  standalone: true,                                // ✅ standalone
  imports: [CommonModule, FormsModule],            // ✅ ngModel, *ngIf, *ngFor
  templateUrl: './employee-add.component.html'
})
export class EmployeeAddComponent implements OnInit {
  employee: any = {
    EmployeeID: null,
    email: '',
    position: '',
    department: '',
    hireDate: '',
    status: 'active'                               // ✅ default status
  };

  accounts: any[] = [];
  departments: any[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // TODO: Replace this with API call later (AccountService)
    this.accounts = [
      { id: 1, email: 'admin@example.com', firstName: 'Admin', lastName: 'User', status: 'active' },
      { id: 2, email: 'user@example.com', firstName: 'Normal', lastName: 'User', status: 'inactive' },
      { id: 3, email: 'staff@example.com', firstName: 'Staff', lastName: 'Member', status: 'active' }
    ].filter(a => a.status === 'active');          // ✅ only active accounts

    this.departments = [
      { id: 1, name: 'Engineering' },
      { id: 2, name: 'Marketing' },
      { id: 3, name: 'HR' }
    ];
  }

  // ✅ When user selects an account, set EmployeeID and email
  onAccountChange(accountId: number): void {
    const selectedAccount = this.accounts.find(a => a.id == accountId);
    if (selectedAccount) {
      this.employee.EmployeeID = selectedAccount.id;   // EmployeeID = Account.id
      this.employee.email = selectedAccount.email;     // Email = Account.email
    }
  }

  onSubmit(): void {
    console.log('New Employee:', this.employee);
    // TODO: Call employeeService.create(this.employee) when backend is ready
    this.router.navigate(['/employees']);
  }
}
