import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfigService } from 'app/config.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'ngx-min-io',
  templateUrl: './min-io.component.html',
  styleUrls: ['./min-io.component.scss']
})
export class MinIOComponent  {


  content: any;
  iframe: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer, private configService: ConfigService) {
    const minioUrl = this.configService.translate("url_minio");
    this.iframe = this.sanitizer.bypassSecurityTrustResourceUrl(minioUrl);
  }

}
