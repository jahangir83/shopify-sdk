import { ShopifyClient } from '../core/client';
import { PaginationOptions, PaginationResult } from '../utils/paginator';

export interface Product {
  id: string;
  title: string;
  bodyHtml?: string;
  vendor?: string;
  productType?: string;
  handle?: string;
  tags?: string[];
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  variants?: any[];
  options?: any[];
  images?: any[];
  metafields?: any[];
}

export interface ProductInput {
  title: string;
  bodyHtml?: string;
  vendor?: string;
  productType?: string;
  handle?: string;
  tags?: string[];
  published?: boolean;
}

export interface ProductUpdateInput {
  title?: string;
  bodyHtml?: string;
  vendor?: string;
  productType?: string;
  handle?: string;
  tags?: string[];
  published?: boolean;
}

export class ProductService {
  private client: ShopifyClient;

  constructor(client: ShopifyClient) {
    this.client = client;
  }

  async getProduct(id: string): Promise<Product> {
    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          bodyHtml
          vendor
          productType
          handle
          tags
          publishedAt
          createdAt
          updatedAt
          variants(first: 250) {
            edges {
              node {
                id
                title
                price
                inventoryQuantity
                sku
                barcode
              }
            }
          }
          options {
            id
            name
            values
          }
          images(first: 250) {
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
    `;

    const response = await this.client.graphql<{ product: Product }>({
      query,
      variables: { id }
    });

    return response.data?.product;
  }

  async getProducts(options?: PaginationOptions): Promise<PaginationResult<Product>> {
    const query = `
      query GetProducts($first: Int, $after: String, $before: String) {
        products(first: $first, after: $after, before: $before) {
          edges {
            cursor
            node {
              id
              title
              bodyHtml
              vendor
              productType
              handle
              tags
              publishedAt
              createdAt
              updatedAt
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
        }
      }
    `;

    const response = await this.client.graphql({
      query,
      variables: options
    });

    return {
      data: response.data?.products.edges.map((edge: any) => edge.node),
      pageInfo: response.data?.products.pageInfo,
      totalCount: response.data?.products.totalCount
    };
  }

  async createProduct(input: ProductInput): Promise<Product> {
    const mutation = `
      mutation CreateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            bodyHtml
            vendor
            productType
            handle
            tags
            publishedAt
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await this.client.graphql({
      query: mutation,
      variables: { input }
    });

    if (response.data?.productCreate.userErrors.length > 0) {
      throw new Error(response.data.productCreate.userErrors[0].message);
    }

    return response.data?.productCreate.product;
  }

  async updateProduct(id: string, input: ProductUpdateInput): Promise<Product> {
    const mutation = `
      mutation UpdateProduct($id: ID!, $input: ProductInput!) {
        productUpdate(id: $id, input: $input) {
          product {
            id
            title
            bodyHtml
            vendor
            productType
            handle
            tags
            publishedAt
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await this.client.graphql({
      query: mutation,
      variables: { id, input }
    });

    if (response.data?.productUpdate.userErrors.length > 0) {
      throw new Error(response.data.productUpdate.userErrors[0].message);
    }

    return response.data?.productUpdate.product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteProduct($id: ID!) {
        productDelete(id: $id) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await this.client.graphql({
      query: mutation,
      variables: { id }
    });

    if (response.data?.productDelete.userErrors.length > 0) {
      throw new Error(response.data.productDelete.userErrors[0].message);
    }

    return response.data?.productDelete.deletedProductId === id;
  }
}