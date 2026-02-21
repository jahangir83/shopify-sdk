import { ShopifySDK, ShopifyConfig } from '../src';
import fs from 'fs';
import path from 'path';

const config: ShopifyConfig = {
  storeDomain: 'your-store.myshopify.com',
  apiVersion: '2023-10',
  accessToken: 'your-api-access-token'
};

const shopify = new ShopifySDK(config);

async function runBulkProductExport() {
  console.log('Starting bulk product export...');

  // Define the bulk query to export all products with variants
  const query = `
    {
      products(first: 100) {
        edges {
          node {
            id
            title
            vendor
            productType
            handle
            tags
            publishedAt
            createdAt
            updatedAt
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  price
                  compareAtPrice
                  sku
                  barcode
                  inventoryQuantity
                }
              }
            }
            images(first: 20) {
              edges {
                node {
                  id
                  src
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    // Run bulk query and poll for completion
    console.log('Creating bulk operation...');
    const operation = await shopify.bulkOperations.runAndPollQuery(query, 3000, 120000);

    console.log('Operation status:', operation.status);
    
    if (operation.status === 'FAILED') {
      console.error('Operation failed:', operation.errorMessage);
      return;
    }

    // Download and parse results
    console.log('Downloading results...');
    const jsonlData = await shopify.bulkOperations.downloadResults(operation.url!);
    const parsedResults = await shopify.bulkOperations.parseResults(jsonlData);
    
    console.log(`Downloaded ${parsedResults.length} records`);

    // Save results to file
    const outputPath = path.join(__dirname, 'products-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(parsedResults, null, 2));
    console.log(`Results saved to ${outputPath}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

async function runBulkOrderExport() {
  console.log('Starting bulk order export...');

  const query = `
    {
      orders(first: 50) {
        edges {
          node {
            id
            name
            orderNumber
            email
            financialStatus
            fulfillmentStatus
            totalPrice
            currencyCode
            processedAt
            customer {
              id
              email
              firstName
              lastName
            }
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

  try {
    const operation = await shopify.bulkOperations.runAndPollQuery(query);
    
    if (operation.status === 'COMPLETED') {
      const jsonlData = await shopify.bulkOperations.downloadResults(operation.url!);
      const results = await shopify.bulkOperations.parseResults(jsonlData);
      
      console.log(`Successfully exported ${results.length} orders`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function checkCurrentOperation() {
  console.log('Checking current bulk operation...');

  try {
    const operation = await shopify.bulkOperations.getCurrentOperation();
    
    if (operation) {
      console.log('Current operation status:', operation.status);
      console.log('Created at:', operation.createdAt);
      
      if (operation.status === 'RUNNING') {
        console.log('Operation in progress...');
        const completedOperation = await shopify.bulkOperations.pollOperation(operation.id);
        console.log('Operation completed with status:', completedOperation.status);
      }
    } else {
      console.log('No active bulk operations');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the examples
async function main() {
  // Option 1: Run product export
  // await runBulkProductExport();
  
  // Option 2: Run order export  
  // await runBulkOrderExport();
  
  // Option 3: Check current operation status
  await checkCurrentOperation();
}

main().catch(console.error);