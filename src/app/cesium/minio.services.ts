import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'app/config.service';
import { environment } from 'environments/environment';

import { Client } from 'minio';


@Injectable({
  providedIn: 'root'
})
export class MinioService {
    private minioClient: Client;
    
  constructor(configService:ConfigService,private http: HttpClient) {
    this.minioClient = new Client({
      endPoint: configService.translate("minio"),
      port: Number(environment.minio_port) || 443,
      useSSL: true,
      accessKey: configService.translate("access_key_minio"),
      secretKey: configService.translate("secret_key_minio"),
      region: 'us-east-1',
    });
    

  }

 
  getObject(bucket: string, objectName: string): Promise<Buffer> {

    return new Promise(async (resolve, reject) => {
      const dataStream = await this.minioClient.getObject(bucket, objectName);
      const chunks: Buffer[] = [];

    dataStream.on('data', function (chunk) {
      chunks.push(chunk);
    });

    dataStream.on('end', function () {
      resolve(Buffer.concat(chunks));
    });

    dataStream.on('error', function (err) {
      console.log(err);
      reject(err);
    });
  });
        
}
  

  async getUrlPresigned(bucket, objectName) {
    return new Promise((resolve, reject) => {
      this.minioClient.presignedUrl('GET', bucket, objectName, 24*60*60, (err, presignedUrl) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(presignedUrl);
        }
      });    
    });
  }

  async getPresignedUrlsForFolder(bucket, folder) {
    return new Promise((resolve, reject) => {
      const objectsStream = this.minioClient.listObjectsV2(bucket, folder, true);
      
      const presignedUrls = {};
     
      objectsStream.on('data', async (obj) => {
        try {
          const presignedUrl = await this.getUrlPresigned(bucket, obj.name);
          presignedUrls[obj.name] = presignedUrl;
        } catch (err) {
          console.log(err);
          reject(err);
        }
      });
      
      
      
      objectsStream.on('error', (err) => {
        console.log(err);
        reject(err);
      });
    });
  }
  

  async listObjects(bucket: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const objects = [];
      const stream = this.minioClient.listObjects(bucket, '', true);
      stream.on('data', (obj) => { objects.push(obj); });
      stream.on('error', (err) => { reject(err); });
      stream.on('end', () => { resolve(objects); });
    });
  }
  async listFolders(bucket: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const folders = new Set();
      const stream = this.minioClient.listObjectsV2(bucket, '', true);
      stream.on('data', (obj) => { 
        if (obj.name) {
          const folderName = obj.name.split('/')[0];
          folders.add(bucket + "/" + folderName);
        }
      });
      stream.on('error', (err) => { reject(err); });
      stream.on('end', () => { resolve(Array.from(folders)); });
    });
  }
  async listJsonFiles(bucket: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const jsonFiles = new Set();
      const stream = this.minioClient.listObjectsV2(bucket, '', true);
      stream.on('data', (obj) => { 
        if (obj.name){
          const fileName = obj.name.split('/')[1];
          if (fileName.endsWith('.json')) 
            
            jsonFiles.add(bucket + "/" + obj.name);
          }
      });
      stream.on('error', (err) => { reject(err); });
      stream.on('end', () => { resolve(Array.from(jsonFiles)); });
    });
  }
}  
