import { z } from 'zod';
import { Router } from 'express';
import { getAllMecEntries, ensureMecDataLoaded, getMecByIes } from '../services/cache.ts';
import rateLimit from 'express-rate-limit';
import { getAuth } from 'firebase-admin/auth';
import { isClientAuthError } from '../utils/sanitizers.ts';

export const mecRouter = Router();

const mecLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Limite de consultas ao catálogo e-MEC excedido.' }
});

mecRouter.use(mecLimiter);

mecRouter.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso restrito a usuários autenticados.' });
  }
  try {
    const idToken = authHeader.split('Bearer ')[1];
    await getAuth().verifyIdToken(idToken, true);
    next();
  } catch (error) {
    if (isClientAuthError(error)) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }
    return res.status(503).json({ error: 'Serviço de autenticação temporariamente indisponível.' });
  }
});

mecRouter.get('/ies', async (_req, res) => {
  try {
    await ensureMecDataLoaded();
    
    const allMec = getAllMecEntries();
    const iesMap = new Map();
    allMec.forEach(entry => {
      if (entry.codIes && entry.nomeIes) {
        if (!iesMap.has(entry.codIes)) {
          iesMap.set(entry.codIes, { codIes: entry.codIes.toString(), nomeIes: entry.nomeIes });
        }
      }
    });
    const iesList = Array.from(iesMap.values()).sort((a, b) => a.nomeIes.localeCompare(b.nomeIes));
    res.json(iesList);
  } catch (_error) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

const codIesSchema = z.string().regex(/^\d+$/).max(10);

mecRouter.get('/campus/:codIes', async (req, res) => {
  try {
    const parse = codIesSchema.safeParse(req.params.codIes);
    if (!parse.success) {
      return res.status(400).json({ error: 'Código de IES inválido.' });
    }

    await ensureMecDataLoaded();
    const allMec = getMecByIes(parse.data);
    
    const campusMap = new Map();
    allMec.forEach(entry => {
      const id = entry.codLocal;
      const nome = entry.nomeLocal || `Campus ${id}`;
      if (id && !campusMap.has(id)) {
        campusMap.set(id, { codLocal: id.toString(), nomeLocal: nome });
      }
    });
    const campusList = Array.from(campusMap.values()).sort((a, b) => a.nomeLocal.localeCompare(b.nomeLocal));
    res.json(campusList);
  } catch (_error) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

const mecCursosParamsSchema = z.object({
  codIes: z.string().regex(/^\d+$/, 'Código IES deve ser numérico').max(10),
  codLocal: z.string().regex(/^\d+$/, 'Código Local deve ser numérico').max(10)
});

const mecQuerySchema = z.object({
  filtroGrau: z.string().max(50).optional()
});

mecRouter.get('/cursos/:codIes/:codLocal', async (req, res) => {
  try {
    const parseResult = mecCursosParamsSchema.safeParse(req.params);
    const queryParse = mecQuerySchema.safeParse(req.query);
    
    if (!parseResult.success || !queryParse.success) {
      return res.status(400).json({ error: 'Parâmetros de IES, Campus ou filtro inválidos.' });
    }

    await ensureMecDataLoaded();
    
    const { codIes, codLocal } = parseResult.data;
    const filtroGrau = queryParse.data?.filtroGrau;
    
    const allMec = getMecByIes(codIes);
    const cursoMap = new Map();
    
    allMec.forEach(entry => {
      const matchLocal = String(entry.codLocal) === String(codLocal);
      const matchGrau = !filtroGrau || String(entry.grauAcademico) === String(filtroGrau);
      
      if (matchLocal && matchGrau) {
        const id = entry.codCurso;
        const nome = entry.nomeCurso;
        if (id && nome && !cursoMap.has(id)) {
          cursoMap.set(id, { codCurso: id.toString(), nomeCurso: nome });
        }
      }
    });
    const cursoList = Array.from(cursoMap.values()).sort((a, b) => a.nomeCurso.localeCompare(b.nomeCurso));
    res.json(cursoList);
  } catch (_error) {
    res.status(500).json({ error: 'Erro interno' });
  }
});
