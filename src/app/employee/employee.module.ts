import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';   // 👈 add this

import { EmployeeRoutingModule } from './employee-routing.module';
import { EmployeeComponent } from './employee.component';
import { TransferEmployeeComponent } from './employee-transfer.component';

@NgModule({
  declarations: [
    EmployeeComponent,
    TransferEmployeeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,          // 👈 add this
    EmployeeRoutingModule
  ]
})
export class EmployeeModule { }
