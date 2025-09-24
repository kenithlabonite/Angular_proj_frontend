import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  id?: string;
  title!: string;
  loading = false;
  submitting = false;
  submitted = false;

  private passwordSub?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];

    // Always include password + confirmPassword
    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      status: ['', Validators.required],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.mustMatch('password', 'confirmPassword') });

    // dynamically require confirmPassword when password is entered
    this.passwordSub = this.form.get('password')!.valueChanges
      .subscribe(() => this.ensureConfirmRequiredIfPassword());

    this.title = this.id ? 'Edit Account' : 'Create Account';

    if (this.id) {
      this.loading = true;
      this.accountService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: account => {
            if (!account) {
              this.alertService.error('Account not found');
              this.router.navigate(['/admin/accounts']);
              return;
            }
            const { password, confirmPassword, ...safe } = account as any;
            this.form.patchValue(safe);
            this.loading = false;
          },
          error: error => {
            this.alertService.error(error);
            this.loading = false;
          }
        });
    }
  }

  ngOnDestroy() {
    if (this.passwordSub) this.passwordSub.unsubscribe();
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) return;

    this.submitting = true;

    // Payload handling
    const payload: any = { ...this.form.value };

    if (!payload.password) {
      // if no password, drop both fields
      delete payload.password;
      delete payload.confirmPassword;
    }

    let request$;
    let message: string;

    if (this.id) {
      request$ = this.accountService.update(this.id!, payload);
      message = 'Account updated';
    } else {
      request$ = this.accountService.create(payload);
      message = 'Account created';
    }

    request$
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success(message, { keepAfterRouteChange: true });
          this.router.navigate(['/admin/accounts']);
        },
        error: error => {
          this.alertService.error(error);
          this.submitting = false;
        }
      });
  }

  mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const group = formGroup as FormGroup;
      const control = group.controls[controlName];
      const matchingControl = group.controls[matchingControlName];

      if (!control || !matchingControl) return null;

      if (!control.value && !matchingControl.value) {
        matchingControl.setErrors(null);
        return null;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }

      return null;
    };
  }

  isPasswordProvided(): boolean {
    const pw = this.form?.get('password')?.value;
    return !!pw && pw.toString().trim().length > 0;
  }

  ensureConfirmRequiredIfPassword() {
    const confirm = this.form.get('confirmPassword')!;
    if (this.isPasswordProvided()) {
      confirm.setValidators([Validators.required]);
    } else {
      confirm.clearValidators();
    }
    confirm.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }
}
