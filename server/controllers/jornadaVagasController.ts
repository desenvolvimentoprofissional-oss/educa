import { Response } from 'express';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { incrementMetadadosCache } from '../services/cache.ts';
import { ensureVagasDataLoaded, getAllVagasEntries } from '../services/cache.ts';
import { sanitizeLogText } from '../utils/logSanitizer.ts';
import { isUserProfileComplete } from '../utils/sanitizers.ts';

const MAX_ARRAY_LIMIT = 150;


export const criarJornadaVaga = async (uid: string, data: { vagaId: string; vagaSnapshot?: Partial<import('../../src/types/catalog').VagaCatalogo> }, res: Response) => {
  const db = getFirestore();
  try {
    const { vagaId } = data;
    
    await ensureVagasDataLoaded();
    const vagaOficial = getAllVagasEntries().find((v: any) => (v.id || v.codigoDaVaga) === vagaId);

    if (!vagaOficial) {
      return res.status(404).json({ error: 'Vaga não localizada no catálogo oficial.' });
    }

    const vagaSnapshotSeguro = {
      tituloEditado: vagaOficial.tituloEditado || '',
      nomeDaEmpresa: vagaOficial.nomeDaEmpresa || '',
      nomeDaEmpresa1: vagaOficial.nomeDaEmpresa1 || '',
      instituicaoCooperada: vagaOficial.instituicaoCooperada || '',
      tipoDeVaga: vagaOficial.tipoDeVaga || '',
      cidade: vagaOficial.cidade || '',
      bolsaAuxilioExata: vagaOficial.bolsaAuxilioExata || '',
      salarioExato: vagaOficial.salarioExato || '',
      tipoAuxilioBolsa: vagaOficial.tipoAuxilioBolsa || '',
      codigoDaVaga: vagaOficial.codigoDaVaga || vagaId,
      image: vagaOficial.image || null,
      imageUrl: vagaOficial.imageUrl || null,
      linkDeInscricao: vagaOficial.linkDeInscricao || null
    };

    const docRef = db.collection('usuarios').doc(uid);

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists || !isUserProfileComplete(doc.data())) {
        throw new Error('PROFILE_INCOMPLETE');
      }

      const jornadaVagasArray = doc.data()?.jornadaVagas || [];
      const jornadaExistenteIndex = jornadaVagasArray.findIndex((c: any) => c.vagaId === vagaId);

      if (jornadaExistenteIndex !== -1) {
        const jornadaExistente = jornadaVagasArray[jornadaExistenteIndex];
        if (jornadaExistente.status === 'DESISTIU') {
          jornadaExistente.status = 'PRE_CANDIDATADO';
          jornadaExistente.updatedAt = new Date().toISOString();
          jornadaExistente.vagaSnapshot = vagaSnapshotSeguro;
          jornadaVagasArray[jornadaExistenteIndex] = jornadaExistente;
        } else {
          throw new Error('ALREADY_EXISTS');
        }
      } else {
        if (jornadaVagasArray.length >= MAX_ARRAY_LIMIT) {
          throw new Error('LIMIT_EXCEEDED');
        }
        const novaJornadaVaga = {
          id: vagaId, 
          vagaId,
          vagaSnapshot: vagaSnapshotSeguro,
          status: 'PRE_CANDIDATADO',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        jornadaVagasArray.push(novaJornadaVaga);
      }
      transaction.set(docRef, { jornadaVagas: jornadaVagasArray }, { merge: true });
    });

    res.json({ success: true, status: 'PRE_CANDIDATADO' });

  } catch (error: any) {
    if (error.message === 'PROFILE_INCOMPLETE') {
      return res.status(403).json({ error: 'Conclua seu cadastro antes de participar de vagas.' });
    }
    if (error.message === 'LIMIT_EXCEEDED') {
      return res.status(429).json({ error: 'Limite de jornadaVagas atingido.' });
    }
    if (error.message === 'ALREADY_EXISTS') {
      return res.status(409).json({ error: 'Você já possui uma jornadaVaga ativa para esta vaga.' });
    }
    console.error('[AppSec Log Seguro] Falha em criarJornadaVaga:', sanitizeLogText(error));
    res.status(500).json({ error: 'Erro interno ao processar requisição.' });
  }
};

export const atualizarStatusJornadaVaga = async (uid: string, vagaId: string, data: { status?: string }, res: Response) => {
  const db = getFirestore();
  try {
    const { status } = data;

    const docRef = db.collection('usuarios').doc(uid);

    const { shouldIncrementContratado } = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);

      if (!doc.exists || !isUserProfileComplete(doc.data())) {
        throw new Error('PROFILE_INCOMPLETE');
      }

      const jornadaVagasArray = doc.data()?.jornadaVagas || [];
      const jornadaVagaIndex = jornadaVagasArray.findIndex((c: any) => c.vagaId === vagaId);

      if (jornadaVagaIndex === -1) {
        throw new Error('NOT_FOUND');
      }

      const jornadaVaga = jornadaVagasArray[jornadaVagaIndex];
      const currentStatus = jornadaVaga.status || 'PRE_CANDIDATADO';

      if (currentStatus === status) {
        throw new Error('ALREADY_UPDATED');
      }

      const ALLOWED_JORNADA_VAGA_TRANSITIONS = new Map<string, string[]>([
        ['PRE_CANDIDATADO', ['CANDIDATADO', 'DESISTIU']],
        ['CANDIDATADO', ['NAO_FOI_DESTA_VEZ', 'DESISTIU', 'CONTRATADO']],
        ['NAO_FOI_DESTA_VEZ', []],
        ['CONTRATADO', []],
        ['DESISTIU', ['PRE_CANDIDATADO', 'CANDIDATADO']]
      ]);

      if (!status || !ALLOWED_JORNADA_VAGA_TRANSITIONS.get(currentStatus)?.includes(status)) {
        throw new Error('INVALID_TRANSITION');
      }

      const isFirstContratado = status === 'CONTRATADO' && currentStatus !== 'CONTRATADO' && !jornadaVaga.contratadoAt;

      jornadaVaga.status = status;
      jornadaVaga.updatedAt = new Date().toISOString();

      if (status === 'CANDIDATADO' && currentStatus !== 'CANDIDATADO') jornadaVaga.candidatadoAt = new Date().toISOString();
      if (status === 'NAO_FOI_DESTA_VEZ' && currentStatus !== 'NAO_FOI_DESTA_VEZ') jornadaVaga.naoFoiDestaVezAt = new Date().toISOString();
      if (status === 'DESISTIU' && currentStatus !== 'DESISTIU') jornadaVaga.desistiuAt = new Date().toISOString();
      if (status === 'CONTRATADO' && currentStatus !== 'CONTRATADO') {
        if (!jornadaVaga.contratadoAt) {
          jornadaVaga.contratadoAt = new Date().toISOString();
        }
      }

      jornadaVagasArray[jornadaVagaIndex] = jornadaVaga;

      if (isFirstContratado) {
        const statsRef = db.collection('paginaPublica').doc('parte1');
        transaction.set(statsRef, { metadados: { totalContratados: FieldValue.increment(1) } }, { merge: true });
      }

      transaction.set(docRef, { jornadaVagas: jornadaVagasArray }, { merge: true });
      return { shouldIncrementContratado: isFirstContratado };
    });

    if (shouldIncrementContratado) incrementMetadadosCache(0, 0, 1);
    res.json({ success: true, message: 'Status atualizado' });

  } catch (error: any) {
    if (error.message === 'PROFILE_INCOMPLETE') return res.status(403).json({ error: 'Conclua seu cadastro antes de atualizar sua participação.' });
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Jornada (Vaga) não encontrada' });
    if (error.message === 'ALREADY_UPDATED') return res.json({ success: true, message: 'Status já atualizado.' });
    if (error.message === 'INVALID_TRANSITION') return res.status(400).json({ error: `Transição ilegítima de status.` });

    console.error('[AppSec Log Seguro] Erro ao atualizar status da jornadaVaga:', sanitizeLogText(error));
    res.status(500).json({ error: 'Erro interno ao processar requisição.' });
  }
};
