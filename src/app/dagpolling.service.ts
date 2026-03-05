import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class DagPollingService {
  private pollingSubscription: Subscription | null = null;

  constructor(private http: HttpClient, private configService: ConfigService) {}

  startPolling(dagRunId: string, callback: (status: string) => void) {
    const url = this.configService.translate("url_airflow") + `/api/v1/dags/DAG_Monitoring/dagRuns/${dagRunId}`;
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'application/json'
    });

    this.pollingSubscription = interval(5000).subscribe(() => {
      this.http.get(url, { headers, responseType: 'json' })
        .pipe(
          catchError(error => {
            console.error('There was an error during the GET request:', error);
            this.stopPolling();
            return throwError(error);
          })
        )
        .subscribe((response: any) => {
          if (response.state === 'success' || response.state === 'failed') {
            callback(response.state);
            this.stopPolling();
          }
        });
    });
  }

  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }
}
