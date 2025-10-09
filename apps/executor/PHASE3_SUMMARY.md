# Phase 3 Implementation Summary

## Overview
Phase 3 successfully implements communication nodes for sending emails and Telegram messages. The system now supports external communication as part of workflow automation, enabling powerful notification and messaging workflows.

## Completed Components

### 1. Email Node Executor

#### EmailNodeExecutor (`apps/executor/src/executors/EmailNodeExecutor.ts`)
Sends emails via the Resend API with full feature support.

**Features:**
- ✅ Send HTML and plain text emails
- ✅ Multiple recipients (to, cc, bcc)
- ✅ Custom from address
- ✅ Reply-to address
- ✅ Dynamic content with expressions
- ✅ Resend API integration
- ✅ Error handling with continueOnFail

**Required Parameters:**
- `to`: Email address(es) - string or array
- `subject`: Email subject line
- `body`: Plain text body (or `html` for HTML emails)

**Optional Parameters:**
- `from`: Sender email (defaults to credential default or noreply@example.com)
- `html`: HTML email body (takes precedence over `body`)
- `replyTo`: Reply-to email address
- `cc`: CC recipients
- `bcc`: BCC recipients

**Credentials Required:**
```json
{
  "apiKey": "re_xxxxxxxxxxxx",
  "defaultFrom": "noreply@yourdomain.com"  // Optional
}
```

**Example Node Configuration:**
```json
{
  "id": "email_001",
  "name": "Send Welcome Email",
  "type": "sendEmail",
  "parameters": {
    "to": "{{context.email}}",
    "subject": "Welcome, {{context.name}}!",
    "html": "<h1>Welcome!</h1><p>Hello {{context.name}}, thanks for signing up!</p>",
    "replyTo": "support@example.com"
  },
  "credentials": {
    "resend": {
      "id": "1",
      "name": "My Resend Account"
    }
  }
}
```

**Response Format:**
```json
{
  "id": "email_message_id",
  "to": ["user@example.com"],
  "from": "noreply@yourdomain.com",
  "subject": "Welcome!",
  "status": "sent"
}
```

### 2. Telegram Node Executor

#### TelegramNodeExecutor (`apps/executor/src/executors/TelegramNodeExecutor.ts`)
Sends Telegram messages via the Telegram Bot API.

**Features:**
- ✅ Send text messages
- ✅ Markdown/HTML formatting
- ✅ Disable web page preview
- ✅ Silent notifications
- ✅ Reply to messages
- ✅ Dynamic content with expressions
- ✅ Telegram Bot API integration
- ✅ Error handling with continueOnFail

**Required Parameters:**
- `chatId`: Telegram chat ID or username (e.g., "@username" or "123456789")
- `text`: Message text

**Optional Parameters:**
- `parseMode`: Text formatting mode ("HTML", "Markdown", "MarkdownV2")
- `disableWebPagePreview`: Boolean to disable link previews
- `disableNotification`: Boolean for silent messages
- `replyToMessageId`: Message ID to reply to

**Credentials Required:**
```json
{
  "botToken": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
}
```

**Example Node Configuration:**
```json
{
  "id": "telegram_001",
  "name": "Send Alert",
  "type": "sendTelegram",
  "parameters": {
    "chatId": "{{context.telegramId}}",
    "text": "🎉 Hello {{context.name}}! Your score is {{context.score}}",
    "parseMode": "HTML",
    "disableNotification": false
  },
  "credentials": {
    "telegram": {
      "id": "1",
      "name": "My Telegram Bot"
    }
  }
}
```

**Response Format:**
```json
{
  "messageId": 12345,
  "chatId": 123456789,
  "text": "🎉 Hello John! Your score is 95",
  "date": 1234567890,
  "status": "sent"
}
```

### 3. Updated Factory

The `NodeExecutorFactory` now supports:
- `sendEmail`, `email` → EmailNodeExecutor
- `sendTelegram`, `telegram` → TelegramNodeExecutor

## Example Workflows

### Example 1: Simple Email Notification

**Use Case:** Send email when webhook is triggered.

```json
{
  "name": "Email Notification",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_001",
      "name": "Webhook",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "expectedKeys": ["email", "name", "message"]
      },
      "webhookId": "abc123"
    },
    {
      "id": "email_001",
      "name": "Send Email",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "to": "{{context.email}}",
        "subject": "New Message for {{context.name}}",
        "body": "{{context.message}}"
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
    "trigger_001": {
      "main": [[{ "node": "email_001", "type": "main", "index": 0 }]]
    }
  }
}
```

**Trigger:**
```bash
curl -X POST http://localhost:3000/webhook/handler/abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "message": "Hello from the workflow!"
  }'
```

---

### Example 2: Parallel Email + Telegram (From Design Doc)

**Use Case:** HTTP request triggers both email and Telegram notifications.

```json
{
  "name": "Parallel Notifications",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "trigger_001",
      "name": "Webhook",
      "type": "trigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {},
      "webhookId": "def456"
    },
    {
      "id": "http_001",
      "name": "Fetch Data",
      "type": "httpRequest",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "url": "https://jsonplaceholder.typicode.com/users/1",
        "method": "GET"
      }
    },
    {
      "id": "email_001",
      "name": "Email Notification",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [500, 50],
      "parameters": {
        "to": "admin@example.com",
        "subject": "User Data Fetched",
        "body": "User name: {{$node.http_001.body.name}}, Email: {{$node.http_001.body.email}}"
      },
      "credentials": {
        "resend": {
          "id": "1",
          "name": "Resend Account"
        }
      }
    },
    {
      "id": "telegram_001",
      "name": "Telegram Alert",
      "type": "sendTelegram",
      "typeVersion": 1,
      "position": [500, 150],
      "parameters": {
        "chatId": "@mychannel",
        "text": "📊 New user data: {{$node.http_001.body.name}}"
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
    "trigger_001": {
      "main": [[{ "node": "http_001", "type": "main", "index": 0 }]]
    },
    "http_001": {
      "main": [
        [
          { "node": "email_001", "type": "main", "index": 0 },
          { "node": "telegram_001", "type": "main", "index": 0 }
        ]
      ]
    }
  }
}
```

**Note:** Email and Telegram nodes execute in parallel after HTTP request completes.

---

### Example 3: Score-Based Notification (Complex Workflow from Design)

**Use Case:** Send different messages based on score value.

This example will be fully implemented in Phase 4 with the Condition node.

**Simplified Version (No Condition - Always Email):**
```json
{
  "name": "Score Notification",
  "status": "ACTIVE",
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
      "webhookId": "ghi789"
    },
    {
      "id": "email_001",
      "name": "Congratulations Email",
      "type": "sendEmail",
      "typeVersion": 1,
      "position": [300, 100],
      "parameters": {
        "to": "{{context.email}}",
        "subject": "Your Score: {{context.score}}",
        "html": "<h2>Hello {{context.name}}!</h2><p>Your score is: <strong>{{context.score}}</strong></p>"
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
    "trigger_001": {
      "main": [[{ "node": "email_001", "type": "main", "index": 0 }]]
    }
  }
}
```

**Trigger:**
```bash
curl -X POST http://localhost:3000/webhook/handler/ghi789 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "telegramId": "123456789",
    "score": 95
  }'
```

---

## Setting Up Credentials

### Resend Credentials

1. **Get Resend API Key:**
   - Sign up at https://resend.com
   - Create an API key in your dashboard
   - Verify your domain (for production)

2. **Store in Database:**
```sql
INSERT INTO credentials (id, "for", data, "userId", "createdAt", "updatedAt")
VALUES (
  1,
  'resend',
  '{"apiKey": "re_your_api_key_here", "defaultFrom": "noreply@yourdomain.com"}',
  'user123',
  NOW(),
  NOW()
);
```

### Telegram Credentials

1. **Create Telegram Bot:**
   - Open Telegram and search for @BotFather
   - Send `/newbot` command
   - Follow instructions to create your bot
   - Copy the bot token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. **Get Chat ID:**
   - For personal messages: Start chat with your bot and send a message
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Look for `"chat":{"id":123456789}` in the response
   - For channels: Use `@channelname` or channel ID

3. **Store in Database:**
```sql
INSERT INTO credentials (id, "for", data, "userId", "createdAt", "updatedAt")
VALUES (
  2,
  'telegram',
  '{"botToken": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"}',
  'user123',
  NOW(),
  NOW()
);
```

---

## Testing Communication Nodes

### Test 1: Email Node

```bash
# 1. Create workflow with email node (use example above)
# 2. Trigger webhook
curl -X POST http://localhost:3000/webhook/handler/abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "name": "Test User",
    "message": "This is a test message!"
  }'

# 3. Check execution result
curl http://localhost:3000/executions/EXECUTION_ID

# 4. Verify email received in inbox
```

### Test 2: Telegram Node

```bash
# 1. Create workflow with telegram node
# 2. Trigger webhook
curl -X POST http://localhost:3000/webhook/handler/def456 \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "YOUR_CHAT_ID",
    "name": "Test User",
    "message": "Hello from workflow automation!"
  }'

# 3. Check execution result
curl http://localhost:3000/executions/EXECUTION_ID

# 4. Verify message received in Telegram
```

### Test 3: Parallel Email + Telegram

```bash
# Use the parallel notifications workflow from Example 2
curl -X POST http://localhost:3000/webhook/handler/def456 \
  -H "Content-Type: application/json" \
  -d '{}'

# Both email and telegram should be sent simultaneously
# Check logs for parallel execution
```

---

## Expression Support

Both Email and Telegram nodes support full expression resolution:

### Access Trigger Data
```
{{context.email}}
{{context.name}}
{{$trigger.body.score}}
```

### Access Previous Node Output
```
{{$node.http_001.body.id}}
{{$node.http_001.statusCode}}
```

### Use in Email Parameters
```json
{
  "to": "{{context.email}}",
  "subject": "Hello {{context.name}}!",
  "html": "<p>Your ID is {{$node.http_001.body.id}}</p>"
}
```

### Use in Telegram Parameters
```json
{
  "chatId": "{{context.telegramId}}",
  "text": "Hello {{context.name}}! Score: {{context.score}}"
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
│   ├── EmailNodeExecutor.ts          # Email sending ✅ NEW
│   ├── TelegramNodeExecutor.ts       # Telegram messages ✅ NEW
│   └── NodeExecutorFactory.ts        # Factory (updated) ✅
├── services/
│   └── CredentialsService.ts         # Credentials management ✅
└── utils/
    └── ExpressionResolver.ts         # Expression resolution ✅
```

---

## API Integrations

### Resend API
- **Endpoint:** `https://api.resend.com/emails`
- **Method:** POST
- **Auth:** Bearer token in Authorization header
- **Docs:** https://resend.com/docs/api-reference/emails/send-email

### Telegram Bot API
- **Endpoint:** `https://api.telegram.org/bot<TOKEN>/sendMessage`
- **Method:** POST
- **Auth:** Token in URL
- **Docs:** https://core.telegram.org/bots/api#sendmessage

---

## Error Handling

Both executors implement comprehensive error handling:

1. **Missing Credentials:**
   ```
   Error: Resend credentials not configured for this node
   Error: Telegram credentials not configured for this node
   ```

2. **API Errors:**
   - Resend: Returns error message from API response
   - Telegram: Returns description from API response

3. **Continue on Fail:**
   - If `continueOnFail: true`, execution continues even if sending fails
   - Error is logged but workflow proceeds

4. **Validation:**
   - Required parameters checked before execution
   - User authorization verified for credentials

---

## Security Considerations

1. **Credential Access:**
   - Credentials verified to belong to the workflow owner
   - Unauthorized access prevented

2. **API Keys:**
   - Stored encrypted in database (basic implementation in v0)
   - Never exposed in logs or responses

3. **Rate Limiting:**
   - Consider implementing rate limits for email/telegram nodes
   - Prevent abuse and API quota exhaustion

4. **Input Validation:**
   - Email addresses validated by Resend API
   - Telegram chat IDs validated by Telegram API

---

## Known Limitations

1. **Email:**
   - No attachment support (yet)
   - No email templates
   - Limited to Resend API

2. **Telegram:**
   - Text messages only (no photos, files, etc.)
   - No inline keyboards or custom markup
   - Limited to sendMessage API

3. **Both:**
   - No delivery status tracking
   - No read receipts
   - Synchronous execution (no queue)

These can be added in future iterations.

---

## Performance Notes

1. **Parallel Execution:**
   - Multiple email/telegram nodes execute in parallel
   - Improves performance for multi-recipient workflows

2. **Timeout Handling:**
   - Both APIs use fetch with default timeout
   - Consider adding configurable timeouts

3. **Error Recovery:**
   - No automatic retries (yet)
   - Use `retryOnFail` node setting (to be implemented)

---

## Next Steps (Phase 4)

Phase 4 will implement conditional logic:
1. **ConditionNodeExecutor** - Conditional branching based on expressions
2. **ConditionEvaluator utility** - Expression evaluation for conditions
3. Complete the complex score-based workflow from the design

With Phase 4, we'll achieve the full v0 feature set!

---

## Conclusion

Phase 3 successfully adds external communication capabilities to the workflow automation platform. Users can now:
- ✅ Send emails via Resend API
- ✅ Send Telegram messages via Bot API
- ✅ Use dynamic content with expressions
- ✅ Execute communication nodes in parallel
- ✅ Handle errors gracefully
- ✅ Chain communication with other nodes

The system is production-ready for basic notification workflows!

