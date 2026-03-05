import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { SubscriptionService } from './SubscriptionService';
import { ConfigService } from 'app/config.service';
import { Table } from 'primeng/table';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { OidcUserInformationService } from 'app/pages/auth/services/oidc-user-information.service';

export interface Sottoscrizioni {
  id?:string;
  types?: string[] | string;
  endpoint?: string;
  header?:string;
  data?:string;
}

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styles: [`
    :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
    }
  `],
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  sottoscrizioni: Sottoscrizioni[] = [];
  sottoscrizioneDialog: boolean;
  sottoscriviDialogNew: boolean;
  selectedSottoscrizioni: Sottoscrizioni;
  sottoscrizione: Sottoscrizioni = { types: [], endpoint: '', header: '', data: '' };
  type: any;
  typesOptions:any;
  endpoint='';
  types: any;
  header:any;
  subscriptionID:any="";
  display: boolean = false;
  totalRecords: number;
  rows: number = 6;
  subscriptionDetails:any="";
  view:boolean = false;
  public isAmministrative;
  constructor(private oidcUserInfoService: OidcUserInformationService,private http: HttpClient, private configService: ConfigService, private messageService: MessageService,private subscription: SubscriptionService) {
    this.sottoscrizione.types = [];
    this.sottoscrizione.endpoint = '';
    this.sottoscrizione.header = '';
    this.oidcUserInfoService.getRole().subscribe(roles => {
      this.isAmministrative = roles.includes('ADMINISTRATIVE');
    });
  }

  ngOnInit(): void {
   
      this.caricaLista(0);
    
  }

  
    caricaLista(page: number){
      const params = new HttpParams()
      .set('limit', String(this.rows))
      .set('offset', String(page * this.rows));
      this.http.get(this.configService.translate("orion_ld_url_subscription"), { params }).subscribe((data: any[]) => {
        if (data.length > 0) {
            const newSottoscrizioni = data.map(subscription => {
              const types = subscription.entities.map(entity => entity.type);
              return {
                  id: subscription.id,
                  types: types,  // Store as an array
                  endpoint: subscription.notification.endpoint.uri,
                  header: JSON.stringify(subscription.notification.endpoint.receiverInfo, null, 2),
                  status: subscription.status,
                  data: subscription
              };
          });
  
        // Aggiungi le nuove sottoscrizioni all'array esistente
        this.sottoscrizioni = [...this.sottoscrizioni, ...newSottoscrizioni];
      this.totalRecords = this.totalRecords + data.length;
      this.caricaLista(page + 1);
    }
    });
    this.caricaListaTypes();

  }
  formatTypes(types: string[]): string {
    return types ? types.join(', ') : '';
  }
  formatTypesString(types: string | string[]): string {
    if (Array.isArray(types)) {
      return types.join(', ');
    }
    return types.split(' ').join(', ');
  }
  updateLista(page: number) {
    const params = new HttpParams()
        .set('limit', String(this.rows))
        .set('offset', String(page * this.rows));
    this.http.get(this.configService.translate("orion_ld_url_subscription"), { params }).subscribe((data: any[]) => {
        if (data.length > 0) {
          
                
          const newSottoscrizioni = data.map(subscription => {
            const types = subscription.entities.map(entity => entity.type);
            return {
                id: subscription.id,
                types: types,  // Store as an array
                endpoint: subscription.notification.endpoint.uri,
                header: JSON.stringify(subscription.notification.endpoint.receiverInfo, null, 2),
                status: subscription.status,
                data: subscription
            };
        });

            // Rimuovi le vecchie sottoscrizioni che sono state aggiornate
            this.sottoscrizioni = this.sottoscrizioni.filter(existing => 
                !newSottoscrizioni.some(newSub => newSub.id === existing.id)
            );

            // Aggiungi le nuove sottoscrizioni
            this.sottoscrizioni = this.sottoscrizioni.concat(newSottoscrizioni);

            this.totalRecords = this.sottoscrizioni.length;
            this.updateLista(page + 1);
        }
    });
    this.caricaListaTypes();
}
  caricaListaTypes(){
    this.http.get(this.configService.translate("orion_ld_url_type")).subscribe((data: any) => {
        if (data.typeList && Array.isArray(data.typeList)) { // Verifica se typeList è un array
          this.types = data.typeList.map(type => ({type: type}));
          this.typesOptions = data.typeList.map(type => ({ label: type, value: type }));
        } else {
          console.error("The returned data does not contain the list of types.");
          this.messageService.add({severity:'error', summary: 'Error', detail: 'The returned data does not contain the list of types', life: 3000});
        }
      }, error => {
        console.error("An error occurred while retrieving the data:", error);
        this.messageService.add({severity:'error', summary: 'Error', detail: 'An error occurred while retrieving the data', life: 3000});
   
      });
  }
 
  editSottoscrizione(sottoscrizione: Sottoscrizioni) {
    
    let typesArray: string[] = [];
    if (Array.isArray(sottoscrizione.types)) {
      typesArray = sottoscrizione.types;
  } else if (typeof sottoscrizione.types === 'string') {
      typesArray = sottoscrizione.types.split(', ');
  }    
    this.sottoscrizione = { ...sottoscrizione, types: typesArray };
    console.log(sottoscrizione );
    this.sottoscrizioneDialog = true;
  }
  saveSubscription() {
    // Create a new object with the updated values
    const updatedSottoscrizione = { ...this.sottoscrizione };

    this.updateSubscription(this.configService.translate("orion_ld_url_subscription"), updatedSottoscrizione);
}
deleteSottoscrizione(subscription:any){
  this.subscriptionID = subscription.id; 
  this.display = true;
}
deleteSottoscrizioneConfirm(){
  this.http.delete(this.configService.translate("orion_ld_url_subscription")+"/"+this.subscriptionID).subscribe(() => {
    this.messageService.add({severity:'success', summary: 'Success', detail: 'Subscription cancelled successfully.', life: 3000});
    console.log('Subscription cancelled successfully');
    this.sottoscrizioni = this.sottoscrizioni.filter(sottoscrizione => sottoscrizione.id !== this.subscriptionID);
    this.totalRecords--;
  },
  (error) => { 
    this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to cancel subscription.', life: 3000});
    console.error('Failed to cancel subscription', error);
  });
}


updateSubscription(subscriptionUrl: string, sottoscrizione: Sottoscrizioni) {
  // Rimuovi temporaneamente la sottoscrizione corrente
  const filteredSubscriptions = this.sottoscrizioni.filter(s => s.id !== sottoscrizione.id);

  // Converti this.sottoscrizione.types in un array se è una stringa separata da virgole
  const typesArray = Array.isArray(this.sottoscrizione.types) ? this.sottoscrizione.types : (this.sottoscrizione.types ? this.sottoscrizione.types.split(',') : []);

  const existingSubscription = filteredSubscriptions.some(s => {
      // Converti s.types in un array se è una stringa separata da virgole
      const sTypesArray = Array.isArray(s.types) ? s.types : (typeof s.types === 'string' ? s.types.split(',') : []);
      const endpointMatch = s.endpoint === sottoscrizione.endpoint;
      const typeMatch = sTypesArray.some(type => typesArray.includes(type));
      return endpointMatch && typeMatch;
  });

  if (existingSubscription) {
    this.messageService.add({severity: 'error', summary: 'Error', detail: 'The subscription with this pair of type and endpoint already exists.', life: 3000});
    console.error('The subscription with this pair of type and endpoint already exists.');
    return;
  }

  if (!sottoscrizione.endpoint) {
      this.messageService.add({severity: 'warn', summary: 'Attention', detail: 'Attention, it is mandatory to insert endpoint.', life: 3000});
      return;
  }  

  try {
      if (sottoscrizione.header) {
          JSON.parse(sottoscrizione.header);
      }

      // Esegui la richiesta PATCH per aggiornare la sottoscrizione esistente
      this.updateSubscriptionPatch(this.configService.translate("orion_ld_url_subscription"), sottoscrizione.id, sottoscrizione.endpoint, sottoscrizione.types, sottoscrizione.header)
      .subscribe(response => {
          // Aggiorna la sottoscrizione nella lista locale
          const index = this.sottoscrizioni.findIndex(sub => sub.id === sottoscrizione.id);
          if (index !== -1) {
              this.sottoscrizioni[index] = {
                  ...sottoscrizione,
                  types: typesArray,
                  endpoint: subscriptionUrl
              };
          }

          this.sottoscrizioneDialog = false;
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'Subscription updated successfully.', life: 3000});
          console.log('Subscription updated successfully', response);
          this.updateLista(0);
      }, error => {
          this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error in subscription update.', life: 3000});
          console.error('Error in subscription update', error);
      });
  } catch (e) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error in subscription update, invalid JSON', life: 3000});
      console.error('Error in subscription update, invalid JSON');
  }
}
toggleSubscriptionStatus(sottoscrizione: any) {
  const newStatus = sottoscrizione.status === 'active' ? 'paused' : 'active';
  const url = `${this.configService.translate('orion_ld_url_subscription')}/${sottoscrizione.id}`;
  const body = { isActive: newStatus === 'active' };

  this.http.patch(url, body, { headers: { 'Content-Type': 'application/json' } })
    .subscribe(response => {
      sottoscrizione.status = newStatus;
      const index = this.sottoscrizioni.findIndex(sub => sub.id === sottoscrizione.id);
      if (index !== -1) {
        this.sottoscrizioni[index] = {
          ...sottoscrizione,
          status: newStatus
        };
      }

      this.sottoscrizioneDialog = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `Subscription ${newStatus === 'active' ? 'started' : 'paused'} successfully.`,
        life: 3000
      });
      console.log('Subscription updated successfully', response);
      this.updateLista(0);

    }, error => {
      console.error('Error updating subscription status', error);
    });
}
updateSubscriptionPatch(url: string, id: string, endpoint: string, types: string[] | string, header: string) {
  // Converti types in un array se è una stringa separata da virgole
  const typesArray = Array.isArray(types) ? types : (types ? types.split(',') : []);
  console.log("typesArray: ",typesArray);

  let receiverInfo;
  try {
    receiverInfo = header ? JSON.parse(header) : [];
    if (!Array.isArray(receiverInfo)) {
      throw new Error('receiverInfo must be an array');
    }
  } catch (e) {
    console.error('Invalid JSON in header:', e);
    throw new Error('Invalid JSON in header');
  }
  
  const body = {
    notification: {
      format: "normalized",
      endpoint: {
        uri: endpoint,
        accept: "application/json"
      }
    },
    entities: typesArray.map(type => ({ type }))
  };
 if (header != null && header != '') {
    let headerWithoutNewlines = header.replace(/\n/g, '');
    // Parse the string back into a JSON array
    let headerArray = JSON.parse(headerWithoutNewlines);
    body.notification.endpoint['receiverInfo'] = headerArray;
  }
  console.log('Request body:', body);
  return this.http.patch(`${url}/${id}`, body);
}

hideDialog(){
  this.sottoscrizioneDialog = false;
  this.sottoscriviDialogNew = false;
}
openNew(){
  this.sottoscriviDialogNew = true;
  this.endpoint='';
  this.type=[];
  this.header='';
} 

  saveNewSottoscrizione(){
    const typesArray = Array.isArray(this.type) ? this.type : [this.type];

    const existingSubscription = this.sottoscrizioni.some(s => {
        const sTypesArray = Array.isArray(s.types) ? s.types : (typeof s.types === 'string' ? [s.types] : []);
        const endpointMatch = s.endpoint === this.endpoint;
        const typeMatch = sTypesArray.some(type => typesArray.includes(type));
        return endpointMatch && typeMatch;
    });
    
    console.log('existingSubscription:', existingSubscription);
  
  
    if (existingSubscription) {
      this.messageService.add({severity:'error', summary: 'Error', detail: 'The subscription with this pair of type and endpoint already exists.', life: 3000});
      console.error('The subscription with this pair of type and endpoint already exists.');
      return;
    }
    if (this.endpoint === null || this.endpoint === ''){
      this.messageService.add({severity:'warn', summary: 'Attention', detail: 'Attention, it is mandatory to insert endpoint.', life: 3000});
      return;
    } 

    try {
      if (this.header != null && this.header != '') 
        JSON.parse(this.header);
   this.subscription.createSubscription(this.configService.translate("orion_ld_url_subscription"), this.endpoint,this.type,this.header)
   .subscribe(response => {
       this.messageService.add({severity:'success', summary: 'Success', detail: 'Subscription created successfully.', life: 3000});
       console.log('Subscription created successfully', response);
       this.updateLista(0);
   }, error => {
       this.messageService.add({severity:'error', summary: 'Error', detail: 'Error in subscription creation.', life: 3000});
       console.error('Error in subscription creation', error);
   });
  } catch (e) {
    this.messageService.add({severity:'error', summary: 'Error', detail: 'Error in subscription creation, invalid JSON', life: 3000});
    console.error('Error in subscription creation, invalid JSON');

  }
}
viewSottoscrizione(subscritionDetails){
  this.subscriptionDetails = JSON.stringify(subscritionDetails.data, null, 2);
  this.view = true;
}
}
