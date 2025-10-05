# Workflow Execution System Design

## Overview
This document outlines the design for a workflow automation execution engine similar to n8n. The system executes workflows triggered by webhooks and processes nodes sequentially or conditionally based on the workflow graph.

## v0 Requirements

### Supported Node Types
1. **Trigger Node**: Webhook trigger with context data
2. **HTTP Request Node**: Sends HTTP requests and continues to next nodes
3. **Email Node**: Sends emails via Resend API
4. **Telegram Node**: Sends Telegram messages
5. **Condition Block**: Conditional branching based on context data

### Example Workflows

#### Simple Workflow
```
Trigger (no context)
  → HTTP Request (hardcoded URL + body)
    → Email (hardcoded address + body, Resend credentials)
    → Telegram (hardcoded number + message, Telegram credentials)
```

#### Complex Workflow
```
Webhook Trigger (context: name, email, mobileNumber, score)
  → Condition Block (check score value)
    → If score > 90: Email (body hardcoded, address from context)
    → If score <= 90: Telegram (content hardcoded, number from context)
```

---

## Architecture

### 1. Core Components

#### 1.1 Execution Context
The execution context stores runtime data that flows through the workflow.

```typescript
interface IExecutionContext {
  executionId: string;
  workflowId: number;
  userId: string;
  triggerData: Record<string, any>;  // Initial webhook data
  nodeOutputs: Map<string, any>;     // Output from each node
  startedAt: Date;
  status: ExecutionStatus;
}

enum ExecutionStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PENDING = 'PENDING'  // For v1: waiting for external response
}
```

#### 1.2 Execution Entity (New Database Entity)
Track all workflow executions for history and debugging.

```typescript
@Entity('workflow_executions')
export class WorkflowExecutionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  workflowId!: number;

  @Column()
  userId!: string;

  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    default: ExecutionStatus.RUNNING
  })
  status!: ExecutionStatus;

  @Column('jsonb')
  triggerData!: Record<string, any>;

  @Column('jsonb', { nullable: true })
  nodeExecutions!: INodeExecution[];  // Track each node's execution

  @Column('text', { nullable: true })
  error?: string;

  @Column()
  startedAt!: Date;

  @Column({ nullable: true })
  completedAt?: Date;
}

interface INodeExecution {
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
```

#### 1.3 Execution Engine
The core orchestrator that manages workflow execution.

```typescript
class ExecutionEngine {
  async executeWorkflow(
    workflowId: number,
    webhookId: string,
    triggerData: Record<string, any>
  ): Promise<string> {
    // 1. Load workflow from database
    // 2. Find trigger node by webhookId
    // 3. Create execution context
    // 4. Create execution record in database
    // 5. Start execution from trigger node
    // 6. Return executionId
  }

  private async executeNode(
    node: INode,
    context: IExecutionContext,
    inputData: any
  ): Promise<any> {
    // 1. Get appropriate node executor
    // 2. Execute node logic
    // 3. Store output in context
    // 4. Update execution record
    // 5. Find and execute next nodes
    // 6. Return output
  }

  private async executeNextNodes(
    currentNodeId: string,
    workflow: WorkflowEntity,
    context: IExecutionContext,
    outputData: any
  ): Promise<void> {
    // 1. Get connections from current node
    // 2. For each connection, execute next node
    // 3. Handle parallel execution
  }
}
```

#### 1.4 Node Executors
Each node type has its own executor implementing a common interface.

```typescript
interface INodeExecutor {
  execute(
    node: INode,
    context: IExecutionContext,
    inputData: any
  ): Promise<INodeExecutionResult>;
}

interface INodeExecutionResult {
  success: boolean;
  output: any;
  error?: string;
}

// Node Types
enum NodeType {
  TRIGGER = 'trigger',
  HTTP_REQUEST = 'httpRequest',
  SEND_EMAIL = 'sendEmail',
  SEND_TELEGRAM = 'sendTelegram',
  CONDITION = 'condition'
}
```

**Node Executor Implementations:**

- **TriggerNodeExecutor**: Extracts and validates context data from webhook payload
- **HttpRequestNodeExecutor**: Makes HTTP requests using node parameters
- **EmailNodeExecutor**: Sends emails via Resend API using stored credentials
- **TelegramNodeExecutor**: Sends Telegram messages using stored credentials
- **ConditionNodeExecutor**: Evaluates conditions and determines which branch to execute

---

### 2. Directory Structure

```
apps/executor/src/
├── index.ts                      # Entry point with webhook handler
├── engine/
│   ├── ExecutionEngine.ts        # Core orchestration logic
│   └── ExecutionContext.ts       # Context management
├── executors/
│   ├── BaseNodeExecutor.ts       # Abstract base class
│   ├── TriggerNodeExecutor.ts
│   ├── HttpRequestNodeExecutor.ts
│   ├── EmailNodeExecutor.ts
│   ├── TelegramNodeExecutor.ts
│   └── ConditionNodeExecutor.ts
├── services/
│   ├── CredentialsService.ts     # Decrypt and retrieve credentials
│   ├── WorkflowService.ts        # Load workflow and webhook data
│   └── ExecutionService.ts       # CRUD operations for executions
├── utils/
│   ├── ExpressionResolver.ts     # Resolve {{context.key}} expressions
│   └── ConditionEvaluator.ts     # Evaluate condition expressions
└── types/
    └── execution.types.ts        # Execution-related types
```

---

### 3. Execution Flow

#### 3.1 Webhook Handler Flow
```
1. Webhook Request → /webhook/handler/:id
2. Validate webhook exists and workflow is active
3. Extract trigger data from request body
4. Create execution context
5. Execute workflow asynchronously (fire and forget)
6. Return 200 OK immediately
```

#### 3.2 Node Execution Flow
```
1. Get node from workflow
2. Resolve expressions in node parameters (e.g., {{context.email}})
3. Execute node using appropriate executor
4. Store node execution result
5. Check for errors and handle continueOnFail
6. Find next nodes from connections
7. Execute next nodes (parallel or sequential based on connection type)
```

#### 3.3 Connection Handling
```typescript
// Example connections structure from WorkflowEntity
{
  "node1": {
    "main": [
      [
        { "node": "node2", "type": "main", "index": 0 },
        { "node": "node3", "type": "main", "index": 0 }
      ]
    ]
  },
  "node2": {
    "main": [
      [{ "node": "node4", "type": "main", "index": 0 }]
    ]
  }
}
```

For v0, we execute all connected nodes in parallel. The system follows the `main` connection type.

---

### 4. Expression Resolution

The system supports dynamic expressions in node parameters:

```typescript
// Examples:
"{{$trigger.body.email}}"           // Access trigger data
"{{$node.httpRequest.data.id}}"     // Access previous node output
"{{$context.score}}"                 // Access context data

// Expression Resolver
class ExpressionResolver {
  resolve(
    expression: string,
    context: IExecutionContext
  ): any {
    // Parse and resolve expression
    // Support: $trigger, $node, $context
  }
}
```

---

### 5. Condition Evaluation

Condition nodes evaluate expressions and determine execution path.

```typescript
interface IConditionParameter {
  conditions: IConditionGroup[];
  defaultOutput: number;  // Which output to use if no condition matches
}

interface IConditionGroup {
  output: number;          // Which output connection to follow
  rules: IConditionRule[];
  combinator: 'AND' | 'OR';
}

interface IConditionRule {
  field: string;           // e.g., "{{context.score}}"
  operator: ConditionOperator;
  value: any;
}

enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
  LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains'
}
```

---

### 6. Error Handling

#### 6.1 Node-Level Error Handling
- If `continueOnFail` is true, store error and continue to next nodes
- If false, stop execution and mark workflow execution as FAILED
- Store error details in execution record

#### 6.2 Retry Logic
- If `retryOnFail` is true, retry node execution
- Use `maxTries` and `waitBetweenTries` from node configuration
- Exponential backoff between retries

```typescript
async executeNodeWithRetry(
  node: INode,
  context: IExecutionContext,
  inputData: any
): Promise<INodeExecutionResult> {
  const maxTries = node.maxTries || 1;
  const waitMs = node.waitBetweenTries || 0;

  for (let attempt = 0; attempt < maxTries; attempt++) {
    const result = await this.executeNode(node, context, inputData);
    
    if (result.success) {
      return result;
    }

    if (attempt < maxTries - 1) {
      await this.sleep(waitMs * Math.pow(2, attempt));
    }
  }

  // All retries failed
  return { success: false, output: null, error: 'Max retries exceeded' };
}
```

---

### 7. Credentials Management

Credentials are stored encrypted in the database and decrypted at runtime.

```typescript
class CredentialsService {
  async getCredentials(
    credentialId: number,
    userId: string
  ): Promise<any> {
    // 1. Fetch credential from database
    // 2. Verify userId matches
    // 3. Decrypt credential data
    // 4. Return decrypted credentials
  }

  async decrypt(encryptedData: string): Promise<any> {
    // Decrypt using environment encryption key
    // Return parsed JSON data
  }
}
```

**Node Parameter Examples:**

```typescript
// Email Node Parameters
{
  "toEmail": "{{context.email}}",
  "subject": "Your Score Results",
  "body": "Hello {{context.name}}, your score is {{context.score}}",
  "fromEmail": "noreply@example.com"
}
// Credentials reference: node.credentials.resend.id

// Telegram Node Parameters
{
  "chatId": "{{context.mobileNumber}}",
  "message": "Hello {{context.name}}, your score is {{context.score}}"
}
// Credentials reference: node.credentials.telegram.id
```

---

### 8. Logging and Monitoring

```typescript
interface IExecutionLog {
  executionId: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: Date;
  nodeId?: string;
  metadata?: any;
}

class ExecutionLogger {
  log(executionId: string, message: string, metadata?: any): void;
  warn(executionId: string, message: string, metadata?: any): void;
  error(executionId: string, message: string, error: Error): void;
}
```

---

## v1 Considerations

### 1. AI Agent Nodes
**Design Consideration:**
- AI nodes will use different connection types (`ai_agent`, `ai_chain`, etc.)
- May require streaming output handling
- Potentially long execution times (need timeout configuration)

**Suggested Approach:**
- Extend `INodeExecutor` with streaming support
- Add connection type handling in `executeNextNodes()`
- Implement separate queue for long-running AI tasks

### 2. Node Convergence (Multiple Inputs)
**Design Consideration:**
- A node should only execute when all parent nodes have completed successfully

**Suggested Approach:**
```typescript
interface INodeExecutionState {
  nodeId: string;
  completedInputs: Set<string>;  // Parent node IDs that completed
  requiredInputs: Set<string>;   // All parent node IDs
  isReady: boolean;
}

// In ExecutionEngine:
private checkNodeReady(
  nodeId: string,
  completedParentId: string,
  state: Map<string, INodeExecutionState>
): boolean {
  const nodeState = state.get(nodeId);
  nodeState.completedInputs.add(completedParentId);
  
  return nodeState.completedInputs.size === nodeState.requiredInputs.size;
}
```

### 3. Waiting for External Response
**Design Consideration:**
- Email/Telegram nodes may need to wait for user response
- Execution should be paused and resumed later

**Suggested Approach:**
```typescript
enum ExecutionStatus {
  RUNNING = 'RUNNING',
  WAITING = 'WAITING',      // New status
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

interface IWaitingExecution {
  executionId: string;
  nodeId: string;
  waitingFor: 'EMAIL_RESPONSE' | 'TELEGRAM_RESPONSE';
  resumeToken: string;      // Token to resume execution
  expiresAt: Date;
}

// New endpoint to resume execution
POST /webhook/resume/:token
{
  "response": "user response data"
}

class ExecutionEngine {
  async pauseExecution(
    executionId: string,
    nodeId: string,
    waitingFor: string
  ): Promise<string> {
    // 1. Create resume token
    // 2. Update execution status to WAITING
    // 3. Store waiting state
    // 4. Return resume token (to be included in email/telegram)
  }

  async resumeExecution(
    resumeToken: string,
    responseData: any
  ): Promise<void> {
    // 1. Load waiting execution
    // 2. Validate token not expired
    // 3. Create context with response data
    // 4. Continue execution from next nodes
  }
}
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Days 1-2)
1. Create execution entities and types
2. Implement ExecutionEngine skeleton
3. Set up ExecutionService for database operations
4. Implement WorkflowService and CredentialsService

### Phase 2: Basic Node Executors (Days 3-4)
1. Implement TriggerNodeExecutor
2. Implement HttpRequestNodeExecutor
3. Create ExpressionResolver utility
4. Test simple workflow (trigger → HTTP request)

### Phase 3: Communication Nodes (Days 5-6)
1. Implement EmailNodeExecutor with Resend integration
2. Implement TelegramNodeExecutor
3. Test parallel execution (HTTP → Email + Telegram)

### Phase 4: Conditional Logic (Day 7)
1. Implement ConditionNodeExecutor
2. Implement ConditionEvaluator utility
3. Test complex workflow with conditions

### Phase 5: Error Handling & Polish (Days 8-9)
1. Implement retry logic
2. Add comprehensive error handling
3. Add execution logging
4. Create execution history API endpoints

### Phase 6: Testing & Documentation (Day 10)
1. End-to-end testing
2. Performance testing
3. API documentation
4. Deployment guide

---

## API Endpoints (Executor Service)

```
POST   /webhook/handler/:id           # Trigger workflow execution
GET    /executions/:id                # Get execution details
GET    /executions/workflow/:id       # List executions for workflow
GET    /health                        # Health check
```

---

## Environment Variables

```env
PORT=3000
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=<secret-key-for-credentials>
LOG_LEVEL=info
```

---

## Security Considerations

1. **Credential Encryption**: All credentials stored encrypted at rest
2. **User Isolation**: Always verify userId matches for workflows/credentials
3. **Rate Limiting**: Implement rate limiting on webhook endpoints
4. **Webhook Validation**: Validate webhook signatures (v1 feature)
5. **Expression Sandboxing**: Sanitize and sandbox expression evaluation

---

## Performance Considerations

1. **Async Execution**: Workflow execution is fire-and-forget (non-blocking)
2. **Parallel Node Execution**: Execute independent nodes in parallel
3. **Connection Pooling**: Use database connection pooling
4. **Execution Timeout**: Set maximum execution time per workflow
5. **Node Output Size**: Limit stored node output size to prevent memory issues

---

## Testing Strategy

1. **Unit Tests**: Test individual node executors
2. **Integration Tests**: Test execution engine with mock workflows
3. **End-to-End Tests**: Test complete workflows via webhook handler
4. **Performance Tests**: Test with high webhook volume
5. **Error Scenario Tests**: Test various failure scenarios

---

## Monitoring & Observability

1. **Execution Metrics**:
   - Total executions per workflow
   - Success/failure rate
   - Average execution time
   - Node execution times

2. **Logs**:
   - Structured logging with executionId
   - Log levels: INFO, WARN, ERROR
   - Store in execution record

3. **Alerts**:
   - High failure rate
   - Execution timeouts
   - Credential errors

---

## Conclusion

This design provides a solid foundation for v0 while considering future v1 enhancements. The architecture is modular, extensible, and follows best practices for workflow automation systems. The separation of concerns (engine, executors, services) makes it easy to add new node types and features in the future.



