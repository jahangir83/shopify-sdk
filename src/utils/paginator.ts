import { Connection, PageInfo } from '../core/types';

export interface PaginationOptions {
  limit?: number;
  after?: string;
  before?: string;
}

export interface PaginationResult<T> {
  data: T[];
  pageInfo: PageInfo;
  totalCount?: number;
}

export interface PaginatorOptions {
  pageSize?: number;
  maxPages?: number;
}

export class Paginator {
  private pageSize: number;
  private maxPages?: number;

  constructor(options: PaginatorOptions = {}) {
    this.pageSize = options.pageSize ?? 250;
    this.maxPages = options.maxPages;
  }

  async *iterate<T>(
    fetcher: (options: PaginationOptions) => Promise<Connection<T>>,
    options: PaginationOptions = {}
  ): AsyncGenerator<T[], void, unknown> {
    let after = options.after;
    let pageCount = 0;

    while (true) {
      if (this.maxPages && pageCount >= this.maxPages) {
        break;
      }

      const paginationParams: PaginationOptions = {
        limit: this.pageSize,
        after,
        before: options.before
      };

      const connection = await fetcher(paginationParams);
      pageCount++;

      yield connection.edges.map(edge => edge.node);

      if (!connection.pageInfo.hasNextPage) {
        break;
      }

      after = connection.pageInfo.endCursor;
    }
  }

  async fetchAll<T>(
    fetcher: (options: PaginationOptions) => Promise<Connection<T>>,
    options: PaginationOptions = {}
  ): Promise<PaginationResult<T>> {
    const allNodes: T[] = [];
    const pageInfo: PageInfo = { hasNextPage: false, hasPreviousPage: false };
    let totalCount: number | undefined;

    for await (const nodes of this.iterate(fetcher, options)) {
      allNodes.push(...nodes);
    }

    return {
      data: allNodes,
      pageInfo,
      totalCount
    };
  }
}