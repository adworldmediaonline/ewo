/**
 * API endpoints configuration
 * @constant
 * @type {Object.<string, string>}
 */
export const apiEndpoint = {
  getShowCategory: '/api/category/show',
};

/**
 * Custom API Error class for error handling
 * @class ApiError
 * @extends {Error}
 */
class ApiError extends Error {
  /**
   * @param {number} status - HTTP status code
   * @param {string} message - Error message
   * @param {*} [data=null] - Additional error data
   */
  constructor(status, message, data = null) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * Creates a timeout promise that rejects after specified duration
 * @param {number} timeout - Timeout duration in milliseconds
 * @returns {Promise} Promise that rejects after timeout
 */
const timeoutPromise = timeout => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new ApiError(408, 'Request timeout'));
    }, timeout);
  });
};

/**
 * Main fetch function with error handling and timeout
 * @param {Object} config - Fetch configuration
 * @param {string} config.endpoint - API endpoint
 * @param {string} [config.method='GET'] - HTTP method
 * @param {Object} [config.body=null] - Request body
 * @param {Object} [config.headers={}] - Request headers
 * @param {string} [config.cache='force-cache'] - Cache strategy
 * @param {number} [config.timeout=8000] - Request timeout in milliseconds
 * @param {Array} [config.tags=[]] - Cache tags for revalidation
 * @param {number} [config.revalidate] - Revalidation time in seconds
 * @returns {Promise<*>} Response data
 * @throws {ApiError} Throws API error with status and message
 */
export const fetchApi = async ({
  endpoint,
  method = 'GET',
  body = null,
  headers = {},
  cache,
  tags,
  revalidate,
}) => {
  try {
    const baseUrl = process.env.API_BASE_URL;
    if (!baseUrl) {
      throw new ApiError(500, 'API base URL is not configured');
    }

    const url = `${baseUrl}${endpoint}`;

    // Default headers
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Request options
    const options = {
      method,
      headers: defaultHeaders,
    };

    // Only add body if it exists
    if (body) {
      options.body = JSON.stringify(body);
    }

    // Only add cache if it's provided
    if (cache) {
      options.cache = cache;
    }

    // Only add next.js specific options if they're provided
    if (tags || revalidate) {
      options.next = {};
      if (tags) {
        options.next.tags = tags;
      }
      if (revalidate) {
        options.next.revalidate = revalidate;
      }
    }

    const response = await fetch(url, options);

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(
        response.status,
        errorData.message || 'An error occurred',
        errorData
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || 'An error occurred');
  }
};

/**
 * Helper function for GET requests
 * @param {string} endpoint - API endpoint
 * @param {Object} [options={}] - Additional options
 * @returns {Promise<*>} Response data
 */
export const get = async (endpoint, options = {}) => {
  return await fetchApi({ endpoint, method: 'GET', ...options });
};

/**
 * Helper function for POST requests
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @param {Object} [options={}] - Additional options
 * @returns {Promise<*>} Response data
 */
export const post = async (endpoint, body, options = {}) => {
  return await fetchApi({ endpoint, method: 'POST', body, ...options });
};

/**
 * Helper function for PUT requests
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @param {Object} [options={}] - Additional options
 * @returns {Promise<*>} Response data
 */
export const put = async (endpoint, body, options = {}) => {
  return await fetchApi({ endpoint, method: 'PUT', body, ...options });
};

/**
 * Helper function for DELETE requests
 * @param {string} endpoint - API endpoint
 * @param {Object} [options={}] - Additional options
 * @returns {Promise<*>} Response data
 */
export const del = async (endpoint, options = {}) => {
  return await fetchApi({ endpoint, method: 'DELETE', ...options });
};

/**
 * Helper function for PATCH requests
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @param {Object} [options={}] - Additional options
 * @returns {Promise<*>} Response data
 */
export const patch = async (endpoint, body, options = {}) => {
  return await fetchApi({ endpoint, method: 'PATCH', body, ...options });
};
