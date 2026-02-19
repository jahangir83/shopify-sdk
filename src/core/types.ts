export interface ShopifyConfig {
  storeDomain: string;
  apiVersion: string;
  accessToken: string;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: any[];
  extensions?: any;
}

export interface ShopifyErrorResponse {
  errors?: any[];
  error?: any;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface Connection<T> {
  edges: { cursor: string; node: T }[];
  pageInfo: PageInfo;
  totalCount?: number;
}