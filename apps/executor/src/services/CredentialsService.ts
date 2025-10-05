import { AppDataSource } from '@repo/db';
import { CredentialsEntity } from '@repo/db';
import { Repository } from 'typeorm';
import { createDecipheriv } from 'crypto';

export class CredentialsService {
  private repository: Repository<CredentialsEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(CredentialsEntity);
  }

  /**
   * Get credentials by ID
   */
  async getCredentials(
    credentialId: number,
    userId: string
  ): Promise<any> {
    const credential = await this.repository.findOne({
      where: { id: credentialId },
    });

    if (!credential) {
      throw new Error(`Credential not found: ${credentialId}`);
    }

    // Verify user has access to this credential
    if (credential.userId !== userId) {
      throw new Error('Unauthorized access to credential');
    }

    // Decrypt and return credential data
    return this.decrypt(credential.data);
  }

  /**
   * Get credentials by type (e.g., 'resend', 'telegram')
   */
  async getCredentialsByType(
    credentialType: string,
    userId: string
  ): Promise<CredentialsEntity | null> {
    return this.repository.findOne({
      where: {
        for: credentialType,
        userId,
      },
    });
  }

  /**
   * Decrypt credential data
   * Note: This is a basic implementation. In production, use proper key management.
   */
  private decrypt(encryptedData: string): any {
    try {
      // For now, assume data is stored as plain JSON (not encrypted)
      // TODO: Implement proper encryption/decryption in production
      const decrypted = JSON.parse(encryptedData);
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt credential data:', error);
      throw new Error('Failed to decrypt credential data');
    }
  }

  /**
   * Decrypt using AES encryption (for future use)
   */
  private decryptAES(encryptedData: string): any {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY not set in environment');
    }

    try {
      // Parse the encrypted data (format: iv:encrypted)
      const parts = encryptedData.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = Buffer.from(parts[1], 'hex');

      // Create decipher
      const decipher = createDecipheriv(
        'aes-256-cbc',
        Buffer.from(encryptionKey, 'hex'),
        iv
      );

      // Decrypt
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return JSON.parse(decrypted.toString());
    } catch (error) {
      console.error('Failed to decrypt credential data:', error);
      throw new Error('Failed to decrypt credential data');
    }
  }
}

