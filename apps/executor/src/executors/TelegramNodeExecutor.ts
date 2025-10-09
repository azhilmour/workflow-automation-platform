import type { INode, IExecutionContext, INodeExecutionResult } from '@repo/types';
import { BaseNodeExecutor } from './BaseNodeExecutor';
import { ExpressionResolver } from '../utils/ExpressionResolver';
import { CredentialsService } from '../services/CredentialsService';

/**
 * Telegram Node Executor
 * 
 * Sends Telegram messages using the Telegram Bot API.
 * Requires Telegram Bot credentials to be configured by the user.
 */
export class TelegramNodeExecutor extends BaseNodeExecutor {
  private credentialsService: CredentialsService;

  constructor() {
    super();
    this.credentialsService = new CredentialsService();
  }

  async execute(
    node: INode,
    context: IExecutionContext,
    inputData: any
  ): Promise<INodeExecutionResult> {
    try {
      this.log(node, 'Sending Telegram message');

      // Resolve expressions in parameters
      const resolvedParams = ExpressionResolver.resolveParameters(
        node.parameters,
        context,
        inputData
      );

      // Validate required parameters
      this.validateParameters(node, ['chatId', 'text']);

      const {
        chatId,
        text,
        parseMode,
        disableWebPagePreview,
        disableNotification,
        replyToMessageId,
      } = resolvedParams;

      // Get Telegram credentials
      let credentials;
      if (node.credentials?.telegram?.id) {
        const credentialId = parseInt(node.credentials.telegram.id);
        credentials = await this.credentialsService.getCredentials(
          credentialId,
          context.userId
        );
      } else {
        throw new Error('Telegram credentials not configured for this node');
      }

      if (!credentials.botToken) {
        throw new Error('Telegram bot token not found in credentials');
      }

      this.log(node, `Sending message to chat ID: ${chatId}`);

      // Build message payload
      const messagePayload: any = {
        chat_id: chatId,
        text,
      };

      // Optional parameters
      if (parseMode) {
        messagePayload.parse_mode = parseMode; // HTML, Markdown, MarkdownV2
      }
      if (disableWebPagePreview !== undefined) {
        messagePayload.disable_web_page_preview = disableWebPagePreview;
      }
      if (disableNotification !== undefined) {
        messagePayload.disable_notification = disableNotification;
      }
      if (replyToMessageId) {
        messagePayload.reply_to_message_id = replyToMessageId;
      }

      // Send message via Telegram Bot API
      const apiUrl = `https://api.telegram.org/bot${credentials.botToken}/sendMessage`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.ok) {
        const errorMessage = responseData.description || `Telegram message sending failed with status ${response.status}`;
        this.log(node, `Error: ${errorMessage}`);
        
        if (!node.continueOnFail) {
          return this.failure(errorMessage);
        }
      }

      this.log(node, `Message sent successfully. Message ID: ${responseData.result?.message_id}`);

      // Return result
      const result = {
        messageId: responseData.result?.message_id,
        chatId: responseData.result?.chat?.id,
        text: responseData.result?.text,
        date: responseData.result?.date,
        status: 'sent',
      };

      return this.success(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(node, `Error: ${errorMessage}`);
      return this.failure(error instanceof Error ? error : new Error(errorMessage));
    }
  }
}

