import { Router, json } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { isUserProfileComplete, isClientAuthError } from '../utils/sanitizers.ts';

export const certificadosRouter = Router();

const strictUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de envio de arquivos excedido. Tente novamente mais tarde.' }
});

const uploadCertificadoSchema = z.object({
  cursoId: z.string().min(1).max(128),
  fileName: z.string().min(1).max(255),
  fileType: z.enum(['application/pdf', 'image/png', 'image/jpeg']),
  fileData: z.string().min(1)
});

certificadosRouter.post('/', strictUploadLimiter, async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken, true);
    res.locals.uid = decodedToken.uid;
    next();
  } catch (error) {
    if (isClientAuthError(error)) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    return res.status(503).json({ error: 'Serviço de autenticação temporariamente indisponível.' });
  }
}, (req, res, next) => {
  json({ limit: '2mb' })(req, res, (err) => {
    if (err) {
      if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Tamanho do arquivo excede o limite estrito de 1MB.' });
      }
      return res.status(400).json({ error: 'Payload malformatado ou corrompido.' });
    }
    next();
  });
}, async (req, res) => {
  const db = getFirestore();
  try {
    const uid = res.locals.uid;

    const parseResult = uploadCertificadoSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Payload de upload inválido.' });
    }
    const { cursoId, fileData } = parseResult.data;

    const MAX_BASE64_LENGTH = 1400000;
    if (fileData.length > MAX_BASE64_LENGTH) {
      return res.status(413).json({ error: 'Tamanho do arquivo excede o limite permitido de 1MB.' });
    }

    const jornadaDoc = await db.collection('usuarios').doc(uid).get();

    if (!jornadaDoc.exists || !isUserProfileComplete(jornadaDoc.data())) {
      return res.status(403).json({ error: 'Acesso negado: Conclua seu cadastro e mantenha uma jornada ativa para este curso.' });
    }

    const jornadasArray = jornadaDoc.data()?.jornadaCursos || [];
    const jornadaEspecifica = jornadasArray.find((j: any) => j.cursoId === cursoId);

    if (!jornadaEspecifica) {
      return res.status(403).json({ error: 'Acesso negado: Usuário não possui jornada ativa para este curso.' });
    }

    const jornadaStatus = jornadaEspecifica.status;
    if (jornadaStatus !== 'MATRICULADO' && jornadaStatus !== 'AGUARDANDO_CERTIFICADO') {
      return res.status(403).json({ error: 'Acesso negado: Status da jornada não permite envio de certificado.' });
    }

    if (!fileData.includes(';base64,')) {
      return res.status(400).json({ error: 'Formato de encoding de arquivo inválido.' });
    }

    const base64Parts = fileData.split(';base64,');
    if (base64Parts.length !== 2 || base64Parts[1].length > 1400000) {
      return res.status(400).json({ error: 'Payload de arquivo corrompido ou excede o limite estrito.' });
    }

    const buffer = Buffer.from(base64Parts[1], 'base64');
    if (buffer.length > 1 * 1024 * 1024) {
      return res.status(413).json({ error: 'Tamanho do arquivo excede o limite estrito de 1MB.' });
    }

    const isPdf = buffer.length >= 4 && buffer.subarray(0, 4).toString('utf-8') === '%PDF';
    const isPng = buffer.length >= 8 && buffer.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
    const isJpeg = buffer.length >= 3 && buffer.subarray(0, 3).toString('hex') === 'ffd8ff';

    if (!isPdf && !isPng && !isJpeg) {
      return res.status(400).json({ error: 'Conteúdo do arquivo incompatível com as assinaturas permitidas.' });
    }

    const mimeType = isPdf ? 'application/pdf' : isPng ? 'image/png' : 'image/jpeg';
    const ext = isPdf ? '.pdf' : isPng ? '.png' : '.jpg';
    const cursoTag = crypto.createHash('sha256').update(String(cursoId)).digest('hex').slice(0, 16);
    const path = `certificados/${uid}/${cursoTag}_${Date.now()}_${crypto.randomUUID()}${ext}`;

    const bucket = getStorage().bucket();
    const file = bucket.file(path);

    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
        contentDisposition: `attachment; filename="certificado_${Date.now()}${ext}"`,
        metadata: {
          uploadedBy: uid,
          cursoId: String(cursoId),
          cursoTag,
          sanitizado: 'true',
          xContentTypeOptions: 'nosniff'
        }
      },
      resumable: false
    });

    res.json({ success: true, url: path, storagePath: path });
  } catch {
    console.error('Erro interno retido no servidor ao processar certificado.');
    res.status(500).json({ error: 'Erro interno ao processar requisição.' });
  }
});
