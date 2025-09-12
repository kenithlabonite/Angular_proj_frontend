import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '@app/_services';

@Component({ templateUrl: 'layout.component.html' })
export class LayoutComponent {
    constructor(
        public router: Router,
        private accountService: AccountService
    ) {
        // Only redirect if logged in AND currently on login/register routes
        if (this.accountService.accountValue &&
            ['/account/login', '/account/register'].includes(this.router.url)) {
            this.router.navigate(['/']);
        }
    }
}
