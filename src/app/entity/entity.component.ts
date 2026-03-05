import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ConfigService } from 'app/config.service';
import { ConfirmationService } from 'primeng/api';
import { OidcUserInformationService } from 'app/pages/auth/services/oidc-user-information.service';
@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.scss']
})
export class EntityComponent implements OnInit {
  entity='';
  endpoint='';
  entitys = [];
  header='';
  entityDialog: boolean;
  entityDialogNew:boolean;
  types: any;
  type:any='';
  display: boolean = false;
  view: boolean = false;
  entityId:any="";
  entityDetails:any="";
  showTimestamps: boolean = false;
  entityDetailsString: string = '';
  public isAmministrative;
  constructor(private oidcUserInfoService: OidcUserInformationService,private configService: ConfigService,private http: HttpClient,private messageService : MessageService,private confirmationService : ConfirmationService) {
    this.oidcUserInfoService.getRole().subscribe(roles => {
      this.isAmministrative = roles.includes('ADMINISTRATIVE');
    });
  }


    ngOnInit(): void {
      this.caricaLista();
    }
    caricaLista() {
      this.http.get(`${this.configService.translate("orion_ld_url_type")}`).subscribe((data: any) => {
        this.types = data.typeList.map(type => ({ type: type }));
        if (data.typeList && Array.isArray(data.typeList)) {
          data.typeList.forEach(tipo => {
            let limit = 20; 
            let offset = 0;
            let allEntities = [];
    
            const fetchEntities = () => {
              this.http.get(`${this.configService.translate("orion_ld_url_entity")}/?type=${tipo}&limit=${limit}&offset=${offset}&options=sysAttrs`).subscribe((entityData: any) => {
                if (entityData && Array.isArray(entityData)) {
                  allEntities = [...allEntities, ...entityData];
                  if (entityData.length === limit) {
                    offset += limit;
                    fetchEntities(); 
                  } else {
                    this.entitys = [...this.entitys, ...allEntities.map(entity => ({ entity }).entity)];
                  }
                }
              });
            };
    
            fetchEntities();
          });
        }
      });
    }

    
    viewEntity(entityDetails){
    this.entityDetails = entityDetails;
    this.updateEntityDetailsSenzaTimestamp();
    this.view = true;
  }
  deleteEntity(entityId: any) {
    this.entityId = entityId; 
    this.display = true;
    
}  
    
deleteEntityConfirm(entityId: any) {
  this.http.delete(this.configService.translate("orion_ld_url_entity") + "/" + entityId).subscribe(() => {
    this.messageService.add({severity:'success', summary: 'Success', detail: 'Entity cancelled successfully.', life: 3000});
    console.log('Entity cancelled successfully');
    this.entitys = this.entitys.filter(entity => entity.id !== entityId);
  },
  (error) => { 
    this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to cancel entity.', life: 3000});
    console.error('Failed to cancel entity', error);
  });
}
    
  hideDialog(){
    this.entityDialog = false;
    this.entityDialogNew=false;
  }
  openNew(){
    this.http.get(`${this.configService.translate("orion_ld_url_type")}`).subscribe((data: any) => {
      this.types = data.typeList.map(type => ({type: type}));
    });  
    this.entityDialogNew = true;
    this.entity='';
    this.type='';
  }
  saveNewEntity(){

    if (this.entitys.some(obj => obj.id === this.entity)) {
    this.messageService.add({severity:'warn', summary: 'Attention', detail: 'The entity already exists.', life: 3000});
  } else {
    this.createEntity()
    .subscribe(response => {
      this.messageService.add({severity:'success', summary: 'Success', detail: 'Entity created successfully.', life: 3000});
      console.log('Entity created successfully', response);
      this.http.get(`${this.configService.translate("orion_ld_url_entity")}/${this.entity}`).subscribe((entityData: any) => {
        if (entityData) 
          this.entitys.push(entityData);
      });

    }, error => {
      this.messageService.add({severity:'error', summary: 'Error', detail: 'Error in creating the Entity.', life: 3000});
      console.error('Error in creating the Entity', error);
    });
  }
  }
  

  createEntity() {
    const entity = {
      id:  this.entity,
      type: this.type.type,
    };

    return this.http.post(this.configService.translate("orion_ld_url_entity"), entity, {
      headers: { 'Content-entity': 'application/json' }
    });
  }
  toggleTimestamps() {
    this.showTimestamps = !this.showTimestamps;
    if (this.showTimestamps) {
      this.updateEntityDetailsComleto();
    } else {
      this.updateEntityDetailsSenzaTimestamp();
    }
  }

  updateEntityDetailsComleto() {
    const jsonString = JSON.stringify(this.entityDetails, null, 2);
    this.entityDetailsString = this.addIndentation(jsonString.substring(1, jsonString.length)); // Rimuove la prima e l'ultima parentesi graffa e aggiunge indentazione
  }

  updateEntityDetailsSenzaTimestamp() {
    const entityDetailsCopy = JSON.parse(JSON.stringify(this.entityDetails));
    this.removeTimestamps(entityDetailsCopy);
    const jsonString = JSON.stringify(entityDetailsCopy, null, 2);
    this.entityDetailsString = this.addIndentation(jsonString.substring(1, jsonString.length)); // Rimuove la prima e l'ultima parentesi graffa e aggiunge indentazione
  }

  removeTimestamps(obj: any) {
    if (obj && typeof obj === 'object') {
      delete obj.createdAt;
      delete obj.modifiedAt;
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
          this.removeTimestamps(obj[key]);
        }
      }
    }
  }

  addIndentation(jsonString: string): string {
    return jsonString.split('\n').map(line => '        ' + line).join('\n'); // Aggiunge due spazi di indentazione a ogni riga
  }
}

