import { Router } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { 
  criarJornada, 
  atualizarStatusJornada
} from '../controllers/jornadaCursosController.ts';
import { sanitizeLogText } from '../utils/logSanitizer.ts';
import { isClientAuthError } from '../utils/sanitizers.ts';

export const jornadaCursosRouter = Router();

const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de transações excedido. Tente novamente em alguns minutos.' }
});

const jornadaSchema = z.object({
  cursoId: z.string().min(1).max(128),
  cursoSnapshot: z.object({
    titulo: z.string().max(200).nullish(),
    tituloEditado: z.string().max(200).nullish(),
    cargaHoraria: z.string().max(50).nullish(),
    instituicaoCooperada: z.string().max(150).nullish(),
    area: z.string().max(100).nullish(),
    image: z.string()
      .url('Formato de URL inválido')
      .max(1000)
      .refine((val) => val.startsWith('https://'), {
        message: 'Imagens devem obrigatoriamente utilizar protocolo seguro HTTPS.'
      })
      .nullish()
  }).nullish()
});


jornadaCursosRouter.post('/', transactionLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken, true);
    const uid = decodedToken.uid;

    const parseResult = jornadaSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Payload de dados inválido.' });
    }

    await criarJornada(uid, parseResult.data, res);
  } catch (error) {
    if (isClientAuthError(error)) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
    console.error('[AppSec Log Seguro] Erro de autorização em jornadaCursos POST:', sanitizeLogText(error));
    res.status(503).json({ error: 'Serviço de autenticação temporariamente indisponível.' });
  }
});

const patchJornadaSchema = (userUid: string) => z.object({
  status: z.enum(['MATRICULADO', 'AGUARDANDO_CERTIFICADO', 'DESISTIU', 'PRE_MATRICULADO', 'EM_ANALISE', 'CONCLUIDO']),
  certificadoUrl: z
    .string()
    .max(1000)
    .refine(
      (val) => {
        const decoded = decodeURIComponent(val);
        if (decoded.includes('..') || decoded.includes('\\')) return false;
        const expectedPrefix = `certificados/${userUid}/`;
        if (!decoded.startsWith(expectedPrefix)) return false;
        const fileName = decoded.slice(expectedPrefix.length);
        return /^[a-zA-Z0-9_.-]+$/.test(fileName);
      },
      { message: 'O caminho do certificado deve ser um arquivo válido na sua pasta isolada de armazenamento.' }
    )
    .optional(),
  avaliacao: z.object({
    notaCurso: z.number().int().min(1).max(5).optional(),
    notaPlataforma: z.number().int().min(1).max(5).optional(),
    notaMaterial: z.number().int().min(1).max(5).optional(),
    comentario: z.string().max(500).optional()
  }).optional()
}).superRefine((data, ctx) => {
  if (data.certificadoUrl !== undefined && data.status !== 'EM_ANALISE') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'O certificado só pode ser informado ao enviar o curso para análise (EM_ANALISE).',
      path: ['certificadoUrl']
    });
  }
});

const pathIdSchema = z.string().min(1).max(128).regex(/^[a-zA-Z0-9_\-.%\s\u00C0-\u024F(),&+:;'"]+$/, 'Identificador de recurso inválido');

jornadaCursosRouter.patch('/:cursoId/status', transactionLimiter, async (req, res) => {
  try {
    const parseParam = pathIdSchema.safeParse(req.params.cursoId);
    if (!parseParam.success) {
      return res.status(400).json({ error: 'Identificador de curso com formato inválido.' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken, true);
    const uid = decodedToken.uid;

    const cursoId = parseParam.data;

    const parseResult = patchJornadaSchema(uid).safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Payload de atualização inválido.' });
    }

    await atualizarStatusJornada(uid, cursoId, parseResult.data, res);
  } catch (error) {
    if (isClientAuthError(error)) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
    console.error('[AppSec Log Seguro] Erro de autorização em jornadaCursos PATCH:', sanitizeLogText(error));
    res.status(503).json({ error: 'Serviço de autenticação temporariamente indisponível.' });
  }
});
