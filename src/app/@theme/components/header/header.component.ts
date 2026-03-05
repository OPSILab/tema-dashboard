import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService, NbMenuItem } from '@nebular/theme';


import { LayoutService } from '../../../@core/utils';
import {filter, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserClaims } from '../../../pages/auth/oidc/oidc';
import { Router } from '@angular/router';
import { OidcUserInformationService } from '../../../pages/auth/services/oidc-user-information.service';
import { ConfigService } from 'app/config.service';





@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: UserClaims;
  userMenuDefault: NbMenuItem[] = [];
  authenticationEnabled:boolean=false;
  currentTheme = 'default';

  userMenu: NbMenuItem[] = [];

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private userService: OidcUserInformationService,
              private layoutService: LayoutService,
              private configService: ConfigService,
              private breakpointService: NbMediaBreakpointsService,
              private router: Router,
              ) {

  }


  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;
    console.log(this.user);
    this.authenticationEnabled=this.configService.translate("enableAuthentication");

    this.userMenuDefault = [
      {
        title: "Login",
        data: { tag: "login" },
       url: `${this.configService.translate('dashboardBaseURL')}/keycloak-auth/`
      },
    ];
    this.userMenu = [
      { title: 'Profile', url: `${this.configService.translate('idmBaseURL')}/auth/realms/${this.configService.translate('idmRealmName')}/account`,target:'_blank' },
      { title: 'Log out', data: { tag: "logout" }, url:`${this.configService.translate('dashboardBaseURL')}/keycloak-auth/logout` }
    ]

    this.userService.onUserChange()
    .subscribe((user: any) => {this.user = user; console.log(this.user);  console.log("updateUser");
    });

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
      this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'user-menu'),
        map(({ item: { data } }) => data),
      )
      .subscribe(res => {
        if (res["tag"] == "logout") {
          this.router.navigateByUrl('/keycloak-auth/logout');
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
