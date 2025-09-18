// src/app/requests/requests.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// use the plural component filename that exists
import { RequestsComponent } from './requests.component';
import { RequestEditComponent } from './request-edit.component';
import { RequestRoutingModule } from './request-routing.module';

@NgModule({
  declarations: [
    RequestsComponent,
    RequestEditComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,   // <-- fixes formGroup binding error
    RequestRoutingModule
  ]
})
export class RequestModule {}
