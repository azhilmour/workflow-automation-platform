# Example Workflow Configurations

This document provides example workflow configurations that can be used with the executor service.

## Example 1: Simple HTTP GET Request

**Use Case:** Fetch data from an external API when webhook is triggered.

```json
{
  "name": "Fetch User Data",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_001",
      "name": "Webhook Trigger",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {},
      "webhookId": "abc123"
    },
    {
      "id": "http_001",
      "name": "Get User",
      "type": "httpRequest",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "url": "https://jsonplaceholder.typicode.com/users/1",
        "method": "GET"
      }
    }
  ],
  "connections": {
    "trigger_001": {
      "main": [
        [
          {
            "node": "http_001",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

**Trigger:**
```bash
curl -X POST http://localhost:3000/webhook/handler/abc123 \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Example 2: Dynamic HTTP Request with Context Data

**Use Case:** Create a user in external system using data from webhook.

```json
{
  "name": "Create User",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_002",
      "name": "User Registration Webhook",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["email", "name", "phone"]
      },
      "webhookId": "def456"
    },
    {
      "id": "http_002",
      "name": "Create User API Call",
      "type": "httpRequest",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "url": "https://jsonplaceholder.typicode.com/users",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "X-API-Key": "demo-key"
        },
        "body": {
          "name": "{{context.name}}",
          "email": "{{context.email}}",
          "phone": "{{context.phone}}",
          "username": "{{context.email}}"
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
    }
  }
}
```

**Trigger:**
```bash
curl -X POST http://localhost:3000/webhook/handler/def456 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe",
    "phone": "+1234567890"
  }'
```

---

## Example 3: Chained HTTP Requests

**Use Case:** Fetch user data, then fetch their posts.

```json
{
  "name": "User and Posts",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_003",
      "name": "Webhook",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["userId"]
      },
      "webhookId": "ghi789"
    },
    {
      "id": "http_003",
      "name": "Get User",
      "type": "httpRequest",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "url": "https://jsonplaceholder.typicode.com/users/{{context.userId}}",
        "method": "GET"
      }
    },
    {
      "id": "http_004",
      "name": "Get User Posts",
      "type": "httpRequest",
      "typeVersion": 1,
      "position": [500, 100],
      "parameters": {
        "url": "https://jsonplaceholder.typicode.com/posts?userId={{context.userId}}",
        "method": "GET"
      }
    }
  ],
  "connections": {
    "trigger_003": {
      "main": [
        [
          {
            "node": "http_003",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "http_003": {
      "main": [
        [
          {
            "node": "http_004",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

**Trigger:**
```bash
curl -X POST http://localhost:3000/webhook/handler/ghi789 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "1"
  }'
```

---

## Example 4: Parallel HTTP Requests

**Use Case:** Trigger multiple API calls simultaneously.

```json
{
  "name": "Parallel API Calls",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_004",
      "name": "Webhook",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {},
      "webhookId": "jkl012"
    },
    {
      "id": "http_005",
      "name": "Get Users",
      "type": "httpRequest",
      "typeVersion": 1,
      "position": [300, 50],
      "parameters": {
        "url": "https://jsonplaceholder.typicode.com/users",
        "method": "GET"
      }
    },
    {
      "id": "http_006",
      "name": "Get Posts",
      "type": "httpRequest",
      "typeVersion": 1,
      "position": [300, 150],
      "parameters": {
        "url": "https://jsonplaceholder.typicode.com/posts",
        "method": "GET"
      }
    }
  ],
  "connections": {
    "trigger_004": {
      "main": [
        [
          {
            "node": "http_005",
            "type": "main",
            "index": 0
          },
          {
            "node": "http_006",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

**Trigger:**
```bash
curl -X POST http://localhost:3000/webhook/handler/jkl012 \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Note:** Both HTTP requests will execute in parallel.

---

## Example 5: HTTP Request with Authentication

**Use Case:** Call authenticated API with Bearer token.

```json
{
  "name": "Authenticated Request",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_005",
      "name": "Webhook",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {},
      "webhookId": "mno345"
    },
    {
      "id": "http_007",
      "name": "Protected API Call",
      "type": "httpRequest",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "url": "https://api.example.com/protected/resource",
        "method": "GET",
        "authentication": {
          "type": "bearer",
          "token": "your-auth-token-here"
        }
      }
    }
  ],
  "connections": {
    "trigger_005": {
      "main": [
        [
          {
            "node": "http_007",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

**Trigger:**
```bash
curl -X POST http://localhost:3000/webhook/handler/mno345 \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Expression Reference

### Access Trigger Data
```
{{context.fieldName}}
{{$trigger.body.fieldName}}
{{$trigger.body.nested.field}}
```

### Access Previous Node Output
```
{{$node.nodeId.fieldName}}
{{$node.http_001.body.id}}
{{$node.http_001.statusCode}}
```

### Access Input from Previous Node
```
{{$json.fieldName}}
{{$json.data.id}}
```

---

## Testing Workflows

### 1. Create Workflow
Use the workflow API (from your CRUD service) to create a workflow with the above configurations.

### 2. Create Webhook
Create a webhook entry in the database:
```sql
INSERT INTO webhooks (id, method, "headersToMatch", "workflowId", "nodeId")
VALUES ('abc123', 'POST', '{}', 1, 'trigger_001');
```

### 3. Trigger Workflow
```bash
curl -X POST http://localhost:3000/webhook/handler/abc123 \
  -H "Content-Type: application/json" \
  -d '{"your": "data"}'
```

### 4. Check Execution
```bash
# Get execution details
curl http://localhost:3000/executions/EXECUTION_ID

# List workflow executions
curl http://localhost:3000/executions/workflow/1
```

---

## Tips

1. **Use JSONPlaceholder for testing**: It's a free fake API perfect for testing workflows
2. **Check logs**: The executor service logs detailed information about each node execution
3. **Test expressions**: Start with simple expressions and gradually add complexity
4. **Error handling**: Use `continueOnFail: true` on nodes to continue execution even if they fail
5. **Parallel execution**: Multiple nodes connected to the same node will execute in parallel

