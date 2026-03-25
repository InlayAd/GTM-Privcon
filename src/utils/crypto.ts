import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY = crypto
  .createHash('sha256')
  .update(process.env.SESSION_SECRET || 'default_fallback_secret_change_me')
  .digest();

/**
 * Encrypts sensitive text using AES-256-GCM
 * Output format: iv:authTag:encryptedData (all hex)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts text previously encrypted by the encrypt function
 */
export function decrypt(cipherText: string): string {
  try {
    const [ivHex, authTagHex, encryptedDataHex] = cipherText.split(':');
    
    if (!ivHex || !authTagHex || !encryptedDataHex) {
      throw new Error('Invalid cipher text format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encryptedData = Buffer.from(encryptedDataHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Could not decrypt data. Secret key might have changed.');
  }
}
