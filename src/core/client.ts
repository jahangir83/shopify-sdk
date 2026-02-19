import { ShopifyConfig, GraphQLRequest, GraphQLResponse } from './types';
import { HttpClient } from './http';
import { retryWithExponentialBackoff, RetryConfig } from './retry';
import { GraphQLExecutionError } from './errors';

export class ShopifyClient {
  private httpClient: HttpClient;
  private retryConfig: RetryConfig;

  constructor(config: ShopifyConfig) {
    this.httpClient = new HttpClient(config);
    this.retryConfig = {
      maxRetries: config.retryCount ?? 3,
      delay: config.retryDelay ?? 1000,
      maxDelay: 60000
    };
  }

  async graphql<T = any>(
    request: GraphQLRequest
  ): Promise<GraphQLResponse<T>> {
    const { query, variables } = request;
    
    const response = await retryWithExponentialBackoff(
      () => this.httpClient.post<GraphQLResponse<T>>('/graphql.json', {
        query,
        variables
      }),
      this.retryConfig
    );

    if (response.errors && response.errors.length > 0) {
      throw new GraphQLExecutionError(response.errors, response);
    }

    return response;
  }
}