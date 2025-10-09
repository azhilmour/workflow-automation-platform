# Phase 3: Communication Workflows Examples

This document provides ready-to-use workflow examples for testing email and Telegram nodes.

---

## Example 1: Simple Email Workflow

**File:** `simple-email-workflow.json`

```json
{
  "name": "Simple Email Notification",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_email_1",
      "name": "Email Trigger",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["email", "name", "subject", "message"]
      },
      "webhookId": "email_test_123"
    },
    {
      "id": "email_node_1",
      "name": "Send Email",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [300, 100],
      "continueOnFail": false,
      "parameters": {
        "to": "{{context.email}}",
        "subject": "{{context.subject}}",
        "body": "Hello {{context.name}},\n\n{{context.message}}\n\nBest regards,\nWorkflow System"
      },
      "credentials": {
        "resend": {
          "id": "1",
          "name": "My Resend Account"
        }
      }
    }
  ],
  "connections": {
    "trigger_email_1": {
      "main": [
        [
          {
            "node": "email_node_1",
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
curl -X POST http://localhost:3000/webhook/handler/email_test_123 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "name": "John Doe",
    "subject": "Test Email from Workflow",
    "message": "This is a test message from the workflow automation system!"
  }'
```

---

## Example 2: Simple Telegram Workflow

**File:** `simple-telegram-workflow.json`

```json
{
  "name": "Simple Telegram Message",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_telegram_1",
      "name": "Telegram Trigger",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["chatId", "name", "message"]
      },
      "webhookId": "telegram_test_123"
    },
    {
      "id": "telegram_node_1",
      "name": "Send Telegram Message",
      "type": "sendTelegram",
      "typeVersion": 1,
      "position": [300, 100],
      "continueOnFail": false,
      "parameters": {
        "chatId": "{{context.chatId}}",
        "text": "🤖 Hello {{context.name}}!\n\n{{context.message}}",
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
    "trigger_telegram_1": {
      "main": [
        [
          {
            "node": "telegram_node_1",
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
curl -X POST http://localhost:3000/webhook/handler/telegram_test_123 \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "YOUR_TELEGRAM_CHAT_ID",
    "name": "Jane Smith",
    "message": "This is a test from workflow automation!"
  }'
```

---

## Example 3: HTTP → Email + Telegram (Parallel)

**File:** `parallel-communication-workflow.json`

```json
{
  "name": "Parallel Email and Telegram",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_parallel_1",
      "name": "Webhook Trigger",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {},
      "webhookId": "parallel_test_123"
    },
    {
      "id": "http_fetch_1",
      "name": "Fetch User Data",
      "type": "httpRequest",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "url": "https://jsonplaceholder.typicode.com/users/1",
        "method": "GET"
      }
    },
    {
      "id": "email_notify_1",
      "name": "Email Notification",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [500, 50],
      "continueOnFail": true,
      "parameters": {
        "to": "admin@example.com",
        "subject": "User Data Fetched: {{$node.http_fetch_1.body.name}}",
        "html": "<h2>User Information</h2><ul><li><strong>Name:</strong> {{$node.http_fetch_1.body.name}}</li><li><strong>Email:</strong> {{$node.http_fetch_1.body.email}}</li><li><strong>Phone:</strong> {{$node.http_fetch_1.body.phone}}</li><li><strong>Website:</strong> {{$node.http_fetch_1.body.website}}</li></ul>"
      },
      "credentials": {
        "resend": {
          "id": "1",
          "name": "My Resend Account"
        }
      }
    },
    {
      "id": "telegram_notify_1",
      "name": "Telegram Notification",
      "type": "sendTelegram",
      "typeVersion": 1,
      "position": [500, 150],
      "continueOnFail": true,
      "parameters": {
        "chatId": "@your_channel",
        "text": "📊 <b>New User Data Fetched</b>\n\n👤 Name: {{$node.http_fetch_1.body.name}}\n📧 Email: {{$node.http_fetch_1.body.email}}\n📱 Phone: {{$node.http_fetch_1.body.phone}}",
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
    "trigger_parallel_1": {
      "main": [
        [
          {
            "node": "http_fetch_1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "http_fetch_1": {
      "main": [
        [
          {
            "node": "email_notify_1",
            "type": "main",
            "index": 0
          },
          {
            "node": "telegram_notify_1",
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
curl -X POST http://localhost:3000/webhook/handler/parallel_test_123 \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Note:** This workflow will:
1. Fetch user data from JSONPlaceholder API
2. Send both email AND telegram message simultaneously with the user data
3. Both communication nodes execute in parallel

---

## Example 4: HTML Email with Rich Formatting

**File:** `rich-email-workflow.json`

```json
{
  "name": "Rich HTML Email",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_rich_email",
      "name": "Rich Email Trigger",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["email", "name", "score"]
      },
      "webhookId": "rich_email_123"
    },
    {
      "id": "email_rich",
      "name": "Send Rich Email",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "to": "{{context.email}}",
        "subject": "🎉 Congratulations {{context.name}}!",
        "html": "<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;background-color:#f4f4f4;padding:20px}.container{background-color:white;padding:30px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}.header{color:#4CAF50;text-align:center}.score{font-size:48px;color:#4CAF50;font-weight:bold;text-align:center;margin:20px 0}.footer{color:#888;font-size:12px;text-align:center;margin-top:30px}</style></head><body><div class='container'><h1 class='header'>🎉 Congratulations!</h1><p>Dear <strong>{{context.name}}</strong>,</p><p>We are pleased to inform you that your score is:</p><div class='score'>{{context.score}}</div><p>This is an excellent achievement! Keep up the great work.</p><div class='footer'>This is an automated message from Workflow Automation Platform</div></div></body></html>",
        "replyTo": "support@example.com"
      },
      "credentials": {
        "resend": {
          "id": "1",
          "name": "My Resend Account"
        }
      }
    }
  ],
  "connections": {
    "trigger_rich_email": {
      "main": [
        [
          {
            "node": "email_rich",
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
curl -X POST http://localhost:3000/webhook/handler/rich_email_123 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "Alice Johnson",
    "score": 95
  }'
```

---

## Example 5: Telegram with Markdown Formatting

**File:** `formatted-telegram-workflow.json`

```json
{
  "name": "Formatted Telegram Message",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_formatted_tg",
      "name": "Formatted Telegram Trigger",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["chatId", "title", "description", "status"]
      },
      "webhookId": "formatted_tg_123"
    },
    {
      "id": "telegram_formatted",
      "name": "Send Formatted Message",
      "type": "sendTelegram",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "chatId": "{{context.chatId}}",
        "text": "🔔 <b>{{context.title}}</b>\n\n<i>{{context.description}}</i>\n\n<code>Status: {{context.status}}</code>\n\n✅ Message sent from Workflow Automation",
        "parseMode": "HTML",
        "disableWebPagePreview": true
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
    "trigger_formatted_tg": {
      "main": [
        [
          {
            "node": "telegram_formatted",
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
curl -X POST http://localhost:3000/webhook/handler/formatted_tg_123 \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "YOUR_CHAT_ID",
    "title": "System Alert",
    "description": "A new event has been detected in the system",
    "status": "ACTIVE"
  }'
```

---

## Example 6: Multi-Recipient Email

**File:** `multi-recipient-email-workflow.json`

```json
{
  "name": "Multi-Recipient Email",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_multi_email",
      "name": "Multi Email Trigger",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["recipients", "subject", "message"]
      },
      "webhookId": "multi_email_123"
    },
    {
      "id": "email_multi",
      "name": "Send to Multiple Recipients",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "to": "{{context.recipients}}",
        "subject": "{{context.subject}}",
        "body": "{{context.message}}",
        "cc": ["manager@example.com"],
        "bcc": ["archive@example.com"]
      },
      "credentials": {
        "resend": {
          "id": "1",
          "name": "My Resend Account"
        }
      }
    }
  ],
  "connections": {
    "trigger_multi_email": {
      "main": [
        [
          {
            "node": "email_multi",
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
curl -X POST http://localhost:3000/webhook/handler/multi_email_123 \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["user1@example.com", "user2@example.com"],
    "subject": "Team Update",
    "message": "Hello team,\n\nThis is an important update for everyone.\n\nThank you!"
  }'
```

---

## Setting Up Test Environment

### 1. Create Webhook Entries

For each example, create a webhook entry in your database:

```sql
-- Simple Email Workflow
INSERT INTO webhooks (id, method, "headersToMatch", "workflowId", "nodeId", "createdAt", "updatedAt")
VALUES ('email_test_123', 'POST', '{}', 1, 'trigger_email_1', NOW(), NOW());

-- Simple Telegram Workflow
INSERT INTO webhooks (id, method, "headersToMatch", "workflowId", "nodeId", "createdAt", "updatedAt")
VALUES ('telegram_test_123', 'POST', '{}', 2, 'trigger_telegram_1', NOW(), NOW());

-- Parallel Communication Workflow
INSERT INTO webhooks (id, method, "headersToMatch", "workflowId", "nodeId", "createdAt", "updatedAt")
VALUES ('parallel_test_123', 'POST', '{}', 3, 'trigger_parallel_1', NOW(), NOW());

-- Rich Email Workflow
INSERT INTO webhooks (id, method, "headersToMatch", "workflowId", "nodeId", "createdAt", "updatedAt")
VALUES ('rich_email_123', 'POST', '{}', 4, 'trigger_rich_email', NOW(), NOW());

-- Formatted Telegram Workflow
INSERT INTO webhooks (id, method, "headersToMatch", "workflowId", "nodeId", "createdAt", "updatedAt")
VALUES ('formatted_tg_123', 'POST', '{}', 5, 'trigger_formatted_tg', NOW(), NOW());

-- Multi-Recipient Email Workflow
INSERT INTO webhooks (id, method, "headersToMatch", "workflowId", "nodeId", "createdAt", "updatedAt")
VALUES ('multi_email_123', 'POST', '{}', 6, 'trigger_multi_email', NOW(), NOW());
```

### 2. Set Up Credentials

Refer to PHASE3_SUMMARY.md for detailed credential setup instructions.

---

## Debugging Tips

1. **Check Logs:**
```bash
# Logs show node execution details
# Look for: [sendEmail:Node Name] or [sendTelegram:Node Name]
```

2. **Check Execution Record:**
```bash
curl http://localhost:3000/executions/EXECUTION_ID
```

3. **Common Issues:**
   - **Invalid Resend API Key:** Check credentials in database
   - **Invalid Telegram Bot Token:** Verify bot token with BotFather
   - **Invalid Chat ID:** Use /getUpdates to find correct chat ID
   - **Missing Credentials:** Ensure credential ID matches in node config

4. **Test Credentials:**
```bash
# Test Resend API
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your-email@example.com",
    "subject": "Test",
    "text": "Test message"
  }'

# Test Telegram Bot
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getMe"
```

---

## Next Steps

After testing these workflows:
1. Try combining multiple nodes in different orders
2. Experiment with complex expressions
3. Test error handling with invalid credentials
4. Move on to Phase 4 for conditional logic

