// src/app/employee/employee.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { EmployeeRoutingModule } from './employee-routing.module';
import { EmployeeComponent } from './employee.component';
import { EmployeeAddComponent } from './employee-add.component';
import { EmployeeTransferComponent } from './employee-transfer.component';

@NgModule({
  declarations: [
    EmployeeComponent // ✅ only declare non-standalone components
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    EmployeeRoutingModule,
    EmployeeAddComponent,       // ✅ standalone components go in imports
    EmployeeTransferComponent   // ✅ standalone components go in imports
  ]
})
export class EmployeeModule {}
