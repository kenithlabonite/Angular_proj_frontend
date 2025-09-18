import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DepartmentComponent } from './department.component';
import { DepartmentAddEditComponent } from './department-add-edit.component';

const routes: Routes = [
  { path: '', component: DepartmentComponent },
  { path: 'add', component: DepartmentAddEditComponent },
  { path: ':id/edit', component: DepartmentAddEditComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepartmentRoutingModule {}
