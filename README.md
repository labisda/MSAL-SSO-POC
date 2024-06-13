# 🎯 MSAL-SSO Proof of Concept 🎯

## 👋 Introduction
This repository is a step by step integration for **Microsoft Authentication Library (MSAL)** in Angular. Feel free to download this repository and test the final output of the application for you to easily understand how MSAL works. 

> ✏️ Note
> Make sure to update the **tenantId** and **clientID** in the app.module.ts or it will return an error.

## Pre-requisites
Before using **Microsoft Authentication Library (MSAL)**, register your application in Azure Active Directory (AD) to get the application's clientId.

## 📃 Procedures
- [ ] Create New Application in Angular
- [ ] Install Other Packages and Required Libraries to Perform the MSAL
- [ ] Create Login Page and Homepage
- [ ] MSAL Configuration
- [ ] Secure Routes with AuthGuard
- [ ] Adding Authorization Bearer in the HTTP Headers.

### 1. Create New Application in Angular
Create a new web application using Angular CLI. Please note that this application uses **Angular 14**:
```
ng new MSAL-SSO-POC
```

<br />


### 2. Install required and optional libraries to perform the MSAL

##### **Required Libraries:**
Before installing MSAL using npm check supported version of it based in Angular version (See table below):
| **MSAL Angular Version** | **MSAL support status** | **Supported Angular Versions** |
|---|---|---|
| MSAL Angular v3 | Active development | 15, 16, 17, 18 |
| MSAL Angular v2 | In maintenance | 9, 10, 11, 12, 13, 14 |
| MSAL Angular v1 | In maintenance | 6, 7, 8, 9 |
| MSAL Angular v0 | Out of support | 4, 5 |

Once verified, install the library with the supported version. For this example, I will be using MSAL Angular v2 since the application is running in Angular 14.
```
npm install @azure/msal-browser@2.x.x @azure/msal-angular@2.x.x
```

##### **Optional Libraries:**
Install Angular Material for angular built-in themes using Angular CLI:
```
ng add @angular/material
```

You can also install Tailwind for efficient component styling. Visit [https://tailwindcss.com/docs/guides/angular](https://tailwindcss.com/docs/guides/angular) to learn how to install Tailwind in your Angular Application.

<br />

### 3. Create Login Page and Homepage
First, create Login Page Component. 
It will be used as the redirected route for invalid and/or expired token.
```
ng generate component pages/login
```

Before we configure MSAL in our login page make sure to include these on your login component:
- **Mat Spinner** to make it more like a loading screen while Authenticating
- Title message (optional)
- **Content** message or **error** message
- And a **login button** which will be used to execute the SSO login popup of Microsoft 

 But still, feel free to style/design how you will show errors, queuing, and other information for the user. It will be also easier for the users as well for the support/dev team to understand if an error occurs. You may also check how this application integrate the login component [here](https://github.com/labisda/MSAL-SSO-POC/tree/master/src/app/pages/login).

Once the login.component.ts is created, create a homepage which will be used for securing routes using AuthGuard.

<br />

### 4. MSAL Configuration
As for the configuration, go to your **app.modules.ts** and add the configuration below. Make sure to change the clientId as well as the tenantId based on the registered app in the Azure AD.

```
/* app.modules.ts */
import { MsalGuard, MsalInterceptor, MsalModule, MsalRedirectComponent, MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MSAL_INSTANCE } from '@azure/msal-angular';
import { InteractionType, PublicClientApplication, IPublicClientApplication } from '@azure/msal-browser';


export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: '{client-id}',
      authority: 'https://login.microsoftonline.com/{tenant-id}', // this is required for multi-tenants, may also be commented if not multi-tenant
      redirectUri: 'http://localhost:4200' // depends on available URLs you set while registering the app. Must be changed based on the environment.
    },
    cache: {
      cacheLocation: 'localStorage'
    }
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
  declarations: [],
  imports: [MsalModule],
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
```


After that, we will be setting up the **Microsoft Authentication Library (MSAL)** to fetch the token which is needed for our headers when executing HTTP requests.

In your **login.component.ts**,
```
export class LoginComponent implements OnInit {


  loadingTitle: string = "Please wait";
  loadingMsg: string = "This will take a few seconds. We are just verifying your credentials.";
  showLoginBtn: boolean = false;

  constructor(private msalService: MsalService, 
              private router: Router, 
              @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration) { }


  ngOnInit(): void {
    // If was redirected to login, this will check if token is available. setTimeout is optional.
    setTimeout(() => {
      if (this.isTokenAvailable()) {
        this.router.navigate(["/homepage"]);
      }
    }, 3000);
  }


  isTokenAvailable(): boolean {
    const account: any = this.msalService.instance.getActiveAccount();
    
    // checks if active account is available.
    if (account) {
      const currentTimestamp = Math.floor(new Date().getTime() / 1000);

      // checks if token is available and not expired
      if (account.idTokenClaims && account.idTokenClaims.exp > currentTimestamp) {
        return true;
      } else {
        
        // if token is expired
        if (account.idTokenClaims.exp > currentTimestamp) {
          this.removeTokenInLocalStorage();
          this.loadingTitle = "Session Expired";
          this.loadingMsg = "Looks like your token is already expired. Please login again.";
          this.showLoginBtn = true;
          return false;
        }

      }
    }

    // if active account is not available
    this.loadingTitle = "Authentication Failed";
    this.loadingMsg = "Please login to Microsoft to access the application.";
    this.showLoginBtn = true;
    return false;
  }


  loginPopup() {
    // triggers the login popup for MS SSO
    this.msalService.loginPopup().subscribe((response: AuthenticationResult) => {
      this.msalService.instance.setActiveAccount(response.account); // Sets the active account in the localStorage
      if (this.isTokenAvailable()) {

        // Update this based on your preference
        this.storeTokenInLocalStorage()
        this.loadingTitle = "Almost there";
        this.loadingMsg = "Connecting to application's network. Please wait...";
        this.showLoginBtn = false;

        /** setTimeout is not required and was only used for user experience only. 
            You may remove setTimeout and leave the Router.navigate behind */
        setTimeout(() => {
          this.router.navigate(["/homepage"]);
        }, 4000);
      }
    });
  }


  storeTokenInLocalStorage() {
    // fetch token and store in local storage
    this.msalService.acquireTokenSilent({...this.msalGuardConfig.authRequest} as SilentRequest).subscribe(response => {
      localStorage.setItem("token", response.accessToken);
    })
  }

  
  removeTokenInLocalStorage() {
    // remove token from local storage
    localStorage.removeItem("token");
  }

}
```

**login.component.html**
```
<div class="flex justify-center items-center fixed top-0 left-0 w-full h-full bg-[#000000a9]">
    <div
        class="flex flex-col items-center justify-center gap-3 bg-white shadow-lg rounded-md w-full max-w-[700px] h-auto py-10">

        <ng-container *ngIf="showLoginBtn; else loadingSpinner">
            <svg class="w-[100px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
                <path
                    d="M30 51.988A21.988 21.988 0 1 1 51.988 30 22.014 22.014 0 0 1 30 51.988zM30 3a27 27 0 1 0 27 27A27.03 27.03 0 0 0 30 3z"
                    style="fill: #EC6453;" />
                <path
                    d="M35.562 20.83l-5.558 5.558-5.557-5.558-3.544 3.544 5.557 5.559-5.557 5.558 3.544 3.544 5.557-5.558 5.558 5.558 3.544-3.544-5.558-5.558 5.558-5.559-3.544-3.544z"
                    style="fill: #EC6453;" />
            </svg>
        </ng-container>
        <ng-template #loadingSpinner>
            <mat-spinner></mat-spinner>
        </ng-template>

        <p class="!mt-5 !mb-0 text-md font-medium text-2xl uppercase">{{ loadingTitle }}</p>
        <p class="!m-0 text-md font-normal text-lg">{{ loadingMsg }}</p>
        <button *ngIf="showLoginBtn" mat-flat-button color="primary" class="!mt-3 !px-10 !py-1"
            (click)="loginPopup()">Login</button>
    </div>
</div>
```

<br />


### 5. Secure routes with AuthGuard
Create an Auth Guard using Angular CLI:
```
ng generate guard services/Auth/auth
```

**auth.guard.ts**
```
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private msalService: MsalService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      
      const account: any = this.msalService.instance.getActiveAccount();
      // checks if active account is available.
      if (account) {
        const currentTimestamp = Math.floor(new Date().getTime() / 1000); // gets the current unix timestamp in seconds.
        // checks if account is valid and not expired
        if (account.idTokenClaims && account.idTokenClaims.exp > currentTimestamp) {
          return true;
        }
      }

      // redirects to login to get authenticated.
      this.router.navigate(['/login']);
      return false;
      
  }
}

```

**app-routing.module.ts**
```
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'homepage', component: HomepageComponent, canActivate: [AuthGuard] }, // Can be only access when AuthGuard returns true;

  { path: '',   redirectTo: '/login', pathMatch: 'full' }, // default page
  { path: '**', component: LoginComponent }, // 404 page not found. Modify this based on your preference.
];
```

To check if token is stored in localStorage, press **"F12"** and go to **"Application"**. After that, look for the **Local storage** in **Storage** category and click the http://localhost:4200 (app's current default URI)

> ❓ How to test if it works properly
> You can clear the localStorage values or check [here](https://github.com/labisda/MSAL-SSO-POC/tree/master/src/app/pages/homepage) on how to implement a logout button in your homepage.

> ✏️ Note
> We can also use MsalGuard but for this example we will integrate it in our custom Auth Guard to make it easier for an application to have 1 or more validations for the securing the routes.

<br />

### 6. Adding Authorization Bearer in the HTTP Headers
It is important to add the token generated in the HTTP headers to authenticate the API calls in your frontend application. To do that simply add HTTP header along with the token. See example below:

```
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MsalService } from '@azure/msal-angular';

@Injectable({
  providedIn: 'root'
})
export class ApiCallService {

  private httpHeaders = {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem("token")}`
    })
  };

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get<any>("https://api.example.com/data", this.httpHeaders);
  }

}
```
