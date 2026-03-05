import { Component, OnInit } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { OidcUserInformationService } from '../pages/auth/services/oidc-user-information.service';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent implements OnInit {
  menu: any[]; // Aggiunta tipizzazione per migliore assistenza da IDE

  constructor(
    private authService: NbAuthService,
    private oidcUserInfoService: OidcUserInformationService,
  ) {}

  ngOnInit(): void {
    this.oidcUserInfoService.getRole().subscribe(roles => {
      this.menu = [
        {
          title: 'Home',
          icon: 'home-outline',
          link: '/pages/homeTema',
          data: { name: 'home' }
        },
        {
          title: 'Menu Administration',
          icon: 'globe-outline',
          link: '/pages/amministration',
          data: { name: 'amministration' },
          hidden: !roles.includes('OPERATIVE'),
          children: [
          /*  {
              title: 'Airflow',
              link: '/pages/amministration/airflow',
              hidden: !roles.includes('ADMINISTRATIVE'),
            },*/
            {
              title: 'Orion',
              link: '/pages/amministration/orion',
              hidden: !roles.includes('OPERATIVE')
            },
            {
              title: 'MinIO',
              link: '/pages/amministration/minio',
              hidden: !roles.includes('ADMINISTRATIVE'),
            },
          /*  {
              title: 'Kubernetes',
              link: '/pages/amministration/kubernetes',
              hidden: !roles.includes('ADMINISTRATIVE'),
            }*/
          ]
        },
        {
          title: 'Menu Business Missions',
          icon: 'settings-2-outline',
          link: '/pages/operative',
          data: { name: 'operative' },
          hidden: !roles.includes('OPERATIVE'),
          children: [
            {
              title: 'Flood Missions',
              link: '/pages/operative/flood'
            },
            {
              title: 'Fire Missions',
              link: '/pages/operative/fire'
            }
          ]
        },
      ];
    });
  }
}
