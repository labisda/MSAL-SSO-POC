import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


  loadingTitle: string = "Please wait";
  loadingMsg: string = "This will take a few seconds. We are just verifying your credentials."
  showLoginBtn: boolean = false;

  constructor(private msalService: MsalService, private router: Router) {

  }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.isTokenAvailable()) {
        this.router.navigate(["/homepage"]); 
      }
    }, 3000);
  }


  isTokenAvailable(): boolean {
    const account: any = this.msalService.instance.getActiveAccount();
    if (account) {
      const currentTimestamp = Math.floor(new Date().getTime() / 1000);
      if (account.idTokenClaims && account.idTokenClaims.exp > currentTimestamp) {
        return true;
      } else {

        if (account.idTokenClaims.exp > currentTimestamp) {
          this.loadingTitle = "Session Expired";
          this.loadingMsg = "Looks like your token is already expired. Please login again."
          this.showLoginBtn = true;
        }

      }
    }

    this.loadingTitle = "Authentication Failed";
    this.loadingMsg = "Please login to Microsoft to access the application."
    this.showLoginBtn = true;
    return false;
  }

  isLoggedIn(): boolean {
    return this.msalService.instance.getActiveAccount() != null;
  }

  loginPopup() {
    this.msalService.loginPopup().subscribe((response: AuthenticationResult) => {
      this.msalService.instance.setActiveAccount(response.account);
      if (this.isTokenAvailable()) {

        this.loadingTitle = "Almost there";
        this.loadingMsg = "Connecting to application's network. Please wait..."
        this.showLoginBtn = false;

        setTimeout(() => {
          this.router.navigate(["/homepage"]);
        }, 4000);

      }
    });
  }

}
