// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { AuthGuard } from './_helpers';
import { Role } from './_models';

// Existing lazy-loaded modules
const accountModule = () => import('./account/account.module').then(m => m.AccountModule);
const adminModule = () => import('./admin/admin.module').then(m => m.AdminModule);
const profileModule = () => import('./profile/profile.module').then(m => m.ProfileModule);

// New lazy-loaded modules
const employeeModule = () => import('./employee/employee.module').then(m => m.EmployeeModule);
const departmentModule = () => import('./department/department.module').then(m => m.DepartmentModule);
const requestsModule = () => import('./requests/requests.module').then(m => m.RequestModule);

// Direct component imports
import { TransferEmployeeComponent } from './employee/employee-transfer.component';


const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'account', loadChildren: accountModule },
  { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard] },
  { path: 'admin', loadChildren: adminModule, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },

  // ✅ New Pages
  { path: 'employees', loadChildren: employeeModule, canActivate: [AuthGuard] },
  { path: 'employees/transfer/:id', component: TransferEmployeeComponent, canActivate: [AuthGuard] },
  { path: 'departments', loadChildren: departmentModule, canActivate: [AuthGuard] },
  { path: 'requests', loadChildren: requestsModule, canActivate: [AuthGuard] },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
