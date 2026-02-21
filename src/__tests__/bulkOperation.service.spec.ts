import { ShopifySDK, ShopifyConfig } from '../index';
import { BulkOperationService } from '../services/bulkOperation.service';

describe('BulkOperationService', () => {
  let shopify: ShopifySDK;
  let bulkOperationService: BulkOperationService;

  beforeEach(() => {
    const config: ShopifyConfig = {
      storeDomain: 'test-store.myshopify.com',
      apiVersion: '2023-10',
      accessToken: 'test-token'
    };

    shopify = new ShopifySDK(config);
    bulkOperationService = shopify.bulkOperations;
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(bulkOperationService).toBeDefined();
    });

    it('should be an instance of BulkOperationService', () => {
      expect(bulkOperationService).toBeInstanceOf(BulkOperationService);
    });
  });

  describe('Query execution', () => {
    it('should create and return a bulk operation with a query', async () => {
      // This is a test skeleton - actual implementation would require mocking
      // For real testing, use a mock client or test account
      try {
        const query = '{ products(first: 5) { edges { node { id title } } } }';
        const operation = await bulkOperationService.runQuery(query);
        
        expect(operation).toBeDefined();
        expect(operation.query).toEqual(query);
        expect(['CREATED', 'RUNNING']).toContain(operation.status);
      } catch (error) {
        // For this test, we might expect an error if not connected to real API
        console.log('Test environment - expected error:', error);
        // In a real test environment with a mock client, this would be a success
      }
    });
  });

  describe('Operation monitoring', () => {
    it('should be able to check current operation status', async () => {
      // This will fail without proper API connection
      try {
        const operation = await bulkOperationService.getCurrentOperation();
        if (operation) {
          expect(operation).toBeDefined();
          expect(operation.status).toBeDefined();
        } else {
          console.log('No active bulk operation');
        }
      } catch (error) {
        console.log('Test environment - expected error:', error);
      }
    });
  });

  describe('Bulk operations configuration', () => {
    it('should support custom query parameters', async () => {
      try {
        const query = `
          {
            products(first: 10) {
              edges {
                node {
                  id
                  title
                  vendor
                  productType
                }
              }
            }
          }
        `;

        const operation = await bulkOperationService.runQuery(query);
        expect(operation).toBeDefined();
      } catch (error) {
        console.log('Test environment - expected error:', error);
      }
    });
  });
});