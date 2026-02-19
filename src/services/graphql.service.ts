import { ShopifyClient } from '../core/client';
import { GraphQLRequest, GraphQLResponse } from '../core/types';

export class GraphQLService {
  private client: ShopifyClient;

  constructor(client: ShopifyClient) {
    this.client = client;
  }

  async query<T = any>(
    request: GraphQLRequest
  ): Promise<GraphQLResponse<T>> {
    return this.client.graphql<T>(request);
  }

  async run<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<GraphQLResponse<T>> {
    return this.client.graphql<T>({ query, variables });
  }
}