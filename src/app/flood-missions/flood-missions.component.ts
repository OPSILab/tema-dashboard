import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import * as L from 'leaflet';
import 'leaflet-mouse-position';
import 'leaflet-draw';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NbAuthOAuth2JWTToken, NbAuthService } from '@nebular/auth';
import { JwtHelperService } from '@auth0/angular-jwt';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { catchError, throwError } from 'rxjs';
import { ConfigService } from 'app/config.service';
import { v4 as uuidv4 } from 'uuid';
import { MessageService } from 'primeng/api';
import 'leaflet.fullscreen';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'ngx-flood-missions',
  templateUrl: './flood-missions.component.html',
  styleUrls: ['./flood-missions.component.scss']
})
export class FloodMissionsComponent implements OnInit {
  @ViewChild('map') mapContainer!: ElementRef;
  map!: L.Map;
  token;
  drawnItems!: L.FeatureGroup;
  latitude: number;
  longitude: number;
  geojson :any;
  isButtonEnabled:boolean;
  constructor(private http: HttpClient,private auth: NbAuthService,private jwtHelper: JwtHelperService,private configService: ConfigService, private messageService: MessageService) { }

  ngOnInit(): void {    
    L.Icon.Default.imagePath = "assets/leaflet/images/";
  }
  
  
  ngAfterViewInit(): void {
    this.auth.getToken().subscribe((x: NbAuthOAuth2JWTToken) => {
      this.token = x;
      localStorage.setItem('token', x.getValue()); // salva il token nel localStorage
      const decodedToken = this.jwtHelper.decodeToken(localStorage.getItem('token'));
      this.latitude= decodedToken.latitude;
      this.longitude = decodedToken.longitude;
      this.initializeMap();
    });
    
  }

  initializeMap(): void {
    const provider = new OpenStreetMapProvider();
  
    const searchControl = GeoSearchControl({
      provider: provider,
      style: 'bar'
    });
  
    this.map = L.map(this.mapContainer.nativeElement).setView([this.latitude, this.longitude], 13);
    (window as any).type = true;
  
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });

    const baseMaps = {
      'OpenStreetMap': osmLayer
    };
  
    osmLayer.addTo(this.map);
    //L.control.layers(baseMaps).addTo(this.map);
  
    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);
    this.map.addControl(searchControl);
  
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: true,
          showArea: true,
          shapeOptions: {
            color: '#3388f0'
          }
        },
       /* polyline: {
          shapeOptions: {
            color: '#f357a1'
          }
        },*/
        marker:false,
        polyline: false, //devo nascondere le linee
        circle: false,
        circlemarker: false
      },
      edit: {
        featureGroup: this.drawnItems
      }
    });
  
    this.map.addControl(drawControl);
  
    var MousePositionControl = L.Control.extend({
      options: {
        position: 'bottomleft',
      },
      onAdd: function (map) {
        this._container = L.DomUtil.create('div', 'mouse-position-control');
        this._container.innerHTML = 'Nessuna coordinata';
        return this._container;
      },
      update: function (lat, lng) {
        this._container.innerHTML = '<b>' + L.Util.formatNum(lat, 5) + ', ' + L.Util.formatNum(lng, 5) + '</b>';
      },
      clear: function () {
        this._container.innerHTML = 'Nessuna coordinata';
      }
    });
  
    var mousePositionControl = new MousePositionControl();
    this.map.addControl(mousePositionControl);
  
    this.map.on('mousemove', function (e) {
      mousePositionControl.update(e.latlng.lat, e.latlng.lng);
    });
  
    this.map.on('mouseout', function () {
      mousePositionControl.clear();
    });
  
    this.map.on('draw:created', (event: any) => {
      // Add the new shape without clearing existing shapes
      const layer = event.layer;
      this.drawnItems.addLayer(layer);
      this.updateCoordinates();
    });
  
    this.map.on('draw:deleted', () => {
      this.updateCoordinates();
    });

   
  
    this.map.on('draw:editstart', () => {

      this.isButtonEnabled=false;
    });
  
    this.map.on('draw:editstop', () => {

      this.updateCoordinates();
    });
  
    this.map.on('draw:editreset', () => {

      this.isButtonEnabled=false;
    });
  
    this.map.on('draw:edited', () => {

      this.isButtonEnabled=false;
    });
  
  
  
    this.updateCoordinates();
  
    (L.control as any).fullscreen({
      position: 'topleft'
    }).addTo(this.map);


  }
  
  updateCoordinates() {
      const features = [];
      this.drawnItems.eachLayer((layer: any) => {
        const geojson = layer.toGeoJSON();
        features.push(geojson);
      });
      this.geojson = {
        type: 'FeatureCollection',
        features: features
      };
      console.log('GeoJSON aggiornato:', this.geojson);
      this.updateButtonState();
  }  
  updateButtonState(): void {
    this.isButtonEnabled = this.drawnItems.getLayers().length > 0;
  }
  createEntity() {
    this.updateCoordinates();

    if (!this.isButtonEnabled) {
       return;
    }
    const now = new Date();
    const tenDaysLater = new Date(now);
    tenDaysLater.setDate(now.getDate() + 10);
    const uid = uuidv4();
    const entity_id = `urn:ngsi-ld:${"Alert"}:${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}-${uid}`;
    
    const geometries = this.geojson.features.map(feature => ({
      "type": feature.geometry.type,
      "coordinates": feature.geometry.coordinates.map(coord => 
        Array.isArray(coord[0]) ? coord.map(innerCoord => innerCoord.map(Number)) : coord.map(Number)
      )
    }));
    
  
    
    const entity = {
      /*"@context": [

        "https://schema.lab.fiware.org/ld/context"
      ],*/
      id: entity_id,
      type: "Alert",
      "sender": {
        "type": "Property",
        "value": "alert@tema-project.eu"
      },
      "sent": {
          "type": "Property",
          "value": now.toISOString()
      },
      "status": {
          "type": "Property",
          "value": "Exercise"
      },
      "msgType": {
          "type": "Property",
          "value": "Alert"
      },
      "scope": {
          "type": "Property",
          "value": "Private"
      },
      "category": {
        "type": "Property",
        "value": "Met"
    },
    "event": {
        "type": "Property",
        "value": "Flood"
    },
    "urgency": {
        "type": "Property",
        "value": "Immediate"
    },
    "severity": {
        "type": "Property",
        "value": "Severe"
    },
    "certainty": {
        "type": "Property",
        "value": "Observed"
    },
    "effective": {
        "type": "Property",
        "value": now.toISOString()
    },
    "expires": {
      "type": "Property",
      "value": tenDaysLater.toISOString()
    },
    "areaDesc": {
        "type": "Property",
        "value": "TEMA Pilot exercise"
    },
    location: {
      type: "GeoProperty",
      value: {
        "type": geometries.length > 1 ? "MultiPolygon" : geometries[0].type,
        "coordinates": geometries.length > 1 ? geometries.map(geometry => geometry.coordinates) : geometries[0].coordinates
      }
    },
    area: {
      type: "GeoProperty",
      value: {
        "type": geometries.length > 1 ? "MultiPolygon" : geometries[0].type,
        "coordinates": geometries.length > 1 ? geometries.map(geometry => geometry.coordinates) : geometries[0].coordinates
      }
    },
    
    bm_id: CryptoJS.MD5(entity_id).toString()
    };

    return this.http.post(this.configService.translate("orion_ld_url_entity"), entity, {
      //headers: { 'Content-Type': 'application/ld+json' }
      headers: { 'Content-Type': 'application/json' }

    })
    .subscribe(response => {
      this.messageService.add({severity:'success', summary: 'Success', detail: `Mission created successfully with id <b>${entity_id}</b>`, sticky: true });
      console.log('Mission created successfully', response);
      
    }, error => {
      this.messageService.add({severity:'error', summary: 'Error', detail: 'Error in creating the Mission.',  sticky: true });
      console.error('Error in creating the Mission', error);
    });
  }
  
  
  
}
