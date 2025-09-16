import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/_services'; // ✅ using your existing service

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html'
})
export class EmployeeComponent implements OnInit {
  employees: any[] = [];

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.accountService.getAll().subscribe({
      next: (res) => {
        this.employees = res
          .filter((e: any) => e.status === 'active') // ✅ only active
          .map((e: any) => ({
            EmployeeID: e.id,             // backend sends "id" as employee id
            email: e.email,
            position: e.position || '',   // fallback if backend doesn't send
            department: e.department || '',
            hireDate: e.hireDate || e.created || '',
            status: e.status
          }));
      },
      error: (err) => {
        console.error('Failed to load employees', err);
      }
    });
  }
}
