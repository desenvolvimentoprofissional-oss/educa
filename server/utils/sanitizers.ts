import crypto from 'crypto';
import { promisify } from 'util';

const pbkdf2Async = promisify(crypto.pbkdf2);
const pepper = process.env.HMAC_PEPPER_KEY;

if (!pepper) {
  throw new Error('FATAL: HMAC_PEPPER_KEY não está configurada no ambiente.');
}

export const processProfileSecurityData = async (uid: string, cpf: string, celular: string, email?: string) => {
  const cleanCpf = (cpf || '').replace(/\D/g, '');
  const cleanCelular = (celular || '').replace(/\D/g, '');
  
  const globalCpfHash = crypto.createHmac('sha256', pepper).update(`CPF_GLOBAL_${cleanCpf}`).digest('hex');
  const userSalt = crypto.createHmac('sha256', pepper).update(uid).digest('hex');

  const [cpfHashBuf, celularHashBuf] = await Promise.all([
    pbkdf2Async(cleanCpf, userSalt, 100000, 32, 'sha256'),
    pbkdf2Async(cleanCelular, userSalt, 100000, 32, 'sha256')
  ]);

  let emailHash = null;
  if (email) {
    const emailBuf = await pbkdf2Async(email.trim().toLowerCase(), userSalt, 100000, 32, 'sha256');
    emailHash = emailBuf.toString('hex');
  }
  
  return {
    cleanCpf,
    cleanCelular,
    globalCpfHash,
    cpfHash: cpfHashBuf.toString('hex'),
    celularHash: celularHashBuf.toString('hex'),
    emailHash
  };
};

export const isUserProfileComplete = (userData: Record<string, any> | undefined): boolean => {
  if (!userData) return false;
  return Boolean(
    userData.nome &&
    userData.cpfHash &&
    userData.uf &&
    userData.lgpdAceite !== false
  );
};

export const isClientAuthError = (error: any): boolean => {
  const code = String(error?.code || error?.errorInfo?.code || '');
  if (
    code === 'auth/id-token-expired' ||
    code === 'auth/id-token-revoked' ||
    code === 'auth/invalid-id-token' ||
    code === 'auth/argument-error' ||
    code === 'auth/user-disabled' ||
    code === 'auth/user-not-found'
  ) {
    return true;
  }
  const msg = String(error?.message || '').toLowerCase();
  return (
    msg.includes('id token has expired') ||
    msg.includes('id token has been revoked') ||
    msg.includes('decoding firebase id token failed') ||
    msg.includes('firebase id token has')
  );
};

