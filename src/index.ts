import { ShopifyConfig } from './core/types';
import { ShopifyClient } from './core/client';
import { GraphQLService } from './services/graphql.service';
import { ProductService } from './services/product.service';
import { OrderService } from './services/order.service';
import { InventoryService } from './services/inventory.service';
import { UploadService } from './services/upload.service';
import { BulkOperationService } from './services/bulkOperation.service';
import { Paginator } from './utils/paginator';

export class ShopifySDK {
  public client: ShopifyClient;
  public graphql: GraphQLService;
  public products: ProductService;
  public orders: OrderService;
  public inventory: InventoryService;
  public uploads: UploadService;
  public bulkOperations: BulkOperationService;
  public paginator: Paginator;

  constructor(config: ShopifyConfig) {
    this.client = new ShopifyClient(config);
    this.graphql = new GraphQLService(this.client);
    this.products = new ProductService(this.client);
    this.orders = new OrderService(this.client);
    this.inventory = new InventoryService(this.client);
    this.uploads = new UploadService(this.client);
    this.bulkOperations = new BulkOperationService(this.client);
    this.paginator = new Paginator();
  }

  static create(config: ShopifyConfig): ShopifySDK {
    return new ShopifySDK(config);
  }
}

// Export core classes and types
export { ShopifyClient } from './core/client';
export type { ShopifyConfig } from './core/types';
export * from './core/errors';
export * from './services/graphql.service';
export * from './services/product.service';
export * from './services/order.service';
export * from './services/inventory.service';
export * from './services/upload.service';
export * from './services/bulkOperation.service';
export { Paginator } from './utils/paginator';