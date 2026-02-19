import { ShopifyError, RateLimitError } from './errors';

export interface RetryConfig {
  maxRetries: number;
  delay: number;
  maxDelay?: number;
}

export interface RetryContext {
  attempt: number;
  maxAttempts: number;
  lastError: ShopifyError;
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  delay: 1000,
  maxDelay: 60000
};

export const shouldRetry = (error: any, attempt: number, maxAttempts: number): boolean => {
  if (attempt >= maxAttempts) {
    return false;
  }

  if (error instanceof RateLimitError) {
    return true;
  }

  if (error.statusCode) {
    const status = error.statusCode;
    return status >= 500 || status === 429;
  }

  const code = error.code || (typeof error === 'string' ? error : undefined);
  const retryCodes = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'];
  
  return retryCodes.includes(code);
};

export const getRetryDelay = (
  error: any,
  attempt: number,
  config: RetryConfig
): number => {
  if (error instanceof RateLimitError && error.retryAfter) {
    return error.retryAfter * 1000;
  }

  const baseDelay = config.delay * Math.pow(2, attempt - 1);
  
  if (config.maxDelay) {
    return Math.min(baseDelay, config.maxDelay);
  }

  return baseDelay;
};

export const retryWithExponentialBackoff = async <T>(
  fn: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig
): Promise<T> => {
  let lastError: ShopifyError;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error instanceof ShopifyError 
        ? error 
        : new ShopifyError(error.message || 'Unknown error', undefined, undefined, error);

      if (!shouldRetry(lastError, attempt, config.maxRetries + 1)) {
        throw lastError;
      }

      const delay = getRetryDelay(lastError, attempt, config);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};