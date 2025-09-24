// src/app/workflows/workflows.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { WorkflowsComponent } from './workflows.component';
import { WorkflowsRoutingModule } from './workflows-routing.module';

@NgModule({
  declarations: [WorkflowsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    WorkflowsRoutingModule
  ]
})
export class WorkflowsModule {}
