import { ShopifyClient } from '../core/client';
import { PaginationOptions, PaginationResult } from '../utils/paginator';

export interface InventoryItem {
  id: string;
  sku?: string;
  barcode?: string;
  trackInventory?: boolean;
  requiresShipping?: boolean;
  cost?: string;
  createdAt?: string;
  updatedAt?: string;
  variant?: any;
}

export interface InventoryLevel {
  id: string;
  inventoryItemId: string;
  locationId: string;
  available: number;
}

export class InventoryService {
  private client: ShopifyClient;

  constructor(client: ShopifyClient) {
    this.client = client;
  }

  async getInventoryItem(id: string): Promise<InventoryItem> {
    const query = `
      query GetInventoryItem($id: ID!) {
        inventoryItem(id: $id) {
          id
          sku
          barcode
          trackInventory
          requiresShipping
          cost
          createdAt
          updatedAt
          variant {
            id
            title
            product {
              id
              title
            }
          }
        }
      }
    `;

    const response = await this.client.graphql<{ inventoryItem: InventoryItem }>({
      query,
      variables: { id }
    });

    return response.data?.inventoryItem;
  }

  async getInventoryLevels(
    inventoryItemId: string,
    options?: PaginationOptions
  ): Promise<PaginationResult<InventoryLevel>> {
    const query = `
      query GetInventoryLevels($inventoryItemId: ID!, $first: Int, $after: String, $before: String) {
        inventoryItem(id: $inventoryItemId) {
          inventoryLevels(first: $first, after: $after, before: $before) {
            edges {
              cursor
              node {
                id
                inventoryItemId
                locationId
                available
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
      }
    `;

    const response = await this.client.graphql({
      query,
      variables: { inventoryItemId, ...options }
    });

    return {
      data: response.data?.inventoryItem.inventoryLevels.edges.map((edge: any) => edge.node),
      pageInfo: response.data?.inventoryItem.inventoryLevels.pageInfo,
      totalCount: response.data?.inventoryItem.inventoryLevels.totalCount
    };
  }

  async updateInventoryLevel(
    inventoryItemId: string,
    locationId: string,
    available: number
  ): Promise<InventoryLevel> {
    const mutation = `
      mutation UpdateInventoryLevel($input: InventoryLevelInput!) {
        inventoryLevelAdjust(input: $input) {
          inventoryLevel {
            id
            inventoryItemId
            locationId
            available
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
      variables: {
        input: {
          inventoryItemId,
          locationId,
          available
        }
      }
    });

    if (response.data?.inventoryLevelAdjust.userErrors.length > 0) {
      throw new Error(response.data.inventoryLevelAdjust.userErrors[0].message);
    }

    return response.data?.inventoryLevelAdjust.inventoryLevel;
  }

  async setInventoryLevel(
    inventoryItemId: string,
    locationId: string,
    available: number
  ): Promise<InventoryLevel> {
    const mutation = `
      mutation SetInventoryLevel($input: InventoryLevelInput!) {
        inventoryLevelSet(input: $input) {
          inventoryLevel {
            id
            inventoryItemId
            locationId
            available
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
      variables: {
        input: {
          inventoryItemId,
          locationId,
          available
        }
      }
    });

    if (response.data?.inventoryLevelSet.userErrors.length > 0) {
      throw new Error(response.data.inventoryLevelSet.userErrors[0].message);
    }

    return response.data?.inventoryLevelSet.inventoryLevel;
  }

  async getLocations(options?: PaginationOptions): Promise<PaginationResult<any>> {
    const query = `
      query GetLocations($first: Int, $after: String, $before: String) {
        locations(first: $first, after: $after, before: $before) {
          edges {
            cursor
            node {
              id
              name
              address {
                address1
                address2
                city
                province
                provinceCode
                zip
                country
                countryCode
                phone
              }
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
      data: response.data?.locations.edges.map((edge: any) => edge.node),
      pageInfo: response.data?.locations.pageInfo,
      totalCount: response.data?.locations.totalCount
    };
  }
}