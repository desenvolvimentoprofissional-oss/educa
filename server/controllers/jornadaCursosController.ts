import { Response } from 'express';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { incrementMetadadosCache, ensureCursosDataLoaded, getAllCursosEntries, getPaginaPublicaCache } from '../services/cache.ts';
import { getStorage } from 'firebase-admin/storage';
import crypto from 'crypto';
import { sanitizeLogText } from '../utils/logSanitizer.ts';
import { isUserProfileComplete } from '../utils/sanitizers.ts';

const MAX_ARRAY_LIMIT = 150;

export interface AvaliacaoCursoInput {
  notaCurso?: number;
  notaPlataforma?: number;
  notaMaterial?: number;
  comentario?: string;
}

const isValidRatingScore = (val: unknown): val is number =>
  typeof val === 'number' && Number.isInteger(val) && val >= 1 && val <= 5;

const isValidAvaliacaoObject = (av: any): av is { notaCurso: number; notaPlataforma: number; notaMaterial: number; comentario?: string } =>
  Boolean(av && typeof av === 'object' && isValidRatingScore(av.notaCurso) && isValidRatingScore(av.notaPlataforma) && isValidRatingScore(av.notaMaterial));

export const criarJornada = async (uid: string, data: { cursoId: string; cursoSnapshot?: Partial<import('../../src/types/catalog').CursoCatalogo> | null }, res: Response) => {
  const db = getFirestore();
  try {
    const { cursoId } = data;
    
    await ensureCursosDataLoaded();
    let cursoOficial = getAllCursosEntries().find((c: any) => c.id === cursoId);

    if (!cursoOficial) {
      const pubCache = getPaginaPublicaCache();
      if (pubCache && pubCache.vitrineCursos) {
        cursoOficial = pubCache.vitrineCursos.find((c: any) => c.id === cursoId);
      }
    }

    if (!cursoOficial) {
      return res.status(404).json({ error: 'Curso não localizado no catálogo oficial.' });
    }

    const cursoSnapshotSeguro = {
      titulo: cursoOficial.titulo || cursoOficial.tituloEditado || '',
      tituloEditado: cursoOficial.titulo || cursoOficial.tituloEditado || '',
      cargaHoraria: cursoOficial.cargaHoraria || '',
      instituicaoCooperada: cursoOficial.instituicaoCooperada || '',
      nomeCineRotulo: cursoOficial.nomeCineRotulo || cursoOficial.area || '',
      area: cursoOficial.nomeCineRotulo || cursoOficial.area || '',
      image: cursoOficial.image || null,
      linkDoCurso: cursoOficial.linkDoCurso || cursoOficial.link || cursoOficial.url || cursoOficial.site || cursoOficial.linkDeInscricao || null
    };
    
    const docRef = db.collection('usuarios').doc(uid);

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists || !isUserProfileComplete(doc.data())) {
        throw new Error('PROFILE_INCOMPLETE');
      }

      const jornadasArray = doc.data()?.jornadaCursos || [];
      const jornadaExistenteIndex = jornadasArray.findIndex((j: any) => j.cursoId === cursoId);

      if (jornadaExistenteIndex !== -1) {
        const jornadaExistente = jornadasArray[jornadaExistenteIndex];
        if (jornadaExistente.status === 'DESISTIU') {
          jornadaExistente.status = 'PRE_MATRICULADO';
          jornadaExistente.updatedAt = new Date().toISOString();
          jornadaExistente.cursoSnapshot = cursoSnapshotSeguro;
          jornadasArray[jornadaExistenteIndex] = jornadaExistente;
        } else {
          throw new Error('ALREADY_EXISTS');
        }
      } else {
        if (jornadasArray.length >= MAX_ARRAY_LIMIT) {
          throw new Error('LIMIT_EXCEEDED');
        }
        const novaJornada = {
          id: cursoId, 
          cursoId,
          cursoSnapshot: cursoSnapshotSeguro,
          status: 'PRE_MATRICULADO',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        jornadasArray.push(novaJornada);
      }
      transaction.set(docRef, { jornadaCursos: jornadasArray }, { merge: true });
    });

    res.json({ success: true, status: 'PRE_MATRICULADO' });

  } catch (error: any) {
    if (error.message === 'PROFILE_INCOMPLETE') {
      return res.status(403).json({ error: 'Conclua seu cadastro antes de iniciar uma jornada.' });
    }
    if (error.message === 'LIMIT_EXCEEDED') {
      return res.status(429).json({ error: 'Limite de inscrições atingido.' });
    }
    if (error.message === 'ALREADY_EXISTS') {
      return res.status(409).json({ error: 'Você já possui uma jornada ativa para este curso.' });
    }
    console.error('[AppSec Log Seguro] Falha em criarJornada:', sanitizeLogText(error));
    res.status(500).json({ error: 'Erro interno ao processar requisição.' });
  }
};

export const atualizarStatusJornada = async (uid: string, cursoId: string, data: { status?: string; certificadoUrl?: string; avaliacao?: AvaliacaoCursoInput | number }, res: Response) => {
  const db = getFirestore();
  try {
    const { status, certificadoUrl, avaliacao } = data;
    const docRef = db.collection('usuarios').doc(uid);

    if (certificadoUrl !== undefined && status !== 'EM_ANALISE') {
      return res.status(400).json({ error: 'O certificado só pode ser vinculado ao enviar o curso para análise.' });
    }

    const expectedCursoTag = crypto.createHash('sha256').update(String(cursoId)).digest('hex').slice(0, 16);

    if (status === 'EM_ANALISE') {
      const userDoc = await docRef.get();
      if (!userDoc.exists || !isUserProfileComplete(userDoc.data())) {
        return res.status(403).json({ error: 'Conclua seu cadastro antes de atualizar sua jornada.' });
      }
      const jornadasArray = userDoc.data()?.jornadaCursos || [];
      const jornada = jornadasArray.find((j: any) => j.cursoId === cursoId);
      const existingBoundUrl = typeof jornada?.certificadoUrl === 'string' ? jornada.certificadoUrl.trim() : '';
      const urlFinal = (certificadoUrl || existingBoundUrl).trim();

      if (!urlFinal) {
        return res.status(400).json({ error: 'É obrigatório anexar um certificado válido para enviar a jornada para análise.' });
      }

      const emUsoEmOutroCurso = jornadasArray.some((j: any) => j.cursoId !== cursoId && j.certificadoUrl === urlFinal);
      if (emUsoEmOutroCurso) {
        return res.status(400).json({ error: 'Este certificado já está vinculado a outro curso.' });
      }

      const fileName = urlFinal.split('/').pop() || '';
      const hasTagPrefix = /^[0-9a-f]{16}_\d+_/.test(fileName);
      const isLegacyAlreadyBound = Boolean(existingBoundUrl) && (!certificadoUrl || certificadoUrl === existingBoundUrl);

      if (hasTagPrefix && !fileName.startsWith(`${expectedCursoTag}_`)) {
        return res.status(400).json({ error: 'O certificado informado pertence a outro curso.' });
      }
      if (!hasTagPrefix && !isLegacyAlreadyBound) {
        return res.status(400).json({ error: 'Certificado sem vínculo válido com o curso selecionado.' });
      }

      try {
        const fileRef = getStorage().bucket().file(urlFinal);
        const [exists] = await fileRef.exists();
        if (!exists) return res.status(400).json({ error: 'Arquivo de certificado não encontrado no servidor de armazenamento.' });
        try {
          const [meta] = await fileRef.getMetadata();
          const metaCursoId = meta?.metadata?.cursoId;
          const metaCursoTag = meta?.metadata?.cursoTag;
          if ((metaCursoId && String(metaCursoId) !== String(cursoId)) || (metaCursoTag && String(metaCursoTag) !== expectedCursoTag)) {
            return res.status(400).json({ error: 'O certificado armazenado pertence a outro curso.' });
          }
        } catch {}
      } catch (storageErr) {
        console.error('[AppSec I/O] Falha ao verificar storage:', sanitizeLogText(storageErr));
        return res.status(400).json({ error: 'Caminho do certificado inválido ou inacessível.' });
      }
    }

    const { shouldIncrementMatricula } = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists || !isUserProfileComplete(doc.data())) throw new Error('PROFILE_INCOMPLETE');

      const jornadasArray = doc.data()?.jornadaCursos || [];
      const jornadaIndex = jornadasArray.findIndex((j: any) => j.cursoId === cursoId);
      if (jornadaIndex === -1) throw new Error('NOT_FOUND');

      const jornada = jornadasArray[jornadaIndex];
      const currentStatus = jornada.status || 'PRE_MATRICULADO';
      if (currentStatus === status) throw new Error('ALREADY_UPDATED');

      const ALLOWED_TRANSITIONS = new Map<string, string[]>([
        ['PRE_MATRICULADO', ['MATRICULADO', 'DESISTIU']],
        ['MATRICULADO', ['AGUARDANDO_CERTIFICADO', 'EM_ANALISE', 'DESISTIU']],
        ['AGUARDANDO_CERTIFICADO', ['EM_ANALISE', 'DESISTIU']],
        ['EM_ANALISE', ['MATRICULADO']],
        ['CONCLUIDO', []],
        ['DESISTIU', ['PRE_MATRICULADO', 'MATRICULADO']]
      ]);

      if (!status || !ALLOWED_TRANSITIONS.get(currentStatus)?.includes(status)) throw new Error('INVALID_TRANSITION');

      if (status === 'EM_ANALISE') {
        const existingBoundUrl = typeof jornada.certificadoUrl === 'string' ? jornada.certificadoUrl.trim() : '';
        const urlFinal = (certificadoUrl || existingBoundUrl).trim();
        if (!urlFinal) throw new Error('MISSING_CERTIFICATE_FILE');
        if (jornadasArray.some((j: any) => j.cursoId !== cursoId && j.certificadoUrl === urlFinal)) {
          throw new Error('CERTIFICATE_IN_USE');
        }
        const txFileName = urlFinal.split('/').pop() || '';
        const txHasTagPrefix = /^[0-9a-f]{16}_\d+_/.test(txFileName);
        const txIsLegacyBound = Boolean(existingBoundUrl) && (!certificadoUrl || certificadoUrl === existingBoundUrl);
        if ((txHasTagPrefix && !txFileName.startsWith(`${expectedCursoTag}_`)) || (!txHasTagPrefix && !txIsLegacyBound)) {
          throw new Error('INVALID_CERTIFICATE_BINDING');
        }
        const avaliacaoFinal = avaliacao ?? jornada.avaliacao;
        if (!isValidAvaliacaoObject(avaliacaoFinal)) {
          throw new Error('MISSING_VALID_EVALUATION');
        }
        jornada.certificadoUrl = urlFinal;
        jornada.avaliacao = {
          notaCurso: avaliacaoFinal.notaCurso,
          notaPlataforma: avaliacaoFinal.notaPlataforma,
          notaMaterial: avaliacaoFinal.notaMaterial,
          ...(avaliacaoFinal.comentario ? { comentario: String(avaliacaoFinal.comentario).slice(0, 500) } : {})
        };
      } else if (avaliacao && isValidAvaliacaoObject(avaliacao)) {
        jornada.avaliacao = avaliacao;
      }

      const isFirstMatricula = status === 'MATRICULADO' && currentStatus !== 'MATRICULADO' && !jornada.matriculadoAt;

      jornada.status = status;
      jornada.updatedAt = new Date().toISOString();

      if (status === 'MATRICULADO' && currentStatus !== 'MATRICULADO') {
        if (!jornada.matriculadoAt) {
          jornada.matriculadoAt = new Date().toISOString();
        }
      }
      if (status === 'EM_ANALISE' && currentStatus !== 'EM_ANALISE') jornada.certificadoEnviadoAt = new Date().toISOString();
      if (status === 'CONCLUIDO' && currentStatus !== 'CONCLUIDO') jornada.concluidoAt = new Date().toISOString();
      if (status === 'DESISTIU' && currentStatus !== 'DESISTIU') jornada.desistiuAt = new Date().toISOString();

      jornadasArray[jornadaIndex] = jornada;

      if (isFirstMatricula) {
        const statsRef = db.collection('paginaPublica').doc('parte1');
        transaction.set(statsRef, { metadados: { totalMatriculas: FieldValue.increment(1) } }, { merge: true });
      }

      transaction.set(docRef, { jornadaCursos: jornadasArray }, { merge: true });
      return { shouldIncrementMatricula: isFirstMatricula };
    });

    if (shouldIncrementMatricula) incrementMetadadosCache(0, 1);
    res.json({ success: true, message: 'Status atualizado' });
  } catch (error: any) {
    if (error.message === 'PROFILE_INCOMPLETE') return res.status(403).json({ error: 'Conclua seu cadastro antes de atualizar sua jornada.' });
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Jornada não encontrada' });
    if (error.message === 'ALREADY_UPDATED') return res.json({ success: true, message: 'Status já atualizado.' });
    if (error.message === 'INVALID_TRANSITION') return res.status(400).json({ error: 'Transição ilegítima de status.' });
    if (error.message === 'MISSING_CERTIFICATE_FILE') return res.status(400).json({ error: 'É obrigatório anexar um certificado válido para enviar a jornada para análise.' });
    if (error.message === 'MISSING_VALID_EVALUATION') return res.status(400).json({ error: 'É obrigatório avaliar o curso em todos os critérios antes de enviar para análise.' });
    if (error.message === 'CERTIFICATE_IN_USE') return res.status(400).json({ error: 'Este certificado já está vinculado a outro curso.' });
    if (error.message === 'INVALID_CERTIFICATE_BINDING') return res.status(400).json({ error: 'Certificado sem vínculo válido com o curso selecionado.' });

    console.error('[AppSec Log Seguro] Erro ao atualizar status da jornada:', sanitizeLogText(error));
    res.status(500).json({ error: 'Erro interno ao processar requisição.' });
  }
};