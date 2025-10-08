import type { INode } from '@repo/types';
import type { INodeExecutor, IExecutionContext, INodeExecutionResult } from '@repo/types';

export abstract class BaseNodeExecutor implements INodeExecutor {
  /**
   * Execute the node
   */
  abstract execute(
    node: INode,
    context: IExecutionContext,
    inputData: any
  ): Promise<INodeExecutionResult>;

  /**
   * Validate node parameters
   */
  protected validateParameters(node: INode, requiredParams: string[]): void {
    const missing = requiredParams.filter(
      (param) => !(param in node.parameters) || node.parameters[param] === undefined
    );

    if (missing.length > 0) {
      throw new Error(
        `Missing required parameters for ${node.type}: ${missing.join(', ')}`
      );
    }
  }

  /**
   * Create a success result
   */
  protected success(output: any): INodeExecutionResult {
    return {
      success: true,
      output,
    };
  }

  /**
   * Create a failure result
   */
  protected failure(error: string | Error): INodeExecutionResult {
    const errorMessage = error instanceof Error ? error.message : error;
    return {
      success: false,
      output: null,
      error: errorMessage,
    };
  }

  /**
   * Log node execution
   */
  protected log(node: INode, message: string): void {
    console.log(`[${node.type}:${node.name}] ${message}`);
  }
}

