import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, SilentRequest } from '@azure/msal-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
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
