// src/app/app.module.ts
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

// helpers & interceptors
import { appInitializer, ErrorInterceptor } from './_helpers';
import { AuthInterceptor } from './_helpers/auth.interceptor'; // newly added
// If you still want to use your old JwtInterceptor, remove AuthInterceptor above and re-add JwtInterceptor here.
// import { JwtInterceptor } from './_helpers/jwt.interceptor';

// services / components
import { AccountService } from './_services';
import { AppComponent } from './app.component';
import { AlertComponent } from './_components';
import { HomeComponent } from './home';

// used to create fake backend (leave commented in production)
// import { fakeBackendProvider } from './_helpers';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    AlertComponent,
    HomeComponent
  ],
  providers: [
    // run the app initializer (restores session / refreshes token on startup)
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },

    // attach JWT to outgoing requests (AuthInterceptor reads token from AccountService/localStorage)
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

    // global error handling (logout on 401, display errors, etc.)
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    // provider used to create fake backend for local dev (uncomment while testing)
    // fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
