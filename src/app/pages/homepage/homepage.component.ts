import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  constructor(private msalService: MsalService, private http: HttpClient) { }

  ngOnInit(): void {
  }

  getName(): string {
    return this.msalService.instance.getActiveAccount()?.name || "User";
  }

  logout() {
    this.msalService.logout();
  }

}
