/**
 * A simple API client for making HTTP requests
 */

interface ApiOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

export const apiClient = {
  /**
   * Perform a GET request
   */
  get: async <T>(url: string, options: ApiOptions = {}): Promise<T> => {
    try {
      const controller = new AbortController();
      const timeoutId = options.timeout 
        ? setTimeout(() => controller.abort(), options.timeout) 
        : null;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          ...options.headers,
        },
        signal: controller.signal,
      });
      
      if (timeoutId) clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new ApiError(`API request failed with status ${response.status}`, response.status);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }
        throw new ApiError(error.message, 0);
      }
      
      throw new ApiError('Unknown error occurred', 0);
    }
  },
  
  /**
   * Perform a POST request
   */
  post: async <T>(url: string, data: any, options: ApiOptions = {}): Promise<T> => {
    try {
      const controller = new AbortController();
      const timeoutId = options.timeout 
        ? setTimeout(() => controller.abort(), options.timeout) 
        : null;
        
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          ...options.headers,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      
      if (timeoutId) clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new ApiError(`API request failed with status ${response.status}`, response.status);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }
        throw new ApiError(error.message, 0);
      }
      
      throw new ApiError('Unknown error occurred', 0);
    }
  },
  
  // You can add more methods like PUT, DELETE, etc.
};
