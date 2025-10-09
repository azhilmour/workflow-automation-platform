import type { IExecutionContext } from '@repo/types';
import { ExpressionResolver } from './ExpressionResolver';

/**
 * Condition Operators
 */
export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
  LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains',
  IS_EMPTY = 'isEmpty',
  IS_NOT_EMPTY = 'isNotEmpty',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
}

/**
 * Condition Rule
 */
export interface IConditionRule {
  field: string;           // Field to evaluate (supports expressions)
  operator: ConditionOperator;
  value?: any;             // Value to compare against (optional for isEmpty/isNotEmpty)
}

/**
 * Condition Group
 */
export interface IConditionGroup {
  output: number;          // Which output connection to follow (0, 1, 2, etc.)
  rules: IConditionRule[];
  combinator: 'AND' | 'OR';
}

/**
 * Condition Evaluator
 * 
 * Evaluates conditional expressions to determine which branch to execute.
 */
export class ConditionEvaluator {
  private context: IExecutionContext;
  private inputData: any;

  constructor(context: IExecutionContext, inputData?: any) {
    this.context = context;
    this.inputData = inputData || {};
  }

  /**
   * Evaluate a condition group
   */
  evaluateGroup(group: IConditionGroup): boolean {
    if (!group.rules || group.rules.length === 0) {
      return false;
    }

    const results = group.rules.map((rule) => this.evaluateRule(rule));

    if (group.combinator === 'AND') {
      return results.every((result) => result === true);
    } else {
      // OR
      return results.some((result) => result === true);
    }
  }

  /**
   * Evaluate a single rule
   */
  private evaluateRule(rule: IConditionRule): boolean {
    try {
      // Resolve the field value (supports expressions like {{context.score}})
      const resolver = new ExpressionResolver(this.context, this.inputData);
      const fieldValue = resolver.resolve(rule.field);

      // Resolve the comparison value (also supports expressions)
      const compareValue = rule.value !== undefined ? resolver.resolve(rule.value) : undefined;

      // Evaluate based on operator
      switch (rule.operator) {
        case ConditionOperator.EQUALS:
          return this.equals(fieldValue, compareValue);

        case ConditionOperator.NOT_EQUALS:
          return !this.equals(fieldValue, compareValue);

        case ConditionOperator.GREATER_THAN:
          return this.greaterThan(fieldValue, compareValue);

        case ConditionOperator.LESS_THAN:
          return this.lessThan(fieldValue, compareValue);

        case ConditionOperator.GREATER_THAN_OR_EQUAL:
          return this.greaterThanOrEqual(fieldValue, compareValue);

        case ConditionOperator.LESS_THAN_OR_EQUAL:
          return this.lessThanOrEqual(fieldValue, compareValue);

        case ConditionOperator.CONTAINS:
          return this.contains(fieldValue, compareValue);

        case ConditionOperator.NOT_CONTAINS:
          return !this.contains(fieldValue, compareValue);

        case ConditionOperator.IS_EMPTY:
          return this.isEmpty(fieldValue);

        case ConditionOperator.IS_NOT_EMPTY:
          return !this.isEmpty(fieldValue);

        case ConditionOperator.STARTS_WITH:
          return this.startsWith(fieldValue, compareValue);

        case ConditionOperator.ENDS_WITH:
          return this.endsWith(fieldValue, compareValue);

        default:
          console.warn(`Unknown operator: ${rule.operator}`);
          return false;
      }
    } catch (error) {
      console.error('Error evaluating rule:', error);
      return false;
    }
  }

  /**
   * Equals comparison (handles type coercion)
   */
  private equals(a: any, b: any): boolean {
    // Handle null/undefined
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;

    // Try numeric comparison first
    const aNum = Number(a);
    const bNum = Number(b);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum === bNum;
    }

    // String comparison (case-insensitive)
    return String(a).toLowerCase() === String(b).toLowerCase();
  }

  /**
   * Greater than comparison
   */
  private greaterThan(a: any, b: any): boolean {
    const aNum = Number(a);
    const bNum = Number(b);

    if (isNaN(aNum) || isNaN(bNum)) {
      return false;
    }

    return aNum > bNum;
  }

  /**
   * Less than comparison
   */
  private lessThan(a: any, b: any): boolean {
    const aNum = Number(a);
    const bNum = Number(b);

    if (isNaN(aNum) || isNaN(bNum)) {
      return false;
    }

    return aNum < bNum;
  }

  /**
   * Greater than or equal comparison
   */
  private greaterThanOrEqual(a: any, b: any): boolean {
    return this.greaterThan(a, b) || this.equals(a, b);
  }

  /**
   * Less than or equal comparison
   */
  private lessThanOrEqual(a: any, b: any): boolean {
    return this.lessThan(a, b) || this.equals(a, b);
  }

  /**
   * Contains check
   */
  private contains(haystack: any, needle: any): boolean {
    if (haystack == null || needle == null) {
      return false;
    }

    // Array contains
    if (Array.isArray(haystack)) {
      return haystack.some((item) => this.equals(item, needle));
    }

    // String contains
    return String(haystack).toLowerCase().includes(String(needle).toLowerCase());
  }

  /**
   * Is empty check
   */
  private isEmpty(value: any): boolean {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  /**
   * Starts with check
   */
  private startsWith(str: any, prefix: any): boolean {
    if (str == null || prefix == null) {
      return false;
    }

    return String(str).toLowerCase().startsWith(String(prefix).toLowerCase());
  }

  /**
   * Ends with check
   */
  private endsWith(str: any, suffix: any): boolean {
    if (str == null || suffix == null) {
      return false;
    }

    return String(str).toLowerCase().endsWith(String(suffix).toLowerCase());
  }

  /**
   * Static method to evaluate conditions and determine output
   */
  static evaluateConditions(
    conditions: IConditionGroup[],
    context: IExecutionContext,
    inputData: any,
    defaultOutput: number = 0
  ): number {
    const evaluator = new ConditionEvaluator(context, inputData);

    // Evaluate each condition group in order
    for (const condition of conditions) {
      if (evaluator.evaluateGroup(condition)) {
        return condition.output;
      }
    }

    // If no condition matched, return default output
    return defaultOutput;
  }
}

