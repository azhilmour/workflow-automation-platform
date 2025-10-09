# Phase 4 Implementation Summary

## Overview
Phase 4 completes the v0 feature set by implementing conditional logic. The system now supports conditional branching, enabling workflows to make decisions based on data and route execution to different paths.

## Completed Components

### 1. Condition Evaluator

#### ConditionEvaluator (`apps/executor/src/utils/ConditionEvaluator.ts`)
Powerful condition evaluation system with comprehensive operator support.

**Supported Operators:**
- ✅ `equals` - Equality check (type coercion, case-insensitive)
- ✅ `notEquals` - Inequality check
- ✅ `greaterThan` - Numeric comparison (>)
- ✅ `lessThan` - Numeric comparison (<)
- ✅ `greaterThanOrEqual` - Numeric comparison (>=)
- ✅ `lessThanOrEqual` - Numeric comparison (<=)
- ✅ `contains` - String/Array contains check
- ✅ `notContains` - String/Array does not contain
- ✅ `isEmpty` - Check if empty (string, array, object)
- ✅ `isNotEmpty` - Check if not empty
- ✅ `startsWith` - String starts with
- ✅ `endsWith` - String ends with

**Features:**
- ✅ AND/OR combinators for multiple rules
- ✅ Expression support in field and value
- ✅ Type coercion for flexible comparisons
- ✅ Case-insensitive string matching
- ✅ Array and string contains checks
- ✅ Comprehensive error handling

**Condition Rule Structure:**
```typescript
interface IConditionRule {
  field: string;           // Field to evaluate (supports expressions)
  operator: ConditionOperator;
  value?: any;             // Value to compare (optional for isEmpty)
}
```

**Condition Group Structure:**
```typescript
interface IConditionGroup {
  output: number;          // Which output connection (0, 1, 2, etc.)
  rules: IConditionRule[];
  combinator: 'AND' | 'OR';
}
```

### 2. Condition Node Executor

#### ConditionNodeExecutor (`apps/executor/src/executors/ConditionNodeExecutor.ts`)
Evaluates conditions and routes execution to appropriate branches.

**Features:**
- ✅ Evaluates multiple condition groups in order
- ✅ Returns selected output index
- ✅ Passes through input data to next nodes
- ✅ Default output when no conditions match
- ✅ Full error handling

**Node Parameters:**
```json
{
  "conditions": [
    {
      "output": 0,
      "combinator": "AND",
      "rules": [
        {
          "field": "{{context.score}}",
          "operator": "greaterThan",
          "value": 90
        }
      ]
    },
    {
      "output": 1,
      "combinator": "OR",
      "rules": [
        {
          "field": "{{context.score}}",
          "operator": "lessThanOrEqual",
          "value": 90
        }
      ]
    }
  ],
  "defaultOutput": 0
}
```

### 3. Execution Engine Updates

#### ExecutionEngine Conditional Branching
The execution engine now intelligently handles conditional nodes:

**Key Changes:**
- ✅ Detects condition node output with `selectedOutput` property
- ✅ Routes execution to specific output branch
- ✅ Passes through original input data (not condition result)
- ✅ Supports multiple outputs per condition node
- ✅ Logs conditional routing decisions

**How It Works:**
1. Condition node evaluates and returns `{ selectedOutput: N, inputData: ... }`
2. Engine detects `selectedOutput` property
3. Engine uses `connections.main[N]` instead of `connections.main[0]`
4. Only nodes connected to output N are executed
5. Original input data flows to next nodes

### 4. Updated Factory

The `NodeExecutorFactory` now supports:
- `condition`, `if` → ConditionNodeExecutor

---

## Example Workflows

### Example 1: Simple Score-Based Branching

**Use Case:** Send different messages based on score value.

```json
{
  "name": "Score-Based Notification",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_score",
      "name": "Score Webhook",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["name", "email", "score"]
      },
      "webhookId": "score_test_123"
    },
    {
      "id": "condition_score",
      "name": "Check Score",
      "type": "condition",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "conditions": [
          {
            "output": 0,
            "combinator": "AND",
            "rules": [
              {
                "field": "{{context.score}}",
                "operator": "greaterThan",
                "value": 90
              }
            ]
          },
          {
            "output": 1,
            "combinator": "AND",
            "rules": [
              {
                "field": "{{context.score}}",
                "operator": "lessThanOrEqual",
                "value": 90
              }
            ]
          }
        ],
        "defaultOutput": 1
      }
    },
    {
      "id": "email_high",
      "name": "Congratulations Email",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [500, 50],
      "parameters": {
        "to": "{{context.email}}",
        "subject": "🎉 Excellent Score!",
        "html": "<h1>Congratulations {{context.name}}!</h1><p>Your score of <strong>{{context.score}}</strong> is outstanding!</p>"
      },
      "credentials": {
        "resend": {
          "id": "1",
          "name": "Resend Account"
        }
      }
    },
    {
      "id": "telegram_low",
      "name": "Improvement Message",
      "type": "sendTelegram",
      "typeVersion": 1,
      "position": [500, 150],
      "parameters": {
        "chatId": "{{context.telegramId}}",
        "text": "Hi {{context.name}}, your score is {{context.score}}. Keep practicing to improve!",
        "parseMode": "HTML"
      },
      "credentials": {
        "telegram": {
          "id": "1",
          "name": "Telegram Bot"
        }
      }
    }
  ],
  "connections": {
    "trigger_score": {
      "main": [
        [
          {
            "node": "condition_score",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "condition_score": {
      "main": [
        [
          {
            "node": "email_high",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "telegram_low",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

**Test Commands:**

High score (email path):
```bash
curl -X POST http://localhost:3000/webhook/handler/score_test_123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@example.com",
    "telegramId": "123456",
    "score": 95
  }'
```

Low score (telegram path):
```bash
curl -X POST http://localhost:3000/webhook/handler/score_test_123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob",
    "email": "bob@example.com",
    "telegramId": "789012",
    "score": 75
  }'
```

---

### Example 2: Complex Multi-Condition Workflow (From Design Doc)

**Use Case:** The exact complex workflow from the design document.

```json
{
  "name": "Complex Score Notification",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "webhook_trigger",
      "name": "Webhook Trigger",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["name", "email", "mobileNumber", "score"]
      },
      "webhookId": "complex_score_123"
    },
    {
      "id": "condition_block",
      "name": "Score Condition",
      "type": "condition",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "conditions": [
          {
            "output": 0,
            "combinator": "AND",
            "rules": [
              {
                "field": "{{context.score}}",
                "operator": "greaterThan",
                "value": 90
              }
            ]
          },
          {
            "output": 1,
            "combinator": "AND",
            "rules": [
              {
                "field": "{{context.score}}",
                "operator": "lessThanOrEqual",
                "value": 90
              }
            ]
          }
        ],
        "defaultOutput": 1
      }
    },
    {
      "id": "email_excellent",
      "name": "Email for High Score",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [500, 50],
      "parameters": {
        "to": "{{context.email}}",
        "subject": "Outstanding Performance!",
        "html": "<h2>Congratulations {{context.name}}!</h2><p>Your score of <strong>{{context.score}}</strong> is excellent. Well done!</p>"
      },
      "credentials": {
        "resend": {
          "id": "1",
          "name": "Resend Account"
        }
      }
    },
    {
      "id": "telegram_improvement",
      "name": "Telegram for Lower Score",
      "type": "sendTelegram",
      "typeVersion": 1,
      "position": [500, 150],
      "parameters": {
        "chatId": "{{context.mobileNumber}}",
        "text": "Hello {{context.name}}, your score is {{context.score}}. Keep working hard!",
        "parseMode": "HTML"
      },
      "credentials": {
        "telegram": {
          "id": "1",
          "name": "Telegram Bot"
        }
      }
    }
  ],
  "connections": {
    "webhook_trigger": {
      "main": [
        [
          {
            "node": "condition_block",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "condition_block": {
      "main": [
        [
          {
            "node": "email_excellent",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "telegram_improvement",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

**Test Command:**
```bash
curl -X POST http://localhost:3000/webhook/handler/complex_score_123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "mobileNumber": "123456789",
    "score": 95
  }'
```

---

### Example 3: Multiple Conditions with AND Logic

**Use Case:** Check multiple conditions (age AND status).

```json
{
  "name": "Age and Status Check",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_multi",
      "name": "User Data Trigger",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["name", "age", "status"]
      },
      "webhookId": "multi_condition_123"
    },
    {
      "id": "condition_multi",
      "name": "Check Age and Status",
      "type": "condition",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "conditions": [
          {
            "output": 0,
            "combinator": "AND",
            "rules": [
              {
                "field": "{{context.age}}",
                "operator": "greaterThanOrEqual",
                "value": 18
              },
              {
                "field": "{{context.status}}",
                "operator": "equals",
                "value": "active"
              }
            ]
          }
        ],
        "defaultOutput": 1
      }
    },
    {
      "id": "email_approved",
      "name": "Approved Email",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [500, 50],
      "parameters": {
        "to": "admin@example.com",
        "subject": "User Approved",
        "body": "User {{context.name}} meets all criteria (Age: {{context.age}}, Status: {{context.status}})"
      },
      "credentials": {
        "resend": {
          "id": "1",
          "name": "Resend Account"
        }
      }
    },
    {
      "id": "email_rejected",
      "name": "Rejected Email",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [500, 150],
      "parameters": {
        "to": "admin@example.com",
        "subject": "User Rejected",
        "body": "User {{context.name}} does not meet criteria (Age: {{context.age}}, Status: {{context.status}})"
      },
      "credentials": {
        "resend": {
          "id": "1",
          "name": "Resend Account"
        }
      }
    }
  ],
  "connections": {
    "trigger_multi": {
      "main": [
        [
          {
            "node": "condition_multi",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "condition_multi": {
      "main": [
        [
          {
            "node": "email_approved",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "email_rejected",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

### Example 4: String Contains Condition

**Use Case:** Check if email domain is allowed.

```json
{
  "name": "Email Domain Check",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_email_check",
      "name": "Email Trigger",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["name", "email"]
      },
      "webhookId": "email_check_123"
    },
    {
      "id": "condition_domain",
      "name": "Check Domain",
      "type": "condition",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "conditions": [
          {
            "output": 0,
            "combinator": "OR",
            "rules": [
              {
                "field": "{{context.email}}",
                "operator": "contains",
                "value": "@company.com"
              },
              {
                "field": "{{context.email}}",
                "operator": "contains",
                "value": "@partner.com"
              }
            ]
          }
        ],
        "defaultOutput": 1
      }
    },
    {
      "id": "telegram_allowed",
      "name": "Welcome Message",
      "type": "sendTelegram",
      "typeVersion": 1,
      "position": [500, 50],
      "parameters": {
        "chatId": "@admin_channel",
        "text": "✅ User {{context.name}} with email {{context.email}} has been approved!"
      },
      "credentials": {
        "telegram": {
          "id": "1",
          "name": "Telegram Bot"
        }
      }
    },
    {
      "id": "telegram_blocked",
      "name": "Blocked Message",
      "type": "sendTelegram",
      "typeVersion": 1,
      "position": [500, 150],
      "parameters": {
        "chatId": "@admin_channel",
        "text": "❌ User {{context.name}} with email {{context.email}} was blocked (invalid domain)"
      },
      "credentials": {
        "telegram": {
          "id": "1",
          "name": "Telegram Bot"
        }
      }
    }
  ],
  "connections": {
    "trigger_email_check": {
      "main": [
        [
          {
            "node": "condition_domain",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "condition_domain": {
      "main": [
        [
          {
            "node": "telegram_allowed",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "telegram_blocked",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## Operator Reference

### Comparison Operators

**equals**
```json
{
  "field": "{{context.status}}",
  "operator": "equals",
  "value": "active"
}
```
- Type coercion: "5" equals 5
- Case-insensitive: "ACTIVE" equals "active"

**notEquals**
```json
{
  "field": "{{context.status}}",
  "operator": "notEquals",
  "value": "inactive"
}
```

### Numeric Operators

**greaterThan**
```json
{
  "field": "{{context.score}}",
  "operator": "greaterThan",
  "value": 90
}
```

**lessThan**
```json
{
  "field": "{{context.age}}",
  "operator": "lessThan",
  "value": 18
}
```

**greaterThanOrEqual / lessThanOrEqual**
```json
{
  "field": "{{context.score}}",
  "operator": "greaterThanOrEqual",
  "value": 80
}
```

### String Operators

**contains**
```json
{
  "field": "{{context.email}}",
  "operator": "contains",
  "value": "@company.com"
}
```
- Works with strings and arrays
- Case-insensitive

**startsWith / endsWith**
```json
{
  "field": "{{context.name}}",
  "operator": "startsWith",
  "value": "Dr."
}
```

### Empty Checks

**isEmpty**
```json
{
  "field": "{{context.notes}}",
  "operator": "isEmpty"
}
```
- Checks strings, arrays, objects
- No value needed

**isNotEmpty**
```json
{
  "field": "{{context.description}}",
  "operator": "isNotEmpty"
}
```

---

## Combinators

### AND Combinator
All rules must be true:
```json
{
  "combinator": "AND",
  "rules": [
    {
      "field": "{{context.age}}",
      "operator": "greaterThan",
      "value": 18
    },
    {
      "field": "{{context.verified}}",
      "operator": "equals",
      "value": true
    }
  ]
}
```

### OR Combinator
At least one rule must be true:
```json
{
  "combinator": "OR",
  "rules": [
    {
      "field": "{{context.role}}",
      "operator": "equals",
      "value": "admin"
    },
    {
      "field": "{{context.role}}",
      "operator": "equals",
      "value": "moderator"
    }
  ]
}
```

---

## File Structure

```
apps/executor/src/
├── executors/
│   ├── BaseNodeExecutor.ts           # Base class ✅
│   ├── TriggerNodeExecutor.ts        # Webhook trigger ✅
│   ├── HttpRequestNodeExecutor.ts    # HTTP requests ✅
│   ├── EmailNodeExecutor.ts          # Email sending ✅
│   ├── TelegramNodeExecutor.ts       # Telegram messages ✅
│   ├── ConditionNodeExecutor.ts      # Conditional logic ✅ NEW
│   └── NodeExecutorFactory.ts        # Factory (updated) ✅
├── utils/
│   ├── ExpressionResolver.ts         # Expression resolution ✅
│   └── ConditionEvaluator.ts         # Condition evaluation ✅ NEW
└── engine/
    └── ExecutionEngine.ts            # Updated for branching ✅
```

---

## v0 Feature Complete! 🎉

With Phase 4, all v0 requirements are now implemented:

### ✅ Trigger Node
- Webhook trigger with context data
- Expected keys validation

### ✅ HTTP Request Node
- All HTTP methods
- Dynamic parameters
- Authentication support

### ✅ Email Node
- Resend API integration
- HTML/plain text
- Multiple recipients

### ✅ Telegram Node
- Telegram Bot API integration
- Formatted messages
- Dynamic content

### ✅ Condition Block
- Multiple operators
- AND/OR logic
- Conditional branching
- Expression support

### ✅ Simple Workflow (Design Doc)
```
Trigger (no context) 
  → HTTP Request 
    → Email (parallel)
    → Telegram (parallel)
```

### ✅ Complex Workflow (Design Doc)
```
Webhook Trigger (context: name, email, mobileNumber, score)
  → Condition Block (check score)
    → If score > 90: Email
    → If score <= 90: Telegram
```

---

## Testing Conditional Workflows

### Debug Logging
The engine logs conditional decisions:
```
[condition:Check Score] Evaluating conditions
Conditional node: following output 0
[sendEmail:Congratulations Email] Sending email
```

### Test Different Paths
```bash
# Test high score path (output 0 - email)
curl -X POST http://localhost:3000/webhook/handler/score_test_123 \
  -d '{"name": "Test", "email": "test@example.com", "score": 95}'

# Test low score path (output 1 - telegram)
curl -X POST http://localhost:3000/webhook/handler/score_test_123 \
  -d '{"name": "Test", "telegramId": "123", "score": 75}'
```

### Check Execution Records
```bash
curl http://localhost:3000/executions/EXECUTION_ID
```

Look for the condition node execution:
```json
{
  "nodeId": "condition_score",
  "status": "SUCCESS",
  "output": {
    "selectedOutput": 0,
    "matched": true,
    "inputData": {...}
  }
}
```

---

## Known Limitations

1. **Single Level Conditions:**
   - No nested condition groups
   - Can be added in v1 if needed

2. **Fixed Outputs:**
   - Output indices must be sequential (0, 1, 2, ...)
   - Cannot skip indices

3. **No Dynamic Operators:**
   - Operators are predefined
   - Custom operators not supported (yet)

---

## Next Steps (v1 Planning)

### Planned v1 Features:
1. **AI Agent Nodes** - Integration with LLM APIs
2. **Node Convergence** - Wait for multiple parent nodes
3. **Waiting for Response** - Pause/resume execution
4. **Advanced Conditions** - Nested groups, custom operators
5. **Retry Logic** - Implement retryOnFail properly
6. **Execution Queue** - Better handling of high volume

---

## Conclusion

Phase 4 successfully completes the v0 implementation! The workflow automation platform now supports:

✅ Webhook triggers with context data  
✅ HTTP requests with dynamic parameters  
✅ Email notifications via Resend  
✅ Telegram messages via Bot API  
✅ Conditional branching with 12 operators  
✅ AND/OR logic for complex conditions  
✅ Expression resolution throughout  
✅ Parallel execution  
✅ Error handling and logging  

The system is ready for production use with basic to intermediate workflow automation needs! 🚀

