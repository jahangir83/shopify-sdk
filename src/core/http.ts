import fetch from 'node-fetch';
import { ShopifyConfig, ShopifyErrorResponse } from './types';
import {
  ShopifyError,
  GraphQLParseError,
  GraphQLValidationError,
  RateLimitError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ServerError
} from './errors';

export interface HttpClientOptions {
  timeout?: number;
}

export class HttpClient {
  private config: ShopifyConfig;
  private options: HttpClientOptions;

  constructor(config: ShopifyConfig, options: HttpClientOptions = {}) {
    this.config = config;
    this.options = options;
  }

  private buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': this.config.accessToken,
      'User-Agent': 'Shopify-SDK/1.0.0'
    };
  }

  private async handleResponse(response: fetch.Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    const retryAfter = response.headers.get('Retry-After');

    let data: any;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: text };
    }

    if (!response.ok) {
      this.handleErrorResponse(response, data, retryAfter || undefined);
    }

    return data;
  }

  private handleErrorResponse(
    response: fetch.Response,
    data: ShopifyErrorResponse,
    retryAfter?: string
  ): never {
    const statusCode = response.status;

    switch (statusCode) {
    case 400:
      if (data.errors) {
        throw new GraphQLValidationError(data.errors, data);
      }
      throw new GraphQLParseError(data.error || 'Bad Request', data);

    case 401:
      throw new UnauthorizedError(data);

    case 403:
      throw new ForbiddenError(data);

    case 404:
      throw new NotFoundError(data);

    case 429: {
      const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : undefined;
      throw new RateLimitError(retryAfterSeconds, data);
    }

    case 500:
    case 501:
    case 502:
    case 503:
    case 504:
      throw new ServerError(statusCode, data);

    default:
      throw new ShopifyError(
        data.error || `HTTP ${statusCode}`,
        undefined,
        statusCode,
        data
      );
    }
  }

  async post<T = any>(path: string, body: any): Promise<T> {
    const url = `https://${this.config.storeDomain}/admin/api/${this.config.apiVersion}${path}`;
    
    const controller = new AbortController();
    const timeout = this.options.timeout || this.config.timeout || 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return await this.handleResponse(response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new ShopifyError('Request timeout', 'TIMEOUT_ERROR', 408);
      }
      
      throw new ShopifyError(error.message, error.code);
    }
  }

  async get<T = any>(path: string, params?: Record<string, string>): Promise<T> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = `https://${this.config.storeDomain}/admin/api/${this.config.apiVersion}${path}${searchParams ? `?${searchParams}` : ''}`;

    const controller = new AbortController();
    const timeout = this.options.timeout || this.config.timeout || 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.buildHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return await this.handleResponse(response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new ShopifyError('Request timeout', 'TIMEOUT_ERROR', 408);
      }
      
      throw new ShopifyError(error.message, error.code);
    }
  }
}