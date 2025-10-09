# Phase 4: Conditional Workflow Examples

This document provides ready-to-use workflow examples with conditional logic.

---

## Example 1: Simple Score-Based Routing (From Design Doc)

**Description:** Route to email or telegram based on score value.

**Workflow JSON:**
```json
{
  "name": "Score-Based Notification",
  "status": "ACTIVE",
  "userId": "user123",
  "nodes": [
    {
      "id": "trigger_001",
      "name": "Score Webhook",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["name", "email", "telegramId", "score"]
      },
      "webhookId": "score_webhook_v1"
    },
    {
      "id": "condition_001",
      "name": "Check Score",
      "type": "condition",
      "typeVersion": 1,
      "position": [350, 100],
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
      "id": "email_001",
      "name": "High Score Email",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [600, 50],
      "continueOnFail": false,
      "parameters": {
        "to": "{{context.email}}",
        "subject": "🎉 Excellent Score!",
        "html": "<h1>Congratulations {{context.name}}!</h1><p>Your score of <strong>{{context.score}}</strong> is outstanding! You scored above 90.</p><p>Keep up the excellent work!</p>"
      },
      "credentials": {
        "resend": {
          "id": "1",
          "name": "My Resend Account"
        }
      }
    },
    {
      "id": "telegram_001",
      "name": "Lower Score Telegram",
      "type": "sendTelegram",
      "typeVersion": 1,
      "position": [600, 150],
      "continueOnFail": false,
      "parameters": {
        "chatId": "{{context.telegramId}}",
        "text": "Hi <b>{{context.name}}</b>! 📊\n\nYour score: <code>{{context.score}}</code>\n\nKeep practicing to reach above 90!",
        "parseMode": "HTML"
      },
      "credentials": {
        "telegram": {
          "id": "1",
          "name": "My Telegram Bot"
        }
      }
    }
  ],
  "connections": {
    "trigger_001": {
      "main": [
        [
          {
            "node": "condition_001",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "condition_001": {
      "main": [
        [
          {
            "node": "email_001",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "telegram_001",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

**Setup:**
```sql
INSERT INTO webhooks (id, method, "headersToMatch", "workflowId", "nodeId", "createdAt", "updatedAt")
VALUES ('score_webhook_v1', 'POST', '{}', 1, 'trigger_001', NOW(), NOW());
```

**Test - High Score (Email Path):**
```bash
curl -X POST http://localhost:3000/webhook/handler/score_webhook_v1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "telegramId": "123456789",
    "score": 95
  }'
```

**Test - Low Score (Telegram Path):**
```bash
curl -X POST http://localhost:3000/webhook/handler/score_webhook_v1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Smith",
    "email": "bob@example.com",
    "telegramId": "987654321",
    "score": 75
  }'
```

---

## Example 2: HTTP → Condition → Parallel Communications

**Description:** Fetch user data, check status, send different notifications.

**Workflow JSON:**
```json
{
  "name": "User Status Checker",
  "status": "ACTIVE",
  "userId": "user123",
  "nodes": [
    {
      "id": "trigger_002",
      "name": "Webhook",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["userId"]
      },
      "webhookId": "user_status_webhook"
    },
    {
      "id": "http_002",
      "name": "Fetch User",
      "type": "httpRequest",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "url": "https://jsonplaceholder.typicode.com/users/{{context.userId}}",
        "method": "GET"
      }
    },
    {
      "id": "condition_002",
      "name": "Check User ID",
      "type": "condition",
      "typeVersion": 1,
      "position": [550, 100],
      "parameters": {
        "conditions": [
          {
            "output": 0,
            "combinator": "AND",
            "rules": [
              {
                "field": "{{$node.http_002.body.id}}",
                "operator": "lessThanOrEqual",
                "value": 5
              }
            ]
          }
        ],
        "defaultOutput": 1
      }
    },
    {
      "id": "email_002",
      "name": "VIP Email",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [800, 50],
      "parameters": {
        "to": "admin@example.com",
        "subject": "VIP User: {{$node.http_002.body.name}}",
        "html": "<h2>VIP User Detected</h2><ul><li>Name: {{$node.http_002.body.name}}</li><li>Email: {{$node.http_002.body.email}}</li><li>Phone: {{$node.http_002.body.phone}}</li></ul>"
      },
      "credentials": {
        "resend": {
          "id": "1",
          "name": "Resend Account"
        }
      }
    },
    {
      "id": "telegram_002",
      "name": "Regular User Alert",
      "type": "sendTelegram",
      "typeVersion": 1,
      "position": [800, 150],
      "parameters": {
        "chatId": "@monitoring",
        "text": "Regular user {{$node.http_002.body.name}} (ID: {{$node.http_002.body.id}}) accessed the system."
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
    "trigger_002": {
      "main": [
        [
          {
            "node": "http_002",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "http_002": {
      "main": [
        [
          {
            "node": "condition_002",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "condition_002": {
      "main": [
        [
          {
            "node": "email_002",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "telegram_002",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

**Test:**
```bash
# VIP user (ID 1-5)
curl -X POST http://localhost:3000/webhook/handler/user_status_webhook \
  -H "Content-Type: application/json" \
  -d '{"userId": "1"}'

# Regular user (ID > 5)
curl -X POST http://localhost:3000/webhook/handler/user_status_webhook \
  -H "Content-Type: application/json" \
  -d '{"userId": "7"}'
```

---

## Example 3: Multi-Rule AND Condition

**Description:** Check both age and email domain before approval.

**Workflow JSON:**
```json
{
  "name": "User Approval Workflow",
  "status": "ACTIVE",
  "userId": "user123",
  "nodes": [
    {
      "id": "trigger_003",
      "name": "Registration Webhook",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["name", "email", "age"]
      },
      "webhookId": "approval_webhook"
    },
    {
      "id": "condition_003",
      "name": "Approval Check",
      "type": "condition",
      "typeVersion": 1,
      "position": [350, 100],
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
                "field": "{{context.email}}",
                "operator": "contains",
                "value": "@company.com"
              }
            ]
          }
        ],
        "defaultOutput": 1
      }
    },
    {
      "id": "email_approved",
      "name": "Approval Email",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [600, 50],
      "parameters": {
        "to": "{{context.email}}",
        "subject": "✅ Registration Approved",
        "html": "<h1>Welcome {{context.name}}!</h1><p>Your registration has been approved.</p>"
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
      "name": "Rejection Email",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [600, 150],
      "parameters": {
        "to": "admin@example.com",
        "subject": "❌ Registration Rejected",
        "body": "User {{context.name}} ({{context.email}}) was rejected. Age: {{context.age}}"
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
    "trigger_003": {
      "main": [
        [
          {
            "node": "condition_003",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "condition_003": {
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

**Test - Approved:**
```bash
curl -X POST http://localhost:3000/webhook/handler/approval_webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@company.com",
    "age": 25
  }'
```

**Test - Rejected (age):**
```bash
curl -X POST http://localhost:3000/webhook/handler/approval_webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob",
    "email": "bob@company.com",
    "age": 16
  }'
```

**Test - Rejected (domain):**
```bash
curl -X POST http://localhost:3000/webhook/handler/approval_webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie",
    "email": "charlie@gmail.com",
    "age": 25
  }'
```

---

## Example 4: Three-Way Branch

**Description:** Route to different actions based on priority level.

**Workflow JSON:**
```json
{
  "name": "Priority-Based Routing",
  "status": "ACTIVE",
  "userId": "user123",
  "nodes": [
    {
      "id": "trigger_004",
      "name": "Issue Webhook",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["title", "priority", "assignee"]
      },
      "webhookId": "priority_webhook"
    },
    {
      "id": "condition_004",
      "name": "Priority Check",
      "type": "condition",
      "typeVersion": 1,
      "position": [350, 100],
      "parameters": {
        "conditions": [
          {
            "output": 0,
            "combinator": "AND",
            "rules": [
              {
                "field": "{{context.priority}}",
                "operator": "equals",
                "value": "high"
              }
            ]
          },
          {
            "output": 1,
            "combinator": "AND",
            "rules": [
              {
                "field": "{{context.priority}}",
                "operator": "equals",
                "value": "medium"
              }
            ]
          }
        ],
        "defaultOutput": 2
      }
    },
    {
      "id": "telegram_high",
      "name": "Urgent Alert",
      "type": "sendTelegram",
      "typeVersion": 1,
      "position": [600, 25],
      "parameters": {
        "chatId": "@urgent_alerts",
        "text": "🚨 <b>HIGH PRIORITY</b> 🚨\n\n<b>{{context.title}}</b>\nAssigned to: {{context.assignee}}",
        "parseMode": "HTML"
      },
      "credentials": {
        "telegram": {
          "id": "1",
          "name": "Telegram Bot"
        }
      }
    },
    {
      "id": "email_medium",
      "name": "Medium Priority Email",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [600, 100],
      "parameters": {
        "to": "team@example.com",
        "subject": "Medium Priority: {{context.title}}",
        "body": "Issue assigned to {{context.assignee}}"
      },
      "credentials": {
        "resend": {
          "id": "1",
          "name": "Resend Account"
        }
      }
    },
    {
      "id": "http_low",
      "name": "Log Low Priority",
      "type": "httpRequest",
      "typeVersion": 1,
      "position": [600, 175],
      "parameters": {
        "url": "https://webhook.site/your-unique-url",
        "method": "POST",
        "body": {
          "title": "{{context.title}}",
          "priority": "low",
          "assignee": "{{context.assignee}}"
        }
      }
    }
  ],
  "connections": {
    "trigger_004": {
      "main": [
        [
          {
            "node": "condition_004",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "condition_004": {
      "main": [
        [
          {
            "node": "telegram_high",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "email_medium",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "http_low",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

**Test - High Priority:**
```bash
curl -X POST http://localhost:3000/webhook/handler/priority_webhook \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Server Down",
    "priority": "high",
    "assignee": "DevOps Team"
  }'
```

**Test - Medium Priority:**
```bash
curl -X POST http://localhost:3000/webhook/handler/priority_webhook \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bug in UI",
    "priority": "medium",
    "assignee": "Frontend Team"
  }'
```

**Test - Low Priority (default):**
```bash
curl -X POST http://localhost:3000/webhook/handler/priority_webhook \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Feature Request",
    "priority": "low",
    "assignee": "Product Team"
  }'
```

---

## Example 5: OR Condition with Multiple Rules

**Description:** Allow multiple admin email domains.

**Workflow JSON:**
```json
{
  "name": "Admin Access Control",
  "status": "ACTIVE",
  "userId": "user123",
  "nodes": [
    {
      "id": "trigger_005",
      "name": "Access Request",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["name", "email", "action"]
      },
      "webhookId": "access_webhook"
    },
    {
      "id": "condition_005",
      "name": "Admin Check",
      "type": "condition",
      "typeVersion": 1,
      "position": [350, 100],
      "parameters": {
        "conditions": [
          {
            "output": 0,
            "combinator": "OR",
            "rules": [
              {
                "field": "{{context.email}}",
                "operator": "endsWith",
                "value": "@admin.com"
              },
              {
                "field": "{{context.email}}",
                "operator": "endsWith",
                "value": "@company.com"
              },
              {
                "field": "{{context.email}}",
                "operator": "equals",
                "value": "superadmin@external.com"
              }
            ]
          }
        ],
        "defaultOutput": 1
      }
    },
    {
      "id": "telegram_granted",
      "name": "Access Granted",
      "type": "sendTelegram",
      "typeVersion": 1,
      "position": [600, 50],
      "parameters": {
        "chatId": "@admin_logs",
        "text": "✅ <b>Access Granted</b>\n\nUser: {{context.name}}\nEmail: {{context.email}}\nAction: {{context.action}}",
        "parseMode": "HTML"
      },
      "credentials": {
        "telegram": {
          "id": "1",
          "name": "Telegram Bot"
        }
      }
    },
    {
      "id": "telegram_denied",
      "name": "Access Denied",
      "type": "sendTelegram",
      "typeVersion": 1,
      "position": [600, 150],
      "parameters": {
        "chatId": "@security_alerts",
        "text": "🚫 <b>Access Denied</b>\n\nUser: {{context.name}}\nEmail: {{context.email}}\nAttempted: {{context.action}}",
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
    "trigger_005": {
      "main": [
        [
          {
            "node": "condition_005",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "condition_005": {
      "main": [
        [
          {
            "node": "telegram_granted",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "telegram_denied",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

**Test - Granted:**
```bash
curl -X POST http://localhost:3000/webhook/handler/access_webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@company.com",
    "action": "delete_user"
  }'
```

**Test - Denied:**
```bash
curl -X POST http://localhost:3000/webhook/handler/access_webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Regular User",
    "email": "user@external.com",
    "action": "delete_user"
  }'
```

---

## Quick Setup Guide

### 1. Create Workflow
Use the workflow API to create one of the above workflows.

### 2. Create Webhook Entry
```sql
INSERT INTO webhooks (id, method, "headersToMatch", "workflowId", "nodeId", "createdAt", "updatedAt")
VALUES ('your_webhook_id', 'POST', '{}', 1, 'trigger_node_id', NOW(), NOW());
```

### 3. Set Up Credentials
Ensure your Resend and Telegram credentials are in the database (see PHASE3_SUMMARY.md).

### 4. Test
Use the provided curl commands to test different paths through your conditional workflow.

### 5. Monitor
Check execution logs:
```bash
curl http://localhost:3000/executions/EXECUTION_ID
```

Look for condition evaluation in the logs:
```
[condition:Check Score] Evaluating conditions
Conditional node: following output 0
```

---

## Debugging Tips

1. **Check Condition Output:**
   - Look for `selectedOutput` in execution record
   - Verify correct branch was taken

2. **Test Each Path:**
   - Try different input values to trigger each condition
   - Ensure all branches work correctly

3. **Verify Expressions:**
   - Check that field expressions resolve correctly
   - Test with simple hardcoded values first

4. **Check Operators:**
   - Verify operator types match data types
   - Use string operators for strings, numeric for numbers

5. **Monitor Logs:**
   - Engine logs which output is selected
   - Node executors log their actions

---

## Common Patterns

### Age/Score Threshold
```json
{
  "field": "{{context.age}}",
  "operator": "greaterThanOrEqual",
  "value": 18
}
```

### Email Domain Check
```json
{
  "field": "{{context.email}}",
  "operator": "contains",
  "value": "@company.com"
}
```

### Status Check
```json
{
  "field": "{{context.status}}",
  "operator": "equals",
  "value": "active"
}
```

### Multiple Allowed Values (OR)
```json
{
  "combinator": "OR",
  "rules": [
    {"field": "{{context.role}}", "operator": "equals", "value": "admin"},
    {"field": "{{context.role}}", "operator": "equals", "value": "moderator"}
  ]
}
```

### Both Conditions Required (AND)
```json
{
  "combinator": "AND",
  "rules": [
    {"field": "{{context.verified}}", "operator": "equals", "value": true},
    {"field": "{{context.age}}", "operator": "greaterThan", "value": 18}
  ]
}
```

---

## Next Steps

Try creating your own conditional workflows by:
1. Starting with simple single-condition examples
2. Adding multiple rules with AND/OR
3. Creating three-way branches
4. Combining with HTTP requests and communication nodes
5. Testing all execution paths thoroughly

Congratulations on completing the v0 implementation! 🎉

