import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ConfigService } from 'app/config.service';
import { v4 as uuidv4 } from 'uuid';
import { OidcUserInformationService } from 'app/pages/auth/services/oidc-user-information.service';
@Component({
  selector: 'app-types',
  templateUrl: './types.component.html',
  styleUrls: ['./types.component.scss']
})
export class TypesComponent implements OnInit {
  type='';
  endpoint='';
  types = [];
  header='';
  typeDialog: boolean;
  typeDialogNew:boolean;
  selectedTypes:any; 
  public isAmministrative;
  constructor(private oidcUserInfoService: OidcUserInformationService, private configService: ConfigService,private http: HttpClient,private messageService : MessageService) {
    this.oidcUserInfoService.getRole().subscribe(roles => {
      this.isAmministrative = roles.includes('ADMINISTRATIVE');
    });
  }


    ngOnInit(): void {
      this.caricaLista();
    }
  caricaLista(){
    this.http.get(this.configService.translate("orion_ld_url_type")).subscribe((data: any) => {
        if (data.typeList && Array.isArray(data.typeList)) { // Verifica se typeList è un array
          this.types = data.typeList.map(type => ({ type }));
        } else {
          console.error("I dati restituiti non contengono la lista dei tipi.");
          this.messageService.add({severity:'success', summary: 'Successful', detail: 'Product Deleted', life: 3000});
        }
      }, error => {
        console.error("Si è verificato un errore durante il recupero dei dati:", error);
      });
  }
  editSottoscrizione(type: any) {
    this.type = type;
    this.endpoint = '';
    this.header = '';
    this.typeDialog = true;
  }
  createSubscription() {
    if (this.endpoint === null || this.endpoint === ''){
      this.messageService.add({severity:'warn', summary: 'Attention', detail: 'Attention, it is mandatory to insert endpoint.', life: 3000});
      return;
    } 
    this.http.get(this.configService.translate("orion_ld_url_subscription")).subscribe((data: any[]) => {
      const existingSubscription = data.find(subscription => 
        subscription.entities[0].type === this.type && 
        subscription.notification.endpoint.uri === this.endpoint
      );
      if (existingSubscription) {
        this.messageService.add({severity:'warn', summary: 'Attention', detail: 'The subscription with this type and endpoint already exists.', life: 3000});
        return;
      } 
        
        try {
          if (this.header != null && this.header != '') 
            JSON.parse(this.header);
        this.subscription(this.configService.translate("orion_ld_url_subscription"), this.endpoint, this.type,this.header)
          .subscribe(response => {
            this.messageService.add({severity:'success', summary: 'Success', detail: 'Subscription created successfully.', life: 3000});
            console.log('Subscription created successfully', response);
            this.typeDialog = false;
          }, error => {
            this.messageService.add({severity:'error', summary: 'Error', detail: 'Error in subscription creation.', life: 3000});
            console.error('Error creating subscription', error);
          });
          
      } catch (e) {
        this.messageService.add({severity:'error', summary: 'Error', detail: 'Error in subscription creation, invalid JSON', life: 3000});
        console.error('Error in subscription creation, invalid JSON');
  
      }
    }, error => {
      this.messageService.add({severity:'error', summary: 'Error', detail: 'An error occurred while retrieving the subscriptions.', life: 3000});
      console.error("An error occurred while retrieving the subscriptions:", error);
    });
    
  }
    
  hideDialog(){
    this.typeDialog = false;
    this.typeDialogNew=false;
  }
  openNew(){
    this.typeDialogNew = true;
    this.type='';
  }
  saveNewEntity(){
     // Verifica se il tipo esiste già
     if (this.types.some(obj => obj.type === this.type)) {
    this.messageService.add({severity:'warn', summary: 'Attention', detail: 'The type already exists.', life: 3000});
  } else {
    this.createEntity()
    .subscribe(response => {
      this.messageService.add({severity:'success', summary: 'Success', detail: 'Types created successfully.', life: 3000});
      console.log('Types created successfully', response);
      this.caricaLista();
    }, error => {
      this.messageService.add({severity:'error', summary: 'Error', detail: 'Error in creating the types.', life: 3000});
      console.error('Error in creating the types', error);
    });
  }
  }
  subscription(subscriptionUrl: string, notifyUrl: string, entityType: string,header:string) {


    const body = {
      "type": "Subscription",
      "entities": [{"type": entityType}],
      "notification": {
        "format": "normalized",
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

  createEntity() {
    const now = new Date();
    const uid = uuidv4();
    const entity = {
      id: `urn:ngsi-ld:${this.type}:${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}-${uid}`,
      type: this.type,
    };

    return this.http.post(this.configService.translate("orion_ld_url_entity"), entity, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

