import type { INode } from '@repo/types';
import type { INodeExecutor } from '@repo/types';
import { NodeType } from '@repo/types';
import { TriggerNodeExecutor } from './TriggerNodeExecutor';
import { HttpRequestNodeExecutor } from './HttpRequestNodeExecutor';

/**
 * Node Executor Factory
 * 
 * Creates the appropriate node executor based on the node type.
 */
export class NodeExecutorFactory {
  private static executors: Map<string, INodeExecutor> = new Map();

  /**
   * Get executor for a node
   */
  static getExecutor(node: INode): INodeExecutor {
    // Check if we have a cached executor for this type
    if (!this.executors.has(node.type)) {
      this.executors.set(node.type, this.createExecutor(node.type));
    }

    const executor = this.executors.get(node.type);
    if (!executor) {
      throw new Error(`No executor found for node type: ${node.type}`);
    }

    return executor;
  }

  /**
   * Create a new executor instance for a node type
   */
  private static createExecutor(nodeType: string): INodeExecutor {
    switch (nodeType) {
      case NodeType.TRIGGER:
      case 'webhook':
      case 'webhookTrigger':
        return new TriggerNodeExecutor();

      case NodeType.HTTP_REQUEST:
      case 'httpRequest':
        return new HttpRequestNodeExecutor();

      // TODO: Add more executors in Phase 3
      // case NodeType.SEND_EMAIL:
      //   return new EmailNodeExecutor();
      // case NodeType.SEND_TELEGRAM:
      //   return new TelegramNodeExecutor();
      // case NodeType.CONDITION:
      //   return new ConditionNodeExecutor();

      default:
        throw new Error(`Unsupported node type: ${nodeType}`);
    }
  }

  /**
   * Register a custom executor
   */
  static registerExecutor(nodeType: string, executor: INodeExecutor): void {
    this.executors.set(nodeType, executor);
  }

  /**
   * Clear all cached executors
   */
  static clearCache(): void {
    this.executors.clear();
  }
}

