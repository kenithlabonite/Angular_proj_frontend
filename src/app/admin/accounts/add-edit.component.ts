// src/app/admin/accounts/add-edit.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Subscription, firstValueFrom } from 'rxjs';
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

    // Password optional for admin create/edit. If provided, must be >= 6 chars.
    const passwordValidators = [Validators.minLength(6)];
    const confirmValidators: any[] = []; // handled dynamically when password provided

    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      status: ['', Validators.required],
      // include password controls even if template doesn't show them yet
      password: ['', passwordValidators],
      confirmPassword: ['', confirmValidators]
    }, { validators: this.mustMatch('password', 'confirmPassword') });

    // dynamically require confirmPassword if password is provided
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
            // patch safe fields (do not set password fields)
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

  // convenience getter for easy access to form fields in template
  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) return;

    this.submitting = true;

    // Prepare payload and remove password keys if blank (so backend treats them as "not provided")
    const payload: any = { ...this.form.value };

    if (!payload.password) {
      delete payload.password;
      delete payload.confirmPassword;
    } else {
      // if password provided, send only passwordHash-handling is done server-side, so remove confirmPassword
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

  /**
   * Cross-field validator that checks two controls match.
   * Allows both fields to be empty (we permit blank password for admin-created accounts).
   */
  mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const group = formGroup as FormGroup;
      const control = group.controls[controlName];
      const matchingControl = group.controls[matchingControlName];

      if (!control || !matchingControl) {
        return null;
      }

      // If both empty -> valid (we allow blank password)
      if (!control.value && !matchingControl.value) {
        // clear any mustMatch error that might be present
        if (matchingControl.errors && matchingControl.errors['mustMatch']) {
          const errors = { ...matchingControl.errors };
          delete errors['mustMatch'];
          matchingControl.setErrors(Object.keys(errors).length ? errors : null);
        }
        return null;
      }

      // don't overwrite other errors on matchingControl
      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return null;
      }

      // set or clear mustMatch error
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ ...matchingControl.errors, mustMatch: true });
      } else {
        if (matchingControl.errors) {
          const errors = { ...matchingControl.errors };
          delete errors['mustMatch'];
          matchingControl.setErrors(Object.keys(errors).length ? errors : null);
        } else {
          matchingControl.setErrors(null);
        }
      }

      return null;
    };
  }

  /**
   * Returns true when a password has been entered (non-empty).
   * Used by template to decide whether to show confirm-password and its required error.
   */
  isPasswordProvided(): boolean {
    const pw = this.form?.get('password')?.value;
    return !!pw && pw.toString().trim().length > 0;
  }

  /**
   * Toggle confirmPassword required validator depending on whether password is present.
   */
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
