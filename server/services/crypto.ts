import crypto from 'crypto';
import { sanitizeLogText } from '../utils/logSanitizer.ts';

const getKey = (): Buffer => {
  const keyHex = process.env.VAULT_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('FATAL: VAULT_ENCRYPTION_KEY ausente ou inválida (requer 64 caracteres hexadecimais).');
  }
  return Buffer.from(keyHex, 'hex');
};

export function encryptSensitiveData(text: string | null | undefined): string | null {
  if (!text || text.trim() === '') return null;
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

export function decryptSensitiveData(encryptedData: string | null | undefined): string | null {
  if (!encryptedData || !encryptedData.includes(':')) return null;
  try {
    const [ivHex, encryptedText, authTagHex] = encryptedData.split(':');
    if (!ivHex || !encryptedText || !authTagHex) return null;
    const key = getKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('[AppSec Crypto Erro]: Falha na autenticação/descriptografia dos dados:', sanitizeLogText(error));
    return null;
  }
}
