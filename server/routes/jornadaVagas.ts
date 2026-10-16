import { Router } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { 
  criarJornadaVaga, 
  atualizarStatusJornadaVaga 
} from '../controllers/jornadaVagasController.ts';
import { sanitizeLogText } from '../utils/logSanitizer.ts';
import { isClientAuthError } from '../utils/sanitizers.ts';

export const jornadaVagasRouter = Router();

const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de transações excedido. Tente novamente em alguns minutos.' }
});

const jornadaVagaSchema = z.object({
  vagaId: z.string().min(1).max(128)
});


jornadaVagasRouter.post('/', transactionLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken, true);
    const uid = decodedToken.uid;

    const parseResult = jornadaVagaSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Payload de dados inválido.' });
    }

    await criarJornadaVaga(uid, parseResult.data, res);
  } catch (error) {
    if (isClientAuthError(error)) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
    console.error('[AppSec Log Seguro] Erro de autorização em jornadaVagas POST:', sanitizeLogText(error));
    res.status(503).json({ error: 'Serviço de autenticação temporariamente indisponível.' });
  }
});

const patchJornadaVagaSchema = z.object({
  status: z.enum(['CANDIDATADO', 'NAO_FOI_DESTA_VEZ', 'DESISTIU', 'PRE_CANDIDATADO', 'CONTRATADO'])
});

const pathIdSchema = z.string().min(1).max(128).regex(/^[a-zA-Z0-9_\-.%\s\u00C0-\u024F(),&+:;'"]+$/, 'Identificador de recurso inválido');

jornadaVagasRouter.patch('/:vagaId/status', transactionLimiter, async (req, res) => {
  try {
    const parseParam = pathIdSchema.safeParse(req.params.vagaId);
    if (!parseParam.success) {
      return res.status(400).json({ error: 'Identificador de vaga com formato inválido.' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken, true);
    const uid = decodedToken.uid;

    const vagaId = parseParam.data;

    const parseResult = patchJornadaVagaSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Payload de atualização inválido.' });
    }

    await atualizarStatusJornadaVaga(uid, vagaId, parseResult.data, res);
  } catch (error) {
    if (isClientAuthError(error)) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
    console.error('[AppSec Log Seguro] Erro de autorização em jornadaVagas PATCH:', sanitizeLogText(error));
    res.status(503).json({ error: 'Serviço de autenticação temporariamente indisponível.' });
  }
});
