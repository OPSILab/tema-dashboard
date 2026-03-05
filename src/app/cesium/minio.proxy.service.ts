import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MinioService } from './minio.services';


@Injectable({
  providedIn: 'root'
})
export class MinioProxyService {
  constructor(private http: HttpClient, private minioService: MinioService) {}

  getTilesetJson(url: string): Promise<any> {
    if (!url) {
      throw new Error('URL is undefined');
    }
    const [bucket, ...objectParts] = url.split('/');
    const objectName = objectParts.join('/');
    return this.minioService.getObject(bucket, objectName).then((data) => {
      const text = data.toString('utf8');
      return JSON.parse(text);
    });
  }

  async getUrlPresigned(url) {
    const parts = url.split('/');
    const bucket = parts[0];
    const objectName = parts.slice(1).join('/'); 
    return await  this.minioService.getUrlPresigned( bucket, objectName);
      
  }
  async getUrlPresignedFolder(url) {
    const parts = url.split('/');
    const bucket = parts[0];
    const objectName = parts[1]; 
    return await  this.minioService.getPresignedUrlsForFolder( bucket, objectName);
      
  }    
  async getTilesets(): Promise<any> {
    return await this.minioService.listJsonFiles('eng');
  } 
}
