// src/app/employee/employee.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { EmployeeRoutingModule } from './employee-routing.module';

// Non-standalone components → declared here
import { EmployeeComponent } from './employee.component';
import { EmployeeEditComponent } from './employee-edit.component';

// Standalone components → imported directly
import { EmployeeAddComponent } from './employee-add.component';
import { EmployeeTransferComponent } from './employee-transfer.component';

@NgModule({
  declarations: [
    EmployeeComponent,
    EmployeeEditComponent // ✅ declared, not imported
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // ✅ for [formGroup] in edit
    RouterModule,
    EmployeeRoutingModule,

    // ✅ standalone components
    EmployeeAddComponent,
    EmployeeTransferComponent
  ]
})
export class EmployeeModule {}
