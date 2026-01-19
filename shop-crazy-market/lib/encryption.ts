// Encryption utilities for sensitive data like OAuth tokens
import crypto from 'crypto';

function getEncryptionKey(): Buffer {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
  
  if (!ENCRYPTION_KEY) {
    console.error('ENCRYPTION_KEY is not set in environment variables!');
    throw new Error('ENCRYPTION_KEY environment variable is required. Please set it in Vercel → Settings → Environment Variables');
  }
  
  // Validate key length (must be at least 32 bytes/64 hex characters)
  if (ENCRYPTION_KEY.length < 64) {
    console.error('ENCRYPTION_KEY is too short! Must be at least 64 hex characters (32 bytes)');
    throw new Error('ENCRYPTION_KEY must be at least 64 hex characters (32 bytes). Please generate a new key: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }
  
  // Convert hex string to buffer (take first 32 bytes = 64 hex characters)
  try {
    const keyBuffer = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
    if (keyBuffer.length !== 32) {
      throw new Error('Invalid key format');
    }
    return keyBuffer;
  } catch (error) {
    console.error('ENCRYPTION_KEY format error:', error);
    throw new Error('ENCRYPTION_KEY must be a valid hex string (64 hex characters = 32 bytes). Please generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }
}

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt sensitive data (like OAuth tokens)
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error: any) {
    console.error('Encryption error:', error);
    if (error.message.includes('ENCRYPTION_KEY')) {
      throw error; // Re-throw our specific error messages
    }
    throw new Error(`Failed to encrypt data: ${error.message}`);
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  
  try {
    const key = getEncryptionKey();
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      // If not in expected format, assume it's plain text (for backward compatibility)
      return encryptedText;
    }
    
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error: any) {
    console.error('Decryption error:', error);
    // If decryption fails, return original (might be plain text from old records)
    if (error.message.includes('ENCRYPTION_KEY')) {
      throw error; // Re-throw our specific error messages
    }
    return encryptedText;
  }
}
