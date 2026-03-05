import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  constructor(private http: HttpClient) { }

  createSubscription(subscriptionUrl: string, notifyUrl: string, entityTypes: string[] | string,header: string) {

    const entityTypesArray = Array.isArray(entityTypes) ? entityTypes : [entityTypes];
    
    const body = {

      "type": "Subscription",
      "entities": entityTypesArray.map(type => ({ type })),
      "notification": {
        "endpoint": {
          "uri": notifyUrl,
          "accept": "application/json"
        }
      }
    };
    if (header != null && header != '') {
      let headerWithoutNewlines = header.replace(/\n/g, '');
      // Parse the string back into a JSON array
      let headerArray = JSON.parse(headerWithoutNewlines);
      body.notification.endpoint['receiverInfo'] = headerArray;
    }
    return this.http.post(subscriptionUrl, body);
  }
}
