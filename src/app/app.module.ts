import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MsalGuard, MsalInterceptor, MsalModule, MsalRedirectComponent, MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MSAL_INSTANCE } from '@azure/msal-angular';
import { InteractionType, PublicClientApplication, IPublicClientApplication } from '@azure/msal-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { LoginComponent } from './pages/login/login.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: 'd5383760-30f8-4599-8ea4-29bf1e2ec004',
      authority: 'https://login.microsoftonline.com/5d3e2773-e07f-4432-a630-1a0f68a28a05',  // this is required for multi-tenants, may also be commented if not multi-tenant
      redirectUri: 'http://localhost:4200' // depends on available URLs you set while registering the app. Must be changed based on the environment.
    },
    cache: {
      cacheLocation: 'localStorage'
    },
  });
}

export function MSALGuardConfigFactory(): any {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['user.read']
    }
  };
}

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MsalModule
  ],
  providers: [
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})

export class AppModule { }