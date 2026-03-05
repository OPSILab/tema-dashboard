import { NgModule } from '@angular/core';
import { NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { HomeComponent } from './home/home.component';
import { AmministrationComponent } from './amministration/amministration.component';
import { OperativeComponent } from './operative/operative.component';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
  ],
  declarations: [
    PagesComponent,
    HomeComponent,
    AmministrationComponent,
    OperativeComponent,
  ],
})
export class PagesModule {
}
