import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import * as L from 'leaflet';
import 'leaflet-mouse-position';
import 'leaflet-draw';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NbAuthOAuth2JWTToken, NbAuthService } from '@nebular/auth';
import { JwtHelperService } from '@auth0/angular-jwt';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { ConfigService } from 'app/config.service';
import { catchError, throwError ,interval} from 'rxjs';
import 'leaflet.fullscreen';
import * as CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { DagPollingService } from 'app/dagpolling.service';
import { MessageService } from 'primeng/api';
import * as turf from '@turf/turf';
import 'leaflet-control-geocoder';

@Component({
  selector: 'ngx-fire-missions',
  templateUrl: './fire-missions.component.html',
  styleUrls: ['./fire-missions.component.scss']
})


export class FireMissionsComponent implements OnInit {
  @ViewChild('map') mapContainer!: ElementRef;
  map!: L.Map;
  token;
  drawnItems!: L.FeatureGroup;
  customMarkers;
  latitude: number;
  longitude: number;
  pointGeojson :any;
  polygonGeojson:any;
  isButtonEnabled:boolean;
  public showInputForm: boolean = false;
  public lat: number;
  public lng: number; 
  constructor(private http: HttpClient,private auth: NbAuthService,private jwtHelper: JwtHelperService,private configService: ConfigService, private dagPollingService: DagPollingService,private messageService: MessageService) { }

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
    let isEditing = false;
    this.customMarkers = []; // Array per tenere traccia dei marker personalizzati
  
    const provider = new OpenStreetMapProvider();
    const redIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    const searchControl = GeoSearchControl({
      provider: provider,
      style: 'bar',
      showMarker: false, 
      classNames: {
        input: 'custom-search-input'
      }
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
    /*L.control.locate({
      position: 'topleft',
      setView: 'once',
      flyTo: true,
      keepCurrentZoomLevel: true,
      strings: {
        title: "Show me where I am"
      },
      locateOptions: {
        enableHighAccuracy: true
      }
    }).addTo(this.map);*/
  
    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);
    this.map.addControl(searchControl);
  
    // Override Leaflet Draw tooltips
    L.drawLocal.draw.toolbar.buttons.marker = 'Add an ignition point';
    L.drawLocal.draw.handlers.marker.tooltip.start = 'Click to place an ignition point';
    L.drawLocal.draw.toolbar.buttons.polygon = 'Add affected area - polygon';
    L.drawLocal.draw.handlers.polygon.tooltip.start = 'Click to place the area - polygon';
    L.drawLocal.draw.toolbar.buttons.rectangle = 'Add affected area - rectangle';
    L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Click to place the area - rectangle';
  
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: true,
          showArea: true,
          shapeOptions: {
            color: '#3388f0'
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#3388f0'
          }
        },
        marker: {
          icon: redIcon ,                 
        },
        polyline: false,
        circle: false,
        circlemarker: false
      },
      edit: {
        featureGroup: this.drawnItems,
        remove: true
      }
    });
  
    this.map.addControl(drawControl);
  
    var MousePositionControl = L.Control.extend({
      options: {
        position: 'bottomleft',
      },
      onAdd: function (map) {
        this._container = L.DomUtil.create('div', 'mouse-position-control');
        this._container.innerHTML = 'No coordinates';
        return this._container;
      },
      update: function (lat, lng) {
        this._container.innerHTML = '' + L.Util.formatNum(lat, 5) + ', ' + L.Util.formatNum(lng, 5) + '';
      },
      clear: function () {
        this._container.innerHTML = 'No coordinates';
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
      const layer = event.layer;
      if (event.layerType === 'marker') {
        layer.bindTooltip('This is a fire point', {permanent: false, direction: 'top'});
        layer.on('mouseover', function () {
          layer.openTooltip();
        });
        layer.on('mouseout', function () {
          layer.closeTooltip();
        });
      }
      this.drawnItems.addLayer(layer);
      this.updateCoordinates();
    });
  
    this.map.on('draw:deleted', (event: any) => {
      event.layers.eachLayer((layer: any) => {
        this.drawnItems.removeLayer(layer);
        this.map.removeLayer(layer); // Forza la rimozione dalla mappa
      });
      this.updateCoordinates();
    });
  
    this.map.on('draw:editstart', () => {
      isEditing = true;
      this.isButtonEnabled = false;
    });
  
    this.map.on('draw:editstop', () => {
      isEditing = false;
      this.updateCoordinates();
    });
  
    this.map.on('draw:editreset', () => {
      isEditing = false;
      this.isButtonEnabled = false;
    });
  
    this.map.on('draw:edited', () => {
      isEditing = false;
      this.isButtonEnabled = false;
    });
  
    this.map.on('layerremove', (event: any) => {
      console.log('Entro layerremove:', event.layer);
      this.drawnItems.removeLayer(event.layer);
      this.map.removeLayer(event.layer); // Forza la rimozione dalla mappa
      if (!isEditing) {
        this.updateCoordinates();
      }
    });
  
    this.updateCoordinates();
  
    (L.control as any).fullscreen({
      position: 'topleft'
    }).addTo(this.map);
  
    this.map.on('geosearch/showlocation', (event: any) => {
      const greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
     
      const marker = L.marker([event.location.y, event.location.x], { icon: greenIcon });
      marker.setOpacity(0.6);
      this.drawnItems.addLayer(marker);
      this.customMarkers.push(marker); 
    });
  }
  
  // Funzione per aggiungere un marker con coordinate specifiche
  addMarker(): void {
    if (this.lat && this.lng) {
      const latLng = L.latLng(this.lat, this.lng);
      const marker = L.marker(latLng).addTo(this.map);
      this.customMarkers.push(marker); 
      marker.bindPopup(`PlaceHolder added at [${this.lat}, ${this.lng}]`).openPopup();
      this.showInputForm = false;
    }
  }
  
  updateCoordinates() {
    const pointFeatures = [];
    const polygonFeatures = [];
  
    this.drawnItems.eachLayer((layer: any) => {
      const geojson = layer.toGeoJSON();
      if (geojson.geometry.type === 'Point' && !this.customMarkers.includes(layer)) { // Escludi i marker aggiunti da addMarker
        pointFeatures.push(geojson);
      } else if (geojson.geometry.type === 'Polygon') {
        polygonFeatures.push(geojson);
      }
    });
  
    this.pointGeojson = {
      type: 'FeatureCollection',
      features: pointFeatures
    };
  
    this.polygonGeojson = {
      type: 'FeatureCollection',
      features: polygonFeatures
    };
  
    console.log('Point GeoJSON aggiornato:', this.pointGeojson);
    console.log('Polygon GeoJSON aggiornato:', this.polygonGeojson);
  
    this.updateButtonState();
  }
  
  updateButtonState(): void {
    const points = this.pointGeojson.features;
    const polygons = this.polygonGeojson.features;
  
    if (points.length === 0 || polygons.length === 0) {
      this.isButtonEnabled = false;
      return;
    }
  
  
    for (let point of points) {
      let isInside = false;
      for (let polygon of polygons) {
        if (turf.booleanPointInPolygon(point, polygon)) {
          isInside = true;
          break;
        }
      }
      if (!isInside) {
        this.isButtonEnabled = false;
        return;
      }
    }
  
    this.isButtonEnabled = this.drawnItems.getLayers().length > 0;
  }
  /* Start con Airflow commentato
  startDag() {
    this.isButtonEnabled = false;
    const url = this.configService.translate("url_airflow")+'/api/v1/dags/DAG_Monitoring/dagRuns';
    

    const now = new Date();
    const uid = uuidv4();
    const entityId = `urn:ngsi-ld:Alert:${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}-${uid}`;

    const body = {
      "conf": { "geojson": this.geojson, "entity_id":entityId,"entity_type":"Fire"}
    };


    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'application/json'

    });


    this.http.post(url, body, { headers,responseType: 'json' })
      .pipe(
        catchError(error => {
          console.error('There was an error during the POST request:', error);
          return throwError(error);
        })
      )
      .subscribe((response: any) => {
        const dagRunId = response.dag_run_id;
        this.dagPollingService.startPolling(dagRunId, (status: string) => {
        if (status === 'success') {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: `Mission created successfully with id <b>${entityId}</b>`, sticky: true });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Task execution failed', sticky: true });
        }  
          this.isButtonEnabled = true;
        });
      });
  }*/  
      
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
    
    const geometries = this.polygonGeojson.features.map(feature => ({
      "type": feature.geometry.type,
      "coordinates": feature.geometry.coordinates.map(coord => 
        Array.isArray(coord[0]) ? coord.map(innerCoord => innerCoord.map(Number)) : coord.map(Number)
      )
    }));
    
    const point = this.pointGeojson.features.map(feature => ({
      "type": feature.geometry.type,
      "coordinates": feature.geometry.coordinates.map(coord => 
        Array.isArray(coord) ? 
          (Array.isArray(coord[0]) ? coord.map(innerCoord => innerCoord.map(Number)) : coord.map(Number)) 
          : Number(coord)
      )
    }));
    
    const entity = {
     /* "@context": [

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
        "value": "Safety"
    },
    "event": {
        "type": "Property",
        "value": "Fire"
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
    ignitionPoints: {
      type: "GeoProperty",
      value: {
        "type": point.length > 1 ? "MultiPoint" : point[0].type,
        "coordinates": point.length > 1 ? point.map(point => point.coordinates) : point[0].coordinates
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


