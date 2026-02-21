import { ShopifyClient } from '../core/client';
import { GraphQLService } from './graphql.service';

export interface BulkOperationInput {
  query: string;
}

export interface BulkOperation {
  id: string;
  status: 'CREATED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  query: string;
  createdAt: string;
  completedAt?: string;
  objectCount?: number;
  fileSize?: number;
  url?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface BulkOperationCreateResponse {
  bulkOperationRunQuery: {
    bulkOperation: BulkOperation;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

export interface BulkOperationStatusResponse {
  currentBulkOperation: BulkOperation;
}

export class BulkOperationService {
  private graphql: GraphQLService;

  constructor(client: ShopifyClient) {
    this.graphql = new GraphQLService(client);
  }

  async runQuery(query: string): Promise<BulkOperation> {
    const mutation = `
      mutation RunBulkQuery($query: String!) {
        bulkOperationRunQuery(
          query: $query
        ) {
          bulkOperation {
            id
            status
            query
            createdAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await this.graphql.query<BulkOperationCreateResponse>({
      query: mutation,
      variables: { query }
    });

    if (response.data?.bulkOperationRunQuery.userErrors.length > 0) {
      const errors = response.data.bulkOperationRunQuery.userErrors;
      throw new Error(`Failed to create bulk operation: ${errors[0].message}`);
    }

    return response.data!.bulkOperationRunQuery.bulkOperation;
  }

  async getCurrentOperation(): Promise<BulkOperation> {
    const query = `
      query GetCurrentBulkOperation {
        currentBulkOperation {
          id
          status
          query
          createdAt
          completedAt
          objectCount
          fileSize
          url
          errorCode
          errorMessage
        }
      }
    `;

    const response = await this.graphql.query<BulkOperationStatusResponse>({
      query
    });

    return response.data!.currentBulkOperation;
  }

  async pollOperation(_operationId: string, pollInterval = 2000, timeout = 60000): Promise<BulkOperation> {
    const startTime = Date.now();
    let operation: BulkOperation;

    do {
      operation = await this.getCurrentOperation();
      
      if (operation.status === 'COMPLETED' || operation.status === 'FAILED') {
        return operation;
      }

      if (Date.now() - startTime > timeout) {
        throw new Error('Bulk operation timeout');
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } while (true);
  }

  async runAndPollQuery(query: string, pollInterval = 2000, timeout = 60000): Promise<BulkOperation> {
    const operation = await this.runQuery(query);
    return this.pollOperation(operation.id, pollInterval, timeout);
  }

  async downloadResults(url: string): Promise<string> {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download results: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  async parseResults(jsonlData: string): Promise<any[]> {
    const lines = jsonlData.split('\n').filter(line => line.trim());
    return lines.map(line => JSON.parse(line));
  }
}