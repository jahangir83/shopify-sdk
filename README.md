# Shopify Client SDK

A comprehensive Shopify API SDK with GraphQL support, automatic retry handling, and type safety for Node.js applications.

## Features

✅ **Core GraphQL Engine** - Full support for Shopify GraphQL Admin API
✅ **Automatic Retry + Rate Limit Handling** - Smart exponential backoff for 429 errors
✅ **Typed Responses** - Complete TypeScript definitions for all operations
✅ **Pagination Helper** - Simplified cursor-based pagination
✅ **Staged Upload Manager** - Easy file uploads with staged targets
✅ **Service Modules** - Clean architecture with product, order, inventory, and upload services
✅ **Clean Dependency Injection** - No global state, fully configurable
✅ **Zero Global State** - Each SDK instance is isolated and independent
✅ **No Env Mutation** - No environment variables are modified

## Installation

```bash
npm install shopify-client-sdk
```

## Getting Started

### Basic Usage

```typescript
import { ShopifySDK, ShopifyConfig } from 'shopify-client-sdk';

// Initialize SDK with store credentials
const config: ShopifyConfig = {
  storeDomain: 'your-store.myshopify.com',
  apiVersion: '2023-10',
  accessToken: 'your-api-access-token'
};

const shopify = new ShopifySDK(config);

// Get a single product
const product = await shopify.products.getProduct('gid://shopify/Product/1234567890');
console.log('Product:', product.title);

// Get all products
const allProducts = await shopify.paginator.fetchAll(async (options) => {
  const result = await shopify.products.getProducts(options);
  return {
    edges: result.data.map(node => ({
      cursor: '',
      node
    })),
    pageInfo: result.pageInfo,
    totalCount: result.totalCount
  };
});
```

## Services

### Bulk Operation Service

```typescript
import { ShopifySDK, ShopifyConfig } from 'shopify-client-sdk';

const config: ShopifyConfig = {
  storeDomain: 'your-store.myshopify.com',
  apiVersion: '2023-10',
  accessToken: 'your-api-access-token'
};

const shopify = new ShopifySDK(config);

// Run bulk query
const query = `
  {
    products(first: 100) {
      edges {
        node {
          id
          title
          vendor
          variants(first: 10) {
            edges {
              node {
                id
                title
                price
              }
            }
          }
        }
      }
    }
  }
`;

// Run and poll for completion
const operation = await shopify.bulkOperations.runAndPollQuery(query);

// Download and parse results
if (operation.status === 'COMPLETED') {
  const jsonlData = await shopify.bulkOperations.downloadResults(operation.url!);
  const results = await shopify.bulkOperations.parseResults(jsonlData);
  console.log(`Downloaded ${results.length} records`);
}
```

## Bulk Operations Configuration

### Advanced Bulk Operations

```typescript
// Configure poll interval and timeout
const operation = await shopify.bulkOperations.runAndPollQuery(
  query,
  5000,  // Poll every 5 seconds
  180000  // Timeout after 3 minutes
);

// Custom polling logic
const operation = await shopify.bulkOperations.runQuery(query);
const completedOperation = await shopify.bulkOperations.pollOperation(
  operation.id,
  2000,  // Poll every 2 seconds
  120000  // Timeout after 2 minutes
);

// Check for active operations
const currentOperation = await shopify.bulkOperations.getCurrentOperation();
if (currentOperation && currentOperation.status === 'RUNNING') {
  console.log('Active operation in progress...');
}
```

### Bulk Operation Types

#### Product Export
```typescript
const productQuery = `
  {
    products(first: 200) {
      edges {
        node {
          id
          title
          vendor
          productType
          handle
          tags
          variants(first: 20) {
            edges {
              node {
                id
                title
                price
                sku
                inventoryQuantity
              }
            }
          }
        }
      }
    }
  }
`;
```

#### Order Export
```typescript
const orderQuery = `
  {
    orders(first: 100) {
      edges {
        node {
          id
          name
          orderNumber
          email
          financialStatus
          fulfillmentStatus
          totalPrice
          lineItems(first: 10) {
            edges {
              node {
                id
                title
                quantity
                price
                variant {
                  id
                  sku
                }
              }
            }
          }
        }
      }
    }
  }
`;
```

### Error Handling for Bulk Operations

```typescript
try {
  const operation = await shopify.bulkOperations.runAndPollQuery(query);
  
  if (operation.status === 'FAILED') {
    console.error('Operation failed:', operation.errorCode, operation.errorMessage);
    return;
  }

  const jsonlData = await shopify.bulkOperations.downloadResults(operation.url!);
  const results = await shopify.bulkOperations.parseResults(jsonlData);
  
  console.log(`Successfully processed ${results.length} records`);

} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('Operation timed out');
  } else {
    console.error('Error:', error);
  }
}
```

### Product Service

```typescript
// Get product
const product = await shopify.products.getProduct(productId);

// Get products with pagination
const products = await shopify.products.getProducts({ limit: 10, after: 'cursor' });

// Create product
const newProduct = await shopify.products.createProduct({
  title: 'New Product',
  bodyHtml: '<p>Description</p>',
  vendor: 'Vendor',
  productType: 'Category',
  published: true
});

// Update product
const updatedProduct = await shopify.products.updateProduct(productId, {
  title: 'Updated Product'
});

// Delete product
const success = await shopify.products.deleteProduct(productId);
```

### Order Service

```typescript
// Get order
const order = await shopify.orders.getOrder(orderId);

// Get orders with filters
const orders = await shopify.orders.getOrders({ limit: 20 });

// Create order
const newOrder = await shopify.orders.createOrder({
  lineItems: [{ variantId: 'gid://shopify/ProductVariant/12345', quantity: 2 }]
});
```

### Inventory Service

```typescript
// Get inventory item
const item = await shopify.inventory.getInventoryItem(inventoryItemId);

// Get inventory levels for an item
const levels = await shopify.inventory.getInventoryLevels(inventoryItemId);

// Update inventory level
const updatedLevel = await shopify.inventory.updateInventoryLevel(
  inventoryItemId,
  locationId,
  newQuantity
);
```

### Upload Service

```typescript
import { readFileSync } from 'fs';

// Upload image
const imageBuffer = readFileSync('image.jpg');
const imageUrl = await shopify.uploads.uploadImage(imageBuffer, {
  filename: 'product-image.jpg'
});

// Upload video
const videoUrl = await shopify.uploads.uploadVideo(videoBuffer, {
  filename: 'product-video.mp4'
});

// Upload JSON data
const jsonUrl = await shopify.uploads.uploadJson({ data: 'value' });
```

## Pagination

### Manual Pagination

```typescript
let hasNextPage = true;
let after = undefined;

while (hasNextPage) {
  const products = await shopify.products.getProducts({ limit: 50, after });
  
  products.data.forEach(product => console.log(product.title));
  
  hasNextPage = products.pageInfo.hasNextPage;
  after = products.pageInfo.endCursor;
}
```

### Automatic Pagination with Paginator

```typescript
const allProducts = await shopify.paginator.fetchAll(async (options) => {
  const result = await shopify.products.getProducts(options);
  return {
    edges: result.data.map(node => ({
      cursor: '',
      node
    })),
    pageInfo: result.pageInfo,
    totalCount: result.totalCount
  };
});

console.log(`Total products: ${allProducts.data.length}`);
```

## Configuration Options

```typescript
const config: ShopifyConfig = {
  storeDomain: 'your-store.myshopify.com',
  apiVersion: '2023-10',
  accessToken: 'your-api-access-token',
  retryCount: 3,          // Number of retry attempts (default: 3)
  retryDelay: 1000,       // Initial retry delay in ms (default: 1000)
  timeout: 30000          // Request timeout in ms (default: 30000)
};
```

## Error Handling

```typescript
try {
  const product = await shopify.products.getProduct('invalid-id');
} catch (error) {
  if (error instanceof GraphQLExecutionError) {
    console.error('GraphQL errors:', error.errors);
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited, retry after ${error.retryAfter} seconds`);
  } else if (error instanceof ShopifyError) {
    console.error('Shopify error:', error.code, error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Advanced Usage

### Custom GraphQL Queries

```typescript
const query = `
  query GetProductWithVariants($id: ID!) {
    product(id: $id) {
      id
      title
      variants(first: 5) {
        edges {
          node {
            id
            title
            price
            inventoryQuantity
          }
        }
      }
    }
  }
`;

const response = await shopify.graphql.run(query, { id: productId });
const product = response.data?.product;
```

### Performance Optimization

```typescript
// Adjust pagination settings
const paginator = new Paginator({ pageSize: 250, maxPages: 10 });

// Custom retry configuration
const customClient = new ShopifySDK({
  ...config,
  retryCount: 5,
  retryDelay: 2000
});
```

## Architecture

The SDK follows a clean architecture with clear separation of concerns:

```
┌───────────────────────────────────────────────────────────┐
│                    Application Layer                      │
├───────────────────────────────────────────────────────────┤
│ GraphQL Service  │ Product Service │ Order Service       │
│ Inventory Service│ Upload Service  │ Paginator Helper    │
├───────────────────────────────────────────────────────────┤
│              Core GraphQL Engine & HTTP Client             │
├───────────────────────────────────────────────────────────┤
│ Retry Logic │ Rate Limit Handling │ Error Management      │
└───────────────────────────────────────────────────────────┘
```

## Development

### Build the SDK

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Run Lint

```bash
npm run lint
```

## License

MIT

## Contributing

Contributions are welcome! Please open issues or submit pull requests.