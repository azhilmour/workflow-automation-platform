import type { INode } from '@repo/types';
import type { IExecutionContext, INodeExecutionResult } from '@repo/types';
import { BaseNodeExecutor } from './BaseNodeExecutor';

/**
 * Trigger Node Executor
 * 
 * Handles webhook trigger nodes that initiate workflow execution.
 * Validates and passes through the trigger data to subsequent nodes.
 */
export class TriggerNodeExecutor extends BaseNodeExecutor {
  async execute(
    node: INode,
    context: IExecutionContext,
    inputData: any
  ): Promise<INodeExecutionResult> {
    try {
      this.log(node, 'Processing trigger node');

      // Get trigger data from context
      const triggerData = context.triggerData;

      // If the node has configured expected keys, validate them
      if (node.parameters.expectedKeys && Array.isArray(node.parameters.expectedKeys)) {
        const expectedKeys = node.parameters.expectedKeys as string[];
        const missingKeys = expectedKeys.filter(
          (key) => !(key in triggerData)
        );

        if (missingKeys.length > 0) {
          this.log(
            node,
            `Warning: Missing expected keys in trigger data: ${missingKeys.join(', ')}`
          );
        }
      }

      // Log received data
      this.log(node, `Received trigger data: ${JSON.stringify(triggerData)}`);

      // Pass through the trigger data
      return this.success(triggerData);
    } catch (error) {
      this.log(node, `Error: ${error instanceof Error ? error.message : String(error)}`);
      return this.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}

