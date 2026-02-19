import { ShopifySDK, ShopifyConfig } from '../index';

describe('Shopify SDK', () => {
  describe('Initialization', () => {
    it('should create an instance of ShopifySDK', () => {
      const config: ShopifyConfig = {
        storeDomain: 'test-store.myshopify.com',
        apiVersion: '2023-10',
        accessToken: 'test-token'
      };

      const shopify = new ShopifySDK(config);
      
      expect(shopify).toBeDefined();
      expect(shopify.client).toBeDefined();
      expect(shopify.graphql).toBeDefined();
      expect(shopify.products).toBeDefined();
      expect(shopify.orders).toBeDefined();
      expect(shopify.inventory).toBeDefined();
      expect(shopify.uploads).toBeDefined();
      expect(shopify.paginator).toBeDefined();
    });

    it('should support static create method', () => {
      const config: ShopifyConfig = {
        storeDomain: 'test-store.myshopify.com',
        apiVersion: '2023-10',
        accessToken: 'test-token'
      };

      const shopify = ShopifySDK.create(config);
      
      expect(shopify).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should use default retry configuration', () => {
      const config: ShopifyConfig = {
        storeDomain: 'test-store.myshopify.com',
        apiVersion: '2023-10',
        accessToken: 'test-token'
      };

      const shopify = new ShopifySDK(config);
      
      expect(shopify).toBeDefined();
    });

    it('should accept custom retry configuration', () => {
      const config: ShopifyConfig = {
        storeDomain: 'test-store.myshopify.com',
        apiVersion: '2023-10',
        accessToken: 'test-token',
        retryCount: 5,
        retryDelay: 2000,
        timeout: 60000
      };

      const shopify = new ShopifySDK(config);
      
      expect(shopify).toBeDefined();
    });
  });
});