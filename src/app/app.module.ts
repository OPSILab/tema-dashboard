/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule,CUSTOM_ELEMENTS_SCHEMA, Injectable, isDevMode  } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import {
  NbChatModule,
  NbDatepickerModule,
  NbDialogModule,
  NbMenuModule,
  NbSidebarModule,
  NbToastrModule,
  NbWindowModule,

} from '@nebular/theme';
import { TokenInterceptor } from './pages/auth/services/token.interceptor';
import { AirflowComponent } from './airflow/airflow.component';
import { MinIOComponent } from './min-io/min-io.component';
import { KubernetesComponent } from './kubernetes/kubernetes.component';
import { FloodMissionsComponent } from './flood-missions/flood-missions.component';
import { FireMissionsComponent } from './fire-missions/fire-missions.component';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { NgbModule,NgbNav  } from '@ng-bootstrap/ng-bootstrap';
import { OrionComponent } from './orion/orion.component';
import { SubscriptionComponent } from './subscription/subscription.component';

import {TableModule} from 'primeng/table';
import {ToastModule} from 'primeng/toast';
import {CalendarModule} from 'primeng/calendar';
import {SliderModule} from 'primeng/slider';
import {MultiSelectModule} from 'primeng/multiselect';
import {ContextMenuModule} from 'primeng/contextmenu';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {ProgressBarModule} from 'primeng/progressbar';
import {InputTextModule} from 'primeng/inputtext';
import {FileUploadModule} from 'primeng/fileupload';
import {ToolbarModule} from 'primeng/toolbar';
import {RatingModule} from 'primeng/rating';
import {RadioButtonModule} from 'primeng/radiobutton';
import {InputNumberModule} from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { FieldsetModule } from 'primeng/fieldset';
import { TabViewModule } from 'primeng/tabview';
import { MessageService } from 'primeng/api';
import { CesiumComponent } from './cesium/cesium.component';
import { TypesComponent } from './types/types.component';
import { TooltipModule } from 'primeng/tooltip';
import { DefaultTranspiler, TRANSLOCO_CONFIG, TRANSLOCO_LOADER, TRANSLOCO_MISSING_HANDLER, TRANSLOCO_TRANSPILER, Translation, TranslocoConfig, TranslocoLoader, TranslocoModule, translocoConfig } from '@jsverse/transloco';
import { provideTransloco } from "@jsverse/transloco";
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { TranslocoLoaderData } from '@jsverse/transloco/lib/transloco.loader';
import { TranslocoHttpLoader } from './translocohttploader';
import { TranslocoRootModule } from './transloco-root.module';
import { NbAuthModule, NbOAuth2AuthStrategy, NbOAuth2ClientAuthMethod, NbOAuth2GrantType, NbOAuth2ResponseType, NbPasswordAuthStrategy } from '@nebular/auth';
import { ConfigService } from './config.service';
import { OidcJWTToken } from './pages/auth/oidc/oidc';
import { EntityComponent } from './entity/entity.component';
import { ConfirmationService } from 'primeng/api';
import { NgxLeafletLocateModule } from '@runette/ngx-leaflet-locate';


@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AppComponent,EntityComponent, CesiumComponent,TypesComponent,SubscriptionComponent,OrionComponent, AirflowComponent, MinIOComponent, KubernetesComponent, FloodMissionsComponent, FireMissionsComponent],
  imports: [
    TabViewModule,
    TranslocoModule,
    RouterModule,
    BrowserModule,
    TooltipModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbToastrModule.forRoot(),
    NbChatModule.forRoot({
      messageGoogleMapKey: environment.nbChatGoogleMapsApiKey,
    }),
    CoreModule.forRoot(),
    ThemeModule.forRoot(),
    JwtModule.forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem('token');

        }
      }
    }),
    NgbModule,
    TableModule,
    CalendarModule,
		SliderModule,
		DialogModule,
		MultiSelectModule,
		ContextMenuModule,
		DropdownModule,
		ButtonModule,
		ToastModule,
    InputTextModule,
    ProgressBarModule,
    FileUploadModule,
    ToolbarModule,
    RatingModule,
    FormsModule,
    RadioButtonModule,
    InputNumberModule,
    ConfirmDialogModule,
    InputTextareaModule,
    FieldsetModule,
    TranslocoRootModule,
    NbAuthModule.forRoot({
      strategies: [
        NbOAuth2AuthStrategy.setup({
          name: environment.authProfile, // Usa i valori di configurazione qui
          clientId: environment.client_id,
          clientSecret: environment.client_secret,
          baseEndpoint: `${environment.idmBaseURL}/auth/realms/${environment.idmRealmName}/protocol/openid-connect`,
          clientAuthMethod: NbOAuth2ClientAuthMethod.NONE,
          token: {
            endpoint: '/token',
            redirectUri: `${environment.dashboardBaseURL}/keycloak-auth/callback`,
            class: OidcJWTToken,
          },
          authorize: {
            endpoint: '/auth',
            scope: 'openid',
            redirectUri: `${environment.dashboardBaseURL}/keycloak-auth/callback`,
            responseType: NbOAuth2ResponseType.CODE
          },
          redirect: {
            success: '/pages', // welcome page path
            failure: null, // stay on the same page
          },
          refresh: {
            endpoint: '/token',
            grantType: NbOAuth2GrantType.REFRESH_TOKEN,
            scope:'openid'
          } 
          
        }),
      ],
      forms: {},
    }), 
    NgxLeafletLocateModule
    
  ],
  providers: [
       
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    JwtHelperService,
    MessageService,
    TranslocoHttpLoader,
    ConfigService,
    ConfirmationService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private configService: ConfigService) { 
    
  }
}
