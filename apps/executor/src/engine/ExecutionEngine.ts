import type { INode, IConnections } from '@repo/types';
import type { WorkflowEntity } from '@repo/db';
import { ExecutionStatus, type INodeExecution } from '@repo/types';
import { ExecutionContext } from './ExecutionContext';
import type { IExecutionContext, INodeExecutionResult } from '@repo/types';
import { ExecutionService } from '../services/ExecutionService';
import { WorkflowService } from '../services/WorkflowService';
import { NodeExecutorFactory } from '../executors/NodeExecutorFactory';

export class ExecutionEngine {
  public executionService: ExecutionService;
  private workflowService: WorkflowService;

  constructor() {
    this.executionService = new ExecutionService();
    this.workflowService = new WorkflowService();
  }

  /**
   * Main entry point to execute a workflow
   */
  async executeWorkflow(
    webhookId: string,
    method: string,
    triggerData: Record<string, any>
  ): Promise<string> {
    try {
      // 1. Load webhook and workflow from database
      const webhook = await this.workflowService.getWebhookById(webhookId, method);
      if (!webhook) {
        throw new Error(`Webhook not found: ${webhookId}`);
      }

      const workflow = webhook.workflow;
      
      // Check if workflow is active
      if (workflow.status !== 'ACTIVE') {
        throw new Error(`Workflow ${workflow.id} is not active`);
      }

      // 2. Find trigger node by webhookId
      const triggerNode = workflow.nodes.find(
        (node) => node.webhookId === webhookId
      );

      if (!triggerNode) {
        throw new Error(`Trigger node not found for webhook: ${webhookId}`);
      }

      // 3. Create execution context
      const executionId = await this.executionService.createExecution(
        workflow.id,
        workflow.userId,
        triggerData
      );

      const context = new ExecutionContext(
        executionId,
        workflow.id,
        workflow.userId,
        triggerData
      );

      // 4. Start execution asynchronously (fire and forget)
      this.startExecution(triggerNode, workflow, context).catch((error) => {
        console.error(`Execution ${executionId} failed:`, error);
      });

      // 5. Return executionId immediately
      return executionId;
    } catch (error) {
      console.error('Failed to start workflow execution:', error);
      throw error;
    }
  }

  /**
   * Start the actual execution flow
   */
  private async startExecution(
    triggerNode: INode,
    workflow: WorkflowEntity,
    context: IExecutionContext
  ): Promise<void> {
    try {
      // Execute trigger node
      const triggerOutput = await this.executeNode(
        triggerNode,
        context,
        context.triggerData
      );

      if (!triggerOutput.success) {
        throw new Error(triggerOutput.error || 'Trigger node execution failed');
      }

      // Execute next nodes
      await this.executeNextNodes(
        triggerNode.id,
        workflow,
        context,
        triggerOutput.output
      );

      // Mark execution as completed
      context.status = ExecutionStatus.COMPLETED;
      await this.executionService.completeExecution(
        context.executionId,
        ExecutionStatus.COMPLETED
      );

      console.log(`✓ Execution ${context.executionId} completed successfully`);
    } catch (error) {
      console.error(`✗ Execution ${context.executionId} failed:`, error);
      context.status = ExecutionStatus.FAILED;
      await this.executionService.completeExecution(
        context.executionId,
        ExecutionStatus.FAILED,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    node: INode,
    context: IExecutionContext,
    inputData: any
  ): Promise<INodeExecutionResult> {
    const startTime = Date.now();
    
    console.log(`Executing node: ${node.name} (${node.type})`);

    try {
      // Get appropriate node executor based on node.type
      const executor = NodeExecutorFactory.getExecutor(node);

      // Execute the node
      const result = await executor.execute(node, context, inputData);

      // Store output in context
      context.nodeOutputs.set(node.id, result.output);

      // Record node execution
      const nodeExecution: INodeExecution = {
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        status: result.success ? 'SUCCESS' : 'FAILED',
        input: inputData,
        output: result.output,
        error: result.error,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        executionTime: Date.now() - startTime,
      };

      await this.executionService.addNodeExecution(
        context.executionId,
        nodeExecution
      );

      return result;
    } catch (error) {
      console.error(`Node ${node.name} execution failed:`, error);

      // Record failed node execution
      const nodeExecution: INodeExecution = {
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        status: 'FAILED',
        input: inputData,
        output: null,
        error: error instanceof Error ? error.message : String(error),
        startedAt: new Date(startTime),
        completedAt: new Date(),
        executionTime: Date.now() - startTime,
      };

      await this.executionService.addNodeExecution(
        context.executionId,
        nodeExecution
      );

      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute all nodes connected to the current node
   */
  private async executeNextNodes(
    currentNodeId: string,
    workflow: WorkflowEntity,
    context: IExecutionContext,
    outputData: any
  ): Promise<void> {
    const connections = workflow.connections[currentNodeId];
    
    if (!connections || !connections.main) {
      console.log(`No next nodes for: ${currentNodeId}`);
      return;
    }

    // Get all connections from the 'main' output
    const mainConnections = connections.main[0];
    
    if (!mainConnections || mainConnections.length === 0) {
      return;
    }

    // Execute all next nodes in parallel
    const nextNodePromises = mainConnections.map(async (connection) => {
      const nextNode = workflow.nodes.find((n) => n.id === connection.node);
      
      if (!nextNode) {
        console.warn(`Next node not found: ${connection.node}`);
        return;
      }

      if (nextNode.disabled) {
        console.log(`Skipping disabled node: ${nextNode.name}`);
        return;
      }

      // Execute the next node
      const result = await this.executeNode(nextNode, context, outputData);

      if (!result.success && !nextNode.continueOnFail) {
        throw new Error(
          `Node ${nextNode.name} failed: ${result.error}`
        );
      }

      // Continue to nodes after this one
      await this.executeNextNodes(
        nextNode.id,
        workflow,
        context,
        result.output
      );
    });

    // Wait for all parallel nodes to complete
    await Promise.all(nextNodePromises);
  }
}

