import { Response } from 'express';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';
import { promisify } from 'util';
import { saveToVault } from '../services/vault.ts';
import { encryptSensitiveData } from '../services/crypto.ts';
import sanitizeHtml from 'sanitize-html';
import { sanitizeLogText } from '../utils/logSanitizer.ts';
import { isUserProfileComplete } from '../utils/sanitizers.ts';

const pbkdf2Async = promisify(crypto.pbkdf2);
const pepper = process.env.HMAC_PEPPER_KEY;

if (!pepper) {
  throw new Error('FATAL: HMAC_PEPPER_KEY não está configurada no ambiente.');
}

export const atualizarContato = async (uid: string, data: any, res: Response) => {
  const db = getFirestore();
  try {
    const { emailContato, telefone } = data;
    
    if (!emailContato && !telefone) {
      return res.status(400).json({ error: 'Nenhum dado para atualizar' });
    }

    const userRef = db.collection('usuarios').doc(uid);
    const doc = await userRef.get();

    if (!doc.exists || !isUserProfileComplete(doc.data())) {
      return res.status(403).json({ error: 'Conclua seu cadastro antes de atualizar os dados de contato.' });
    }

    const updates: any = {
      updatedAt: FieldValue.serverTimestamp()
    };
    
    const userSalt = crypto.createHmac('sha256', pepper).update(uid).digest('hex');

    const emailClean = emailContato ? emailContato.trim().toLowerCase() : '';
    const cleanPhone = telefone ? telefone.replace(/\D/g, '') : '';

    if (emailClean.length === 0 && (cleanPhone.length < 10 || cleanPhone.length > 11)) {
      return res.status(400).json({ error: 'Informe um e-mail ou telefone válido para atualização.' });
    }

    if (emailClean.length > 0) {
      const emailBuf = await pbkdf2Async(emailClean, userSalt, 100000, 32, 'sha256');
      updates.emailContatoHash = emailBuf.toString('hex');
    }
    
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
      const phoneBuf = await pbkdf2Async(cleanPhone, userSalt, 100000, 32, 'sha256');
      updates.celularHash = phoneBuf.toString('hex');
    }

    await userRef.update(updates);
    
    saveToVault({
      uid,
      emailContato: emailClean.length > 0 ? encryptSensitiveData(emailClean) : null,
      telefone: cleanPhone.length >= 10 ? encryptSensitiveData(cleanPhone) : null,
      updatedAt: new Date().toISOString(),
      origem: 'CRA-SP Educa (Atualização de Contato)'
    }).catch(err => console.error('Erro não bloqueante ao salvar contato no Cofre:', sanitizeLogText(err)));

    res.json({ success: true, message: 'Contato atualizado' });
  } catch (error: any) {
    console.error('Erro ao atualizar contato:', sanitizeLogText(error));
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const abrirTicketSuporte = async (uid: string, email: string | undefined, data: any, res: Response) => {
  const db = getFirestore();
  try {
    const userDoc = await db.collection('usuarios').doc(uid).get();
    if (!userDoc.exists || !isUserProfileComplete(userDoc.data())) {
      return res.status(403).json({ error: 'Conclua seu cadastro antes de abrir um chamado de suporte.' });
    }

    const { assunto, mensagem } = data;
    
    const sanitizeFormula = (input: string): string => {
      const clean = sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim();
      return /^[=@+\-\t\r]/.test(clean) ? `'${clean}` : clean;
    };
    const cleanAssunto = sanitizeFormula(assunto || '');
    const cleanMensagem = sanitizeFormula(mensagem || '');
    
    let emailCriptografado = null;
    if (email) {
      emailCriptografado = encryptSensitiveData(email.trim().toLowerCase());
    }

    await db.collection('suporte_tickets').add({
      uid,
      emailEncrypted: emailCriptografado,
      assunto: cleanAssunto,
      mensagem: cleanMensagem,
      status: 'ABERTO',
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Ticket aberto com sucesso' });
  } catch (error: any) {
    console.error('Erro interno retido no servidor:', sanitizeLogText(error));
    res.status(500).json({ error: 'Erro interno ao processar requisição.' });
  }
};
