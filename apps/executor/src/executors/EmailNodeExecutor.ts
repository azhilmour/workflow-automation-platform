import type { INode, IExecutionContext, INodeExecutionResult } from '@repo/types';
import { BaseNodeExecutor } from './BaseNodeExecutor';
import { ExpressionResolver } from '../utils/ExpressionResolver';
import { CredentialsService } from '../services/CredentialsService';

/**
 * Email Node Executor
 * 
 * Sends emails using the Resend API.
 * Requires Resend API credentials to be configured by the user.
 */
export class EmailNodeExecutor extends BaseNodeExecutor {
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
      this.log(node, 'Sending email');

      // Resolve expressions in parameters
      const resolvedParams = ExpressionResolver.resolveParameters(
        node.parameters,
        context,
        inputData
      );

      // Validate required parameters
      this.validateParameters(node, ['to', 'subject', 'body']);

      const {
        to,
        from,
        subject,
        body,
        html,
        replyTo,
        cc,
        bcc,
      } = resolvedParams;

      // Get Resend credentials
      let credentials;
      if (node.credentials?.resend?.id) {
        const credentialId = parseInt(node.credentials.resend.id);
        credentials = await this.credentialsService.getCredentials(
          credentialId,
          context.userId
        );
      } else {
        throw new Error('Resend credentials not configured for this node');
      }

      if (!credentials.apiKey) {
        throw new Error('Resend API key not found in credentials');
      }

      this.log(node, `Sending email to ${to}`);

      // Build email payload
      const emailPayload: any = {
        from: from || credentials.defaultFrom || 'noreply@example.com',
        to: Array.isArray(to) ? to : [to],
        subject,
      };

      // Add body (prefer HTML over plain text)
      if (html) {
        emailPayload.html = html;
      } else {
        emailPayload.text = body;
      }

      // Optional fields
      if (replyTo) {
        emailPayload.reply_to = replyTo;
      }
      if (cc) {
        emailPayload.cc = Array.isArray(cc) ? cc : [cc];
      }
      if (bcc) {
        emailPayload.bcc = Array.isArray(bcc) ? bcc : [bcc];
      }

      // Send email via Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || `Email sending failed with status ${response.status}`;
        this.log(node, `Error: ${errorMessage}`);
        
        if (!node.continueOnFail) {
          return this.failure(errorMessage);
        }
      }

      this.log(node, `Email sent successfully. ID: ${responseData.id}`);

      // Return result
      const result = {
        id: responseData.id,
        to: emailPayload.to,
        from: emailPayload.from,
        subject: emailPayload.subject,
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

