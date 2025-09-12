import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { AuthGuard } from './_helpers';
import { Role } from './_models';

// Existing lazy-loaded modules
const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const adminModule = () => import('./admin/admin.module').then(x => x.AdminModule);
const profileModule = () => import('./profile/profile.module').then(x => x.ProfileModule);

// New lazy-loaded modules
const employeeModule = () => import('./employee/employee.module').then(x => x.EmployeeModule);
const departmentModule = () => import('./department/department.module').then(x => x.DepartmentModule);
const requestModule = () => import('./request/request.module').then(x => x.RequestModule);

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'account', loadChildren: accountModule },
  { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard] },
  { path: 'admin', loadChildren: adminModule, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },

  // ✅ New Pages
  { path: 'employees', loadChildren: employeeModule, canActivate: [AuthGuard] },
  { path: 'departments', loadChildren: departmentModule, canActivate: [AuthGuard] },
  { path: 'requests', loadChildren: requestModule, canActivate: [AuthGuard] },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
