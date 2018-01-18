import { Injectable, Inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { S3, Credentials } from 'aws-sdk';
import * as clone from 'clone';

@Injectable()
export class StorageService {

  private _S3: S3 = null;

  init(credentials: Credentials): void {
    this._S3 = new S3({
      apiVersion: '2006-03-01',
      region: environment.aws.s3.region,
      credentials
    });
  }

  listFolder(folder: string = ''): Promise<string[]> {
    return this._S3.listObjectsV2({
      Bucket: environment.aws.s3.bucket,
      Prefix: folder
    })
      .promise()
      .then(this._extractS3ObjectKeys)
      .then(this._filterByJsonExtension);
  }

  getObject<T>(objKey: string): Promise<T> {
    return this._S3.getObject({
      Bucket: environment.aws.s3.bucket,
      Key: objKey
    })
      .promise()
      .then((res: S3.GetObjectOutput) => {
        const json = JSON.parse(res.Body.toString());
        return <T>{ ...json, storageKey: objKey }
      });
  }

  copyObject(objKey: string, destKey: string): Promise<void> {
    return this._S3.copyObject({
      Bucket: environment.aws.s3.bucket,
      CopySource: `/${environment.aws.s3.bucket}/${objKey}`,
      Key: destKey
    })
      .promise()
      .then((res: S3.CopyObjectOutput) => void 0);
  }

  setObject(objKey: string, content: any): Promise<void> {
    const objectToSet = this._getCleanObjectToWrite(content);
    return this._S3.putObject({
      Bucket: environment.aws.s3.bucket,
      Key: objKey,
      Body: JSON.stringify(objectToSet)
    })
      .promise()
      .then((res: S3.PutObjectOutput) => void 0);
  }

  objectExists(objKey: string): Promise<boolean> {
    return this._S3.headObject({
      Bucket: environment.aws.s3.bucket,
      Key: objKey
    })
      .promise()
      .then((res: S3.HeadObjectOutput) => true);
  }

  removeObject(objKey: string): Promise<void> {
    return this._S3.deleteObject({
      Bucket: environment.aws.s3.bucket,
      Key: objKey
    })
      .promise()
      .then((res: S3.DeleteObjectOutput) => void 0)
  }

  private _extractS3ObjectKeys(objs: S3.ListObjectsV2Output): string[] {
    return objs.Contents.map(obj => obj.Key);
  }

  private _filterByJsonExtension(keys: string[]): string[] {
    return keys.filter((key: string) => key.indexOf('.json') === key.length - 5);
  }

  private _getCleanObjectToWrite(object: any): any {
    const objectToSet = clone(object, false);
    if (objectToSet.hasOwnProperty('storageKey')) {
      delete objectToSet['storageKey'];
    }
    return objectToSet;
  }

}
