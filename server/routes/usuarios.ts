import { Router } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { 
  checarPerfil, 
  atualizarPerfil,
  atualizarStatusCarteira
} from '../controllers/usuariosController.ts';
import {
  atualizarContato, 
  abrirTicketSuporte 
} from '../controllers/usuariosSuporteController.ts';
import { sanitizeLogText } from '../utils/logSanitizer.ts';
import { isClientAuthError } from '../utils/sanitizers.ts';

export const usuariosRouter = Router();

const suporteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de tickets excedido. Aguarde antes de abrir um novo chamado.' }
});

const contatoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de atualização. Tente novamente mais tarde.' }
});

import { UFS, COMO_SOUBE, FORMACOES, AREAS_ATUACAO } from '../../src/lib/constants.ts';

const profileSchema = z.object({
  nome: z.string().trim().min(2, 'Nome é obrigatório').max(100),
  cpf: z.string().min(11, 'CPF inválido').max(14).refine(val => {
    const clean = val.replace(/\D/g, '');
    if (clean.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(clean)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i)) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(clean.charAt(9))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(clean.charAt(i - 1)) * (12 - i);
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(clean.charAt(10))) return false;
    return true;
  }, { message: 'CPF inválido (dígitos verificadores)' }),
  celular: z.string().min(10, 'Celular inválido').max(20, 'Celular inválido').refine((val) => {
    const digits = val.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  }, { message: 'Celular deve conter 10 ou 11 dígitos numéricos' }),
  uf: z.string().refine(val => UFS.includes(val), 'UF inválida'),
  registroCRA: z.enum(['Sim', 'Não']),
  comoSoube: z.string().refine(val => COMO_SOUBE.includes(val), 'Opção de origem inválida'),
  formacao: z.string().refine(val => FORMACOES.includes(val), 'Formação acadêmica inválida'),
  areaAtuacao: z.string().max(100).nullable().optional().or(z.literal('')),
  semestre: z.string().max(50).nullable().optional().or(z.literal('')),
  ies: z.string().max(150).nullable().optional().or(z.literal('')),
  campus: z.string().max(150).nullable().optional().or(z.literal('')),
  curso: z.string().max(150).nullable().optional().or(z.literal('')),
  cadastroManualIes: z.boolean().optional().default(false),
  lgpd: z.boolean().refine(val => val === true, {
    message: 'O aceite dos termos da LGPD é obrigatório.'
  })
}).superRefine((data, ctx) => {
  const isOutraArea = data.formacao === 'Profissional de outra área' || data.formacao === 'Estudante de outra área';
  if (isOutraArea) {
    if (!data.areaAtuacao || !AREAS_ATUACAO.includes(data.areaAtuacao)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecione uma área de atuação válida', path: ['areaAtuacao'] });
    }
  }

  if (data.formacao.startsWith('Estudante de Administração')) {
    const minIes = data.cadastroManualIes ? 3 : 2;
    const minCurso = data.cadastroManualIes ? 3 : 2;
    if (!data.ies || data.ies.trim().length < minIes) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe uma Instituição de Ensino válida', path: ['ies'] });
    }
    if (!data.campus || data.campus.trim().length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe um Campus ou Polo válido', path: ['campus'] });
    }
    if (!data.curso || data.curso.trim().length < minCurso) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe um Curso válido', path: ['curso'] });
    }
    const maxSemestres = data.formacao === 'Estudante de Administração - Curso Tecnólogo' ? 6 : 10;
    const semestresValidos = Array.from({ length: maxSemestres }, (_, i) => `${i + 1}º Semestre`);
    if (!data.semestre || !semestresValidos.includes(data.semestre)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecione um semestre válido', path: ['semestre'] });
    }
  }
});

const suporteSchema = z.object({
  assunto: z.string().trim().min(1, 'Selecione um assunto').max(100, 'Assunto muito longo'),
  mensagem: z.string().trim().min(1, 'A mensagem não pode estar vazia').max(2000, 'Mensagem muito longa')
});

const contactSchema = z.object({
  emailContato: z.string().email('E-mail inválido').max(254).optional().or(z.literal('')),
  telefone: z.string().max(20, 'Telefone inválido').refine((val) => {
    if (!val || val.trim() === '') return true;
    const digits = val.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  }, { message: 'Telefone deve conter 10 ou 11 dígitos numéricos' }).optional().or(z.literal(''))
});

usuariosRouter.get('/check-profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken, true);
    const uid = decodedToken.uid;
    
    await checarPerfil(uid, res);
  } catch (error) {
    if (isClientAuthError(error)) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
    console.error('[AppSec Log Seguro] Erro de autorização em check-profile:', sanitizeLogText(error));
    res.status(503).json({ error: 'Serviço de autenticação temporariamente indisponível.' });
  }
});



const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas de atualização de perfil. Aguarde alguns minutos.' }
});

usuariosRouter.post('/perfil', profileLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken, true);
    const uid = decodedToken.uid;
    
    const parseResult = profileSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.warn(`[AppSec CRA-SP] Erro de validação de perfil para UID ${uid}`);
      return res.status(400).json({ error: 'Os dados informados não preenchem os requisitos de segurança do formulário.' });
    }

    await atualizarPerfil(uid, decodedToken.email, parseResult.data, res);
  } catch (error) {
    if (isClientAuthError(error)) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
    console.error('[AppSec Log Seguro] Erro de autorização em perfil:', sanitizeLogText(error));
    res.status(503).json({ error: 'Serviço de autenticação temporariamente indisponível.' });
  }
});

usuariosRouter.patch('/carteira', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken, true);
    const uid = decodedToken.uid;
    
    await atualizarStatusCarteira(uid, res);
  } catch (error) {
    if (isClientAuthError(error)) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
    console.error('[AppSec Log Seguro] Erro de autorização em carteira:', sanitizeLogText(error));
    res.status(503).json({ error: 'Serviço de autenticação temporariamente indisponível.' });
  }
});

usuariosRouter.patch('/contato', contatoLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken, true);
    const uid = decodedToken.uid;
    
    const validation = contactSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    await atualizarContato(uid, validation.data, res);
  } catch (error) {
    if (isClientAuthError(error)) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
    console.error('[AppSec Log Seguro] Erro de autorização em contato:', sanitizeLogText(error));
    res.status(503).json({ error: 'Serviço de autenticação temporariamente indisponível.' });
  }
});

usuariosRouter.post('/suporte', suporteLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken, true);
    const uid = decodedToken.uid;
    
    const parseResult = suporteSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Dados do ticket inválidos.' });
    }

    await abrirTicketSuporte(uid, decodedToken.email, parseResult.data, res);
  } catch (error) {
    if (isClientAuthError(error)) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
    console.error('[AppSec Log Seguro] Erro de autorização em suporte:', sanitizeLogText(error));
    res.status(503).json({ error: 'Serviço de autenticação temporariamente indisponível.' });
  }
});
