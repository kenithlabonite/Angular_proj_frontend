import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { RequestsComponent } from './requests.component';
import { RequestAddComponent } from './request-add.component';
import { RequestEditComponent } from './request-edit.component';
import { RequestRoutingModule } from './request-routing.module';

@NgModule({
  declarations: [
    RequestsComponent,
    RequestAddComponent,
    RequestEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,            // ✅ for ngModel, pipes like titlecase
    ReactiveFormsModule,    // ✅ fixes formGroup, formArray, formGroupName
    RouterModule,           // ✅ fixes routerLink
    RequestRoutingModule
  ]
})
export class RequestsModule {}
