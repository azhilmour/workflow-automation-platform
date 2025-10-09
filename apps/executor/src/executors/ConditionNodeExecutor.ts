import type { INode, IExecutionContext, INodeExecutionResult } from '@repo/types';
import { BaseNodeExecutor } from './BaseNodeExecutor';
import { ConditionEvaluator, type IConditionGroup } from '../utils/ConditionEvaluator';

/**
 * Condition Node Executor
 * 
 * Evaluates conditions and determines which output branch to execute.
 * Supports multiple conditions with AND/OR logic.
 */
export class ConditionNodeExecutor extends BaseNodeExecutor {
  async execute(
    node: INode,
    context: IExecutionContext,
    inputData: any
  ): Promise<INodeExecutionResult> {
    try {
      this.log(node, 'Evaluating conditions');

      // Get conditions from parameters
      const { conditions, defaultOutput = 0 } = node.parameters;

      if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
        this.log(node, 'No conditions defined, using default output');
        return this.success({
          selectedOutput: defaultOutput,
          matched: false,
        });
      }

      // Evaluate conditions
      const selectedOutput = ConditionEvaluator.evaluateConditions(
        conditions as IConditionGroup[],
        context,
        inputData,
        defaultOutput
      );

      this.log(node, `Condition evaluated: selected output ${selectedOutput}`);

      // Return result with selected output
      // The execution engine will use this to determine which branch to follow
      return this.success({
        selectedOutput,
        matched: true,
        inputData, // Pass through input data to next nodes
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(node, `Error: ${errorMessage}`);
      return this.failure(error instanceof Error ? error : new Error(errorMessage));
    }
  }
}

