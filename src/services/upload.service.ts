import { ShopifyClient } from '../core/client';
import fetch from 'node-fetch';
import FormData from 'form-data';

export interface StagedUploadTarget {
  url: string;
  resourceUrl: string;
  parameters: Record<string, string>;
}

export interface UploadOptions {
  contentType?: string;
  filename?: string;
  resourceType?: 'IMAGE' | 'VIDEO' | 'JSON' | 'PDF';
}

export class UploadService {
  private client: ShopifyClient;

  constructor(client: ShopifyClient) {
    this.client = client;
  }

  async createStagedUpload(
    options: UploadOptions = {}
  ): Promise<StagedUploadTarget> {
    const mutation = `
      mutation CreateStagedUpload($input: StagedUploadInput!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            url
            resourceUrl
            parameters {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await this.client.graphql({
      query: mutation,
      variables: {
        input: {
          resource: options.resourceType || 'IMAGE',
          filename: options.filename || 'file',
          mimeType: options.contentType || 'application/octet-stream',
          httpMethod: 'POST'
        }
      }
    });

    if (response.data?.stagedUploadsCreate.userErrors.length > 0) {
      throw new Error(response.data.stagedUploadsCreate.userErrors[0].message);
    }

    const target = response.data?.stagedUploadsCreate.stagedTargets[0];
    
    return {
      url: target.url,
      resourceUrl: target.resourceUrl,
      parameters: target.parameters.reduce((acc: Record<string, string>, param: any) => {
        acc[param.name] = param.value;
        return acc;
      }, {})
    };
  }

  async uploadFile(
    file: any,
    target: StagedUploadTarget,
    options: UploadOptions = {}
  ): Promise<string> {
    const formData = new FormData();
    
    Object.entries(target.parameters).forEach(([name, value]) => {
      formData.append(name, value);
    });

    if (typeof file === 'string') {
      formData.append('file', file);
    } else if (typeof file === 'object' && file.toString() === '[object Buffer]') {
      formData.append('file', file, options.filename || 'file');
    } else {
      formData.append('file', file);
    }

    const response = await fetch(target.url, {
      method: 'POST',
      body: formData as any
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return target.resourceUrl;
  }

  async uploadImage(file: any, options?: Omit<UploadOptions, 'resourceType'>): Promise<string> {
    const target = await this.createStagedUpload({
      ...options,
      resourceType: 'IMAGE',
      contentType: options?.contentType || 'image/png'
    });

    return this.uploadFile(file, target, options);
  }

  async uploadVideo(file: any, options?: Omit<UploadOptions, 'resourceType'>): Promise<string> {
    const target = await this.createStagedUpload({
      ...options,
      resourceType: 'VIDEO',
      contentType: options?.contentType || 'video/mp4'
    });

    return this.uploadFile(file, target, options);
  }

  async uploadJson(data: any, options?: Omit<UploadOptions, 'resourceType'>): Promise<string> {
    const buffer = Buffer.from(JSON.stringify(data));
    return this.uploadFile(buffer, await this.createStagedUpload({
      ...options,
      resourceType: 'JSON',
      contentType: 'application/json'
    }), options);
  }
}