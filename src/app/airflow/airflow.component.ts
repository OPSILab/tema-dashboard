import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfigService } from 'app/config.service';

@Component({
  selector: 'ngx-airflow',
  templateUrl: './airflow.component.html',
  styleUrls: ['./airflow.component.scss']
})
export class AirflowComponent {
  content: any;
  iframe: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer, private configService: ConfigService) {
    const url_airflow = this.configService.translate("url_airflow");
    this.iframe = this.sanitizer.bypassSecurityTrustResourceUrl(url_airflow);
  }
}
