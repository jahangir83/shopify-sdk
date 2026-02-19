export class ShopifyError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ShopifyError';
  }
}

export class GraphQLParseError extends ShopifyError {
  constructor(message: string, response?: any) {
    super(message, 'PARSE_ERROR', 400, response);
    this.name = 'GraphQLParseError';
  }
}

export class GraphQLValidationError extends ShopifyError {
  constructor(public errors: any[], response?: any) {
    super('GraphQL validation failed', 'VALIDATION_ERROR', 400, response);
    this.name = 'GraphQLValidationError';
  }
}

export class GraphQLExecutionError extends ShopifyError {
  constructor(public errors: any[], response?: any) {
    super('GraphQL execution failed', 'EXECUTION_ERROR', 200, response);
    this.name = 'GraphQLExecutionError';
  }
}

export class RateLimitError extends ShopifyError {
  constructor(
    public retryAfter?: number,
    response?: any
  ) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429, response);
    this.name = 'RateLimitError';
  }
}

export class UnauthorizedError extends ShopifyError {
  constructor(response?: any) {
    super('Unauthorized', 'UNAUTHORIZED', 401, response);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ShopifyError {
  constructor(response?: any) {
    super('Forbidden', 'FORBIDDEN', 403, response);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ShopifyError {
  constructor(response?: any) {
    super('Not Found', 'NOT_FOUND', 404, response);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends ShopifyError {
  constructor(statusCode: number, response?: any) {
    super('Server Error', 'SERVER_ERROR', statusCode, response);
    this.name = 'ServerError';
  }
}