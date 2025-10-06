
export enum WorkflowStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ARCHIVED = 'ARCHIVED'
  }
  
  export enum ExecutionStatus {
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    PENDING = 'PENDING'
  }
  
  export interface INodeExecution {
    nodeId: string;
    nodeName: string;
    nodeType: string;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    input: any;
    output: any;
    error?: string;
    startedAt: Date;
    completedAt: Date;
    executionTime: number; // in milliseconds
  }
  
  
  export interface IExecutionContext {
    executionId: string;
    workflowId: number;
    userId: string;
    triggerData: Record<string, any>;
    nodeOutputs: Map<string, any>;
    startedAt: Date;
    status: ExecutionStatus;
  }
  
  export interface INodeExecutionResult {
    success: boolean;
    output: any;
    error?: string;
  }
  
  export enum NodeType {
    TRIGGER = 'trigger',
    HTTP_REQUEST = 'httpRequest',
    SEND_EMAIL = 'sendEmail',
    SEND_TELEGRAM = 'sendTelegram',
    CONDITION = 'condition'
  }
  
  export interface INodeExecutor {
    execute(
      node: any,
      context: IExecutionContext,
      inputData: any
    ): Promise<INodeExecutionResult>;
  }