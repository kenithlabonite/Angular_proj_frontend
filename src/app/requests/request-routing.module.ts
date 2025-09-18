// src/app/requests/request-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// your list component is requests.component.ts (plural)
import { RequestsComponent } from './requests.component';
import { RequestEditComponent } from './request-edit.component';

const routes: Routes = [
  { path: '', component: RequestsComponent },
  { path: 'add', component: RequestEditComponent },
  { path: 'edit/:id', component: RequestEditComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestRoutingModule {}
