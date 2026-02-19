import { ShopifySDK, ShopifyConfig, Product, Order, InventoryItem } from '../src';
import { readFileSync } from 'fs';

// Initialize SDK with store credentials
const config: ShopifyConfig = {
  storeDomain: 'your-store.myshopify.com',
  apiVersion: '2023-10',
  accessToken: 'your-api-access-token',
  retryCount: 3,
  retryDelay: 1000,
  timeout: 30000
};

const shopify = new ShopifySDK(config);

// Example 1: Get a single product with error handling
async function getProduct() {
  try {
    const productId = 'gid://shopify/Product/1234567890';
    const product: Product = await shopify.products.getProduct(productId);
    console.log('Product:', product.title);
    console.log('Variants:', product.variants?.length);
    console.log('Vendor:', product.vendor);
    console.log('Tags:', product.tags?.join(', '));
  } catch (error: any) {
    console.error('Error getting product:', error.name, error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

// Example 2: Get all products with pagination
async function getAllProducts() {
  try {
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

    console.log('\nTotal products:', allProducts.data.length);
    allProducts.data.forEach((product: Product) => {
      console.log(`- ${product.title} (${product.vendor})`);
    });
  } catch (error: any) {
    console.error('Error getting products:', error);
  }
}

// Example 3: Create a new product
async function createProduct() {
  try {
    const newProduct: Product = await shopify.products.createProduct({
      title: 'New Product from SDK',
      bodyHtml: '<p>This is a test product created via Shopify SDK</p>',
      vendor: 'Test Vendor',
      productType: 'Test Category',
      handle: 'test-product',
      tags: ['test', 'sdk'],
      published: true
    });

    console.log('\nCreated product:');
    console.log('Title:', newProduct.title);
    console.log('Product ID:', newProduct.id);
    console.log('Created At:', newProduct.createdAt);
  } catch (error: any) {
    console.error('Error creating product:', error);
  }
}

// Example 4: Upload an image
async function uploadProductImage() {
  try {
    const imagePath = './path/to/image.jpg';
    const imageBuffer = readFileSync(imagePath);

    const imageUrl: string = await shopify.uploads.uploadImage(imageBuffer, {
      filename: 'product-image.jpg',
      contentType: 'image/jpeg'
    });

    console.log('\nImage uploaded successfully:');
    console.log('Image URL:', imageUrl);
  } catch (error: any) {
    console.error('Error uploading image:', error);
  }
}

// Example 5: Get inventory levels for a specific product
async function getInventoryLevels() {
  try {
    const inventoryItemId = 'gid://shopify/InventoryItem/1234567890';
    const inventoryLevels = await shopify.inventory.getInventoryLevels(inventoryItemId);

    console.log('\nInventory levels at locations:');
    inventoryLevels.data.forEach(level => {
      console.log(`- Location: ${level.locationId}, Available: ${level.available}`);
    });
  } catch (error: any) {
    console.error('Error getting inventory levels:', error);
  }
}

// Example 6: Get orders
async function getRecentOrders() {
  try {
    const orders = await shopify.orders.getOrders({ limit: 5 });
    console.log('\nRecent Orders:');
    orders.data.forEach((order: Order) => {
      console.log(`- ${order.name} (${order.financialStatus}) - $${order.totalPrice}`);
    });
  } catch (error: any) {
    console.error('Error getting orders:', error);
  }
}

// Run all examples
async function runAllExamples() {
  console.log('=== Shopify SDK Examples ===');
  
  await Promise.all([
    getProduct(),
    getAllProducts(),
    createProduct(),
    uploadProductImage(),
    getInventoryLevels(),
    getRecentOrders()
  ]);
  
  console.log('\n=== All examples completed ===');
}

runAllExamples().catch(console.error);