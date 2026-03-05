import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Translation, TranslocoService } from "@jsverse/transloco";
import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  [x: string]: any;
  private config: Translation;

  constructor(private http: HttpClient,private conf: TranslocoService) {
    // Load config from localStorage if it exists
    this.config = JSON.parse(localStorage.getItem('config')) || null;
  }

  translate(key: string): any {
    return environment[key];
  } 
  translateForI18n(prop: string): any {
    if (this.config) {
      return this.config[prop];
    } else {
      this.config = JSON.parse(localStorage.getItem('config'));
      if (this.config) {
        return this.config[prop];
      } else {
        this.conf.load('en').subscribe((config) => {
          this.config = config;
          localStorage.setItem('config', JSON.stringify(config));
        });
      }
    }
  }
}

