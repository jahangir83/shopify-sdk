import { ShopifySDK, ShopifyConfig, Product } from '../src';
import { readFileSync } from 'fs';

// Example: Initialize SDK with store credentials
const config: ShopifyConfig = {
  storeDomain: 'your-store.myshopify.com',
  apiVersion: '2023-10',
  accessToken: 'your-api-access-token',
  retryCount: 3,
  retryDelay: 1000,
  timeout: 30000
};

const shopify = new ShopifySDK(config);

// Example 1: Get a single product
async function getProduct() {
  try {
    const productId = 'gid://shopify/Product/1234567890';
    const product = await shopify.products.getProduct(productId);
    console.log('Product:', product.title);
    console.log('Variants:', product.variants?.length);
  } catch (error) {
    console.error('Error getting product:', error);
  }
}

// Example 2: Get all products with pagination
async function getAllProducts() {
  try {
    const products = await shopify.paginator.fetchAll(async (options) => {
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

    console.log('Total products:', products.data.length);
    products.data.forEach(product => {
      console.log('-', product.title, product.vendor);
    });
  } catch (error) {
    console.error('Error getting products:', error);
  }
}

// Example 3: Create a new product
async function createProduct() {
  try {
    const newProduct = await shopify.products.createProduct({
      title: 'New Product from SDK',
      bodyHtml: '<p>This is a test product created via Shopify SDK</p>',
      vendor: 'Test Vendor',
      productType: 'Test Category',
      handle: 'test-product',
      tags: ['test', 'sdk'],
      published: true
    });

    console.log('Created product:', newProduct.title);
    console.log('Product ID:', newProduct.id);
  } catch (error) {
    console.error('Error creating product:', error);
  }
}

// Example 4: Upload an image
async function uploadProductImage() {
  try {
    const productId = 'gid://shopify/Product/1234567890';
    const imagePath = './path/to/image.jpg';
    const imageBuffer = readFileSync(imagePath);

    const imageUrl = await shopify.uploads.uploadImage(imageBuffer, {
      filename: 'product-image.jpg',
      contentType: 'image/jpeg'
    });

    console.log('Image uploaded:', imageUrl);
  } catch (error) {
    console.error('Error uploading image:', error);
  }
}

// Example 5: Get inventory levels
async function getInventoryLevels() {
  try {
    const inventoryItemId = 'gid://shopify/InventoryItem/1234567890';
    const inventoryLevels = await shopify.inventory.getInventoryLevels(inventoryItemId);

    console.log('Inventory levels at locations:');
    inventoryLevels.data.forEach(level => {
      console.log(`- Location: ${level.locationId}, Available: ${level.available}`);
    });
  } catch (error) {
    console.error('Error getting inventory levels:', error);
  }
}

// Run examples
Promise.all([
  getProduct(),
  getAllProducts(),
  createProduct(),
  uploadProductImage(),
  getInventoryLevels()
]);