/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'environments/environment';
@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet><p-toast position="top-center" class="custom-toast"><ng-template let-message pTemplate="message"><div class="toast-content" [innerHTML]="message.detail"></div></ng-template></p-toast>'
})
export class AppComponent implements OnInit {

  constructor(private cookieService: CookieService) { }

  ngOnInit() {
    this.cookieService.deleteAll();
    this.loadGoogleMapsScript();
  }

  private loadGoogleMapsScript(): void {
    if (!environment.googleMapsApiKey || document.getElementById('google-maps-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
    document.head.appendChild(script);
  }
}
