import { ShopifyClient } from '../core/client';
import { PaginationOptions, PaginationResult } from '../utils/paginator';

export interface Order {
  id: string;
  name: string;
  orderNumber: number;
  email?: string;
  phone?: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
  totalPrice?: string;
  currencyCode?: string;
  processedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  customer?: any;
  lineItems?: any[];
  shippingAddress?: any;
  billingAddress?: any;
}

export interface OrderInput {
  lineItems: Array<{
    variantId?: string;
    sku?: string;
    quantity: number;
    title?: string;
    price?: string;
  }>;
  customer?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  shippingAddress?: any;
  billingAddress?: any;
  financialStatus?: string;
  fulfillmentStatus?: string;
}

export class OrderService {
  private client: ShopifyClient;

  constructor(client: ShopifyClient) {
    this.client = client;
  }

  async getOrder(id: string): Promise<Order> {
    const query = `
      query GetOrder($id: ID!) {
        order(id: $id) {
          id
          name
          orderNumber
          email
          phone
          financialStatus
          fulfillmentStatus
          totalPrice
          currencyCode
          processedAt
          createdAt
          updatedAt
          customer {
            id
            email
            firstName
            lastName
          }
          lineItems(first: 250) {
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
          shippingAddress {
            firstName
            lastName
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
          billingAddress {
            firstName
            lastName
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
    `;

    const response = await this.client.graphql<{ order: Order }>({
      query,
      variables: { id }
    });

    return response.data?.order;
  }

  async getOrders(options?: PaginationOptions): Promise<PaginationResult<Order>> {
    const query = `
      query GetOrders($first: Int, $after: String, $before: String) {
        orders(first: $first, after: $after, before: $before) {
          edges {
            cursor
            node {
              id
              name
              orderNumber
              email
              phone
              financialStatus
              fulfillmentStatus
              totalPrice
              currencyCode
              processedAt
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
      data: response.data?.orders.edges.map((edge: any) => edge.node),
      pageInfo: response.data?.orders.pageInfo,
      totalCount: response.data?.orders.totalCount
    };
  }

  async createOrder(input: OrderInput): Promise<Order> {
    const mutation = `
      mutation CreateOrder($input: OrderInput!) {
        orderCreate(input: $input) {
          order {
            id
            name
            orderNumber
            email
            phone
            financialStatus
            fulfillmentStatus
            totalPrice
            currencyCode
            processedAt
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

    if (response.data?.orderCreate.userErrors.length > 0) {
      throw new Error(response.data.orderCreate.userErrors[0].message);
    }

    return response.data?.orderCreate.order;
  }

  async updateOrder(id: string, input: Partial<OrderInput>): Promise<Order> {
    const mutation = `
      mutation UpdateOrder($id: ID!, $input: OrderInput!) {
        orderUpdate(id: $id, input: $input) {
          order {
            id
            name
            orderNumber
            email
            phone
            financialStatus
            fulfillmentStatus
            totalPrice
            currencyCode
            processedAt
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

    if (response.data?.orderUpdate.userErrors.length > 0) {
      throw new Error(response.data.orderUpdate.userErrors[0].message);
    }

    return response.data?.orderUpdate.order;
  }

  async deleteOrder(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteOrder($id: ID!) {
        orderDelete(id: $id) {
          deletedOrderId
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

    if (response.data?.orderDelete.userErrors.length > 0) {
      throw new Error(response.data.orderDelete.userErrors[0].message);
    }

    return response.data?.orderDelete.deletedOrderId === id;
  }
}