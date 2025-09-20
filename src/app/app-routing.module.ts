// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { AuthGuard } from './_helpers';
import { Role } from './_models';

// Lazy-loaded feature modules
const accountModule = () => import('./account/account.module').then(m => m.AccountModule);
const adminModule = () => import('./admin/admin.module').then(m => m.AdminModule);
const profileModule = () => import('./profile/profile.module').then(m => m.ProfileModule);
const employeeModule = () => import('./employee/employee.module').then(m => m.EmployeeModule);
const departmentModule = () => import('./department/department.module').then(m => m.DepartmentModule);
const requestsModule = () => import('./requests/requests.module').then(m => m.RequestModule);

// Direct standalone component imports
import { EmployeeTransferComponent } from './employee/employee-transfer.component';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'account', loadChildren: accountModule },
  { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard] },
  { path: 'admin', loadChildren: adminModule, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },

  // Employees + Departments
  { path: 'employees', loadChildren: employeeModule, canActivate: [AuthGuard] },
  { path: 'employees/transfer/:id', component: EmployeeTransferComponent, canActivate: [AuthGuard] },
  { path: 'departments', loadChildren: departmentModule, canActivate: [AuthGuard] },
  { path: 'requests', loadChildren: requestsModule, canActivate: [AuthGuard] },

  // Fallback route
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
