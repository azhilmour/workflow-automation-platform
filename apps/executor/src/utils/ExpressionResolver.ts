import type { IExecutionContext } from '@repo/types';

/**
 * Expression Resolver
 * Resolves dynamic expressions in node parameters
 * 
 * Supported expressions:
 * - {{$trigger.body.fieldName}} - Access trigger data
 * - {{$node.nodeId.fieldName}} - Access previous node output
 * - {{context.fieldName}} - Access context data (alias for trigger)
 * - {{$json.fieldName}} - Access input data from previous node
 */
export class ExpressionResolver {
  private context: IExecutionContext;
  private inputData: any;

  constructor(context: IExecutionContext, inputData?: any) {
    this.context = context;
    this.inputData = inputData || {};
  }

  /**
   * Resolve all expressions in a value (string, object, or array)
   */
  resolve(value: any): any {
    if (typeof value === 'string') {
      return this.resolveString(value);
    } else if (Array.isArray(value)) {
      return value.map((item) => this.resolve(item));
    } else if (value && typeof value === 'object') {
      const resolved: any = {};
      for (const [key, val] of Object.entries(value)) {
        resolved[key] = this.resolve(val);
      }
      return resolved;
    }
    return value;
  }

  /**
   * Resolve expressions in a string
   */
  private resolveString(str: string): any {
    // Check if the entire string is a single expression
    const singleExpressionMatch = str.match(/^{{(.+?)}}$/);
    if (singleExpressionMatch) {
      return this.resolveExpression(singleExpressionMatch[1].trim());
    }

    // Replace all expressions in the string
    return str.replace(/{{(.+?)}}/g, (match, expression) => {
      const resolved = this.resolveExpression(expression.trim());
      return resolved !== undefined ? String(resolved) : match;
    });
  }

  /**
   * Resolve a single expression
   */
  private resolveExpression(expression: string): any {
    try {
      // Handle $trigger expressions
      if (expression.startsWith('$trigger.')) {
        const path = expression.substring('$trigger.'.length);
        return this.getNestedValue(this.context.triggerData, path);
      }

      // Handle $node expressions
      if (expression.startsWith('$node.')) {
        const parts = expression.substring('$node.'.length).split('.');
        const nodeId = parts[0];
        const path = parts.slice(1).join('.');
        const nodeOutput = this.context.getNodeOutput(nodeId);
        return path ? this.getNestedValue(nodeOutput, path) : nodeOutput;
      }

      // Handle $json expressions (input data from previous node)
      if (expression.startsWith('$json.')) {
        const path = expression.substring('$json.'.length);
        return this.getNestedValue(this.inputData, path);
      }

      // Handle context expressions (alias for trigger data)
      if (expression.startsWith('context.')) {
        const path = expression.substring('context.'.length);
        return this.getNestedValue(this.context.triggerData, path);
      }

      // If no prefix, try to get from trigger data
      return this.getNestedValue(this.context.triggerData, expression);
    } catch (error) {
      console.warn(`Failed to resolve expression: ${expression}`, error);
      return undefined;
    }
  }

  /**
   * Get nested value from an object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) {
      return obj;
    }

    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Check if a string contains expressions
   */
  static hasExpressions(value: string): boolean {
    return typeof value === 'string' && /{{.+?}}/.test(value);
  }

  /**
   * Resolve parameters for a node
   */
  static resolveParameters(
    parameters: any,
    context: IExecutionContext,
    inputData?: any
  ): any {
    const resolver = new ExpressionResolver(context, inputData);
    return resolver.resolve(parameters);
  }
}

