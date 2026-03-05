import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import * as Cesium from 'cesium';
import { MinioProxyService } from './minio.proxy.service';
declare var window: any;
@Component({
  selector: 'ngx-cesium',
  templateUrl: './cesium.component.html',
  styleUrls: ['./cesium.component.scss']
})
export class CesiumComponent  implements AfterViewInit, OnDestroy {
  private viewer: Cesium.Viewer;
  private tileset: Cesium.Cesium3DTileset;
  public tilesets: string[] = []; 
  public selectedTileset: string; 
  public isLoading: boolean = false;
  

  constructor(private minioProxy: MinioProxyService) { }

  async ngAfterViewInit() {
    
    this.viewer = new Cesium.Viewer('cesiumContainer', {
      baseLayer: new Cesium.ImageryLayer(await Cesium.createWorldImageryAsync({

        style: Cesium.IonWorldImageryStyle.AERIAL
      })),


      baseLayerPicker: false,
      geocoder: false,
      sceneModePicker: false
  });
  

this.tilesets = await this.minioProxy.getTilesets();
}  

async cesiumLoad(){
  this.isLoading = true; 
  if (this.tileset) 
    this.viewer.scene.primitives.remove(this.tileset);

  this.tilesets = await this.minioProxy.getTilesets();

  this.minioProxy.getTilesetJson(this.selectedTileset).then(async (tilesetJson) => {
    
    const pathElements = this.selectedTileset.split('/');
    const relativePath = pathElements.slice(0, 2).join('/');

    const setPresignedUrl = async (node,content) => {
      if (node.content.url.endsWith('.json')) {
        // Carica il file JSON interno
        const internalJson = await this.minioProxy.getTilesetJson(relativePath +'/'+ node.content.url);
        let urlParts = relativePath.split('/');
        let directoryPath = urlParts[1] +'/'; 
        // Modifica gli URL nel file JSON interno
        await setPresignedUrl(internalJson.root,directoryPath);
        
        // Salva il file JSON interno modificato e ottieni un URL per esso
        let internalJsonString = JSON.stringify(internalJson);
        let internalBlob = new Blob([internalJsonString], {type: "application/json"});
        node.content.url = URL.createObjectURL(internalBlob);
      } else {
        // Modifica l'URL come prima
        if(node.content.url.split('/')[1] === content)
          node.content.url = await this.minioProxy.getUrlPresigned(relativePath +'/'+ node.content.url);
        else
          node.content.url = await this.minioProxy.getUrlPresigned(relativePath +'/'+content+ node.content.url);
       
      }
    
      // Processa i nodi figli come prima
      if (node.children) {
        for (let child of node.children) {
          await setPresignedUrl(child,content);
        }
      }
    }
    
    await setPresignedUrl(tilesetJson.root,'');
    
    let jsonString = JSON.stringify(tilesetJson);
    let blob = new Blob([jsonString], {type: "application/json"});
    let url = URL.createObjectURL(blob);
    this.tileset = await Cesium.Cesium3DTileset.fromUrl( url );
    this.viewer.scene.primitives.add(this.tileset);
    
    //this.tileset.readyPromise.then((tileset) => {
      var longitude = (tilesetJson.properties.Longitude.maximum + tilesetJson.properties.Longitude.minimum) / 2;
      var latitude = (tilesetJson.properties.Latitude.maximum + tilesetJson.properties.Latitude.minimum) / 2;
      var height = tilesetJson.properties.Height.maximum;
      var cartesian = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);  
      this.viewer.camera.flyTo({
              destination: cartesian
      });

      this.viewer.camera.flyToBoundingSphere(this.tileset.boundingSphere);
      this.isLoading = false;
    /*}).otherwise((error) => {
        console.log(error);
        this.isLoading = false;
    });*/
  });
}

  


  
 
  ngOnDestroy(): void {
    if (this.tileset) {
      this.viewer.scene.primitives.remove(this.tileset);
    }
  }

}