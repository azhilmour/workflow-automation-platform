import type { INode } from '@repo/types';
import type { IExecutionContext, INodeExecutionResult } from '@repo/types';
import { BaseNodeExecutor } from './BaseNodeExecutor';
import { ExpressionResolver } from '../utils/ExpressionResolver';

/**
 * HTTP Request Node Executor
 * 
 * Sends HTTP requests and returns the response.
 * Supports dynamic parameters through expression resolution.
 */
export class HttpRequestNodeExecutor extends BaseNodeExecutor {
  async execute(
    node: INode,
    context: IExecutionContext,
    inputData: any
  ): Promise<INodeExecutionResult> {
    try {
      this.log(node, 'Executing HTTP request');

      // Resolve expressions in parameters
      const resolvedParams = ExpressionResolver.resolveParameters(
        node.parameters,
        context,
        inputData
      );

      // Validate required parameters
      this.validateParameters(node, ['url', 'method']);

      const {
        url,
        method = 'GET',
        headers = {},
        body,
        timeout = 30000,
        authentication,
      } = resolvedParams;

      this.log(node, `Making ${method} request to ${url}`);

      // Build request options
      const requestOptions: RequestInit = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: AbortSignal.timeout(timeout),
      };

      // Add authentication if provided
      if (authentication) {
        if (authentication.type === 'basic') {
          const { username, password } = authentication;
          const credentials = btoa(`${username}:${password}`);
          requestOptions.headers = {
            ...requestOptions.headers,
            Authorization: `Basic ${credentials}`,
          };
        } else if (authentication.type === 'bearer') {
          const { token } = authentication;
          requestOptions.headers = {
            ...requestOptions.headers,
            Authorization: `Bearer ${token}`,
          };
        } else if (authentication.type === 'header') {
          const { name, value } = authentication;
          requestOptions.headers = {
            ...requestOptions.headers,
            [name]: value,
          };
        }
      }

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
        if (typeof body === 'string') {
          requestOptions.body = body;
        } else {
          requestOptions.body = JSON.stringify(body);
        }
      }

      // Make the request
      const response = await fetch(url, requestOptions);

      // Parse response
      const contentType = response.headers.get('content-type');
      let responseData: any;

      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Build result
      const result = {
        statusCode: response.status,
        statusMessage: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseData,
      };

      this.log(node, `Response: ${response.status} ${response.statusText}`);

      // Check if response is successful
      if (!response.ok) {
        const errorMessage = `HTTP request failed with status ${response.status}`;
        this.log(node, errorMessage);
        
        // If continueOnFail is false, return error
        if (!node.continueOnFail) {
          return this.failure(errorMessage);
        }
      }

      return this.success(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(node, `Error: ${errorMessage}`);
      return this.failure(error instanceof Error ? error : new Error(errorMessage));
    }
  }
}

