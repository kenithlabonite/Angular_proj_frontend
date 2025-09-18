// src/app/employee/employee-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeComponent } from './employee.component';
import { EmployeeAddComponent } from './employee-add.component';

const routes: Routes = [
  { path: '', component: EmployeeComponent },
  { path: 'add', component: EmployeeAddComponent },
  // { path: 'edit/:id', component: EmployeeEditComponent }  <-- add later
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule {}   // ✅ correct export
