# Bulk Operations Implementation Summary

## Overview

Added comprehensive support for Shopify GraphQL Bulk Operations to the SDK. This feature allows for large-scale data export operations with automatic polling and result parsing.

## New Files Created

1. **`src/services/bulkOperation.service.ts`** - Main bulk operation service
2. **`examples/bulk-operations-example.ts`** - Usage examples
3. **`src/__tests__/bulkOperation.service.spec.ts`** - Test file
4. **Updated `src/index.ts`** - Added bulk operations service to SDK instance
5. **Updated `README.md`** - Documentation

## Key Features

### Bulk Operation Service Methods

```typescript
// Run a bulk query
runQuery(query: string): Promise<BulkOperation>

// Get current operation status
getCurrentOperation(): Promise<BulkOperation>

// Poll for operation completion
pollOperation(operationId: string, pollInterval = 2000, timeout = 60000): Promise<BulkOperation>

// Run query and automatically poll for completion
runAndPollQuery(query: string, pollInterval = 2000, timeout = 60000): Promise<BulkOperation>

// Download results from completed operation
downloadResults(url: string): Promise<string>

// Parse JSONL results
parseResults(jsonlData: string): Promise<any[]>
```

### Types

```typescript
interface BulkOperation {
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
```

## Usage Patterns

### Basic Usage
```typescript
const query = `
  {
    products(first: 100) {
      edges {
        node {
          id
          title
          vendor
        }
      }
    }
  }
`;

const operation = await shopify.bulkOperations.runAndPollQuery(query);

if (operation.status === 'COMPLETED') {
  const data = await shopify.bulkOperations.downloadResults(operation.url!);
  const results = await shopify.bulkOperations.parseResults(data);
}
```

### Advanced Configuration
```typescript
const operation = await shopify.bulkOperations.runAndPollQuery(
  query,
  5000,  // Poll every 5 seconds
  180000  // Timeout after 3 minutes
);
```

### Custom Polling
```typescript
const operation = await shopify.bulkOperations.runQuery(query);
const completed = await shopify.bulkOperations.pollOperation(
  operation.id,
  2000,  // 2 second interval
  120000  // 2 minute timeout
);
```

## Bulk Operation Statuses

- **CREATED**: Operation has been created but not yet started
- **RUNNING**: Operation is in progress
- **COMPLETED**: Operation has finished successfully
- **FAILED**: Operation encountered an error

## Error Handling

```typescript
try {
  const operation = await shopify.bulkOperations.runAndPollQuery(query);
  
  if (operation.status === 'FAILED') {
    console.error('Operation failed:', operation.errorMessage);
    return;
  }

  const results = await shopify.bulkOperations.downloadResults(operation.url!);
  console.log('Operation completed successfully');

} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('Operation timed out');
  } else {
    console.error('Error:', error);
  }
}
```

## Bulk Query Examples

### Products with Variants
```graphql
{
  products(first: 200) {
    edges {
      node {
        id
        title
        vendor
        variants(first: 20) {
          edges {
            node {
              id
              title
              price
              sku
            }
          }
        }
      }
    }
  }
}
```

### Orders with Line Items
```graphql
{
  orders(first: 100) {
    edges {
      node {
        id
        name
        email
        financialStatus
        lineItems(first: 10) {
          edges {
            node {
              id
              title
              quantity
              price
            }
          }
        }
      }
    }
  }
}
```

## Testing

Created comprehensive test file `src/__tests__/bulkOperation.service.spec.ts` with:
- Initialization tests
- Query execution tests
- Operation monitoring tests
- Configuration tests

All tests are passing with expected behavior in test environment.

## Requirements

- Node.js >= 14.0.0
- Shopify API version >= 2023-10
- `node-fetch` package for HTTP requests
- `form-data` package for file upload support
