// src/app/requests/request-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestsComponent } from './requests.component';
import { RequestAddComponent } from './request-add.component';
import { RequestEditComponent } from './request-edit.component';

const routes: Routes = [
  { path: '', component: RequestsComponent },
  { path: 'add', component: RequestAddComponent },      // 👈 Add only
  { path: 'edit/:id', component: RequestEditComponent } // 👈 Edit only
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestRoutingModule {}
