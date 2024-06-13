import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private msalService: MsalService, private router: Router) {

  }

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
