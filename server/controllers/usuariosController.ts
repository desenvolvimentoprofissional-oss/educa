import { Response } from 'express';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { saveToVault } from '../services/vault.ts';
import { encryptSensitiveData } from '../services/crypto.ts';
import { processProfileSecurityData, isUserProfileComplete } from '../utils/sanitizers.ts';
import { incrementMetadadosCache, getAllCursosEntries } from '../services/cache.ts';
import { sanitizeLogText } from '../utils/logSanitizer.ts';

export const checarPerfil = async (uid: string, res: Response) => {
  const db = getFirestore();
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    const userDoc = await db.collection('usuarios').doc(uid).get();
    if (!userDoc.exists) return res.json({ profileComplete: false });
    const userData = userDoc.data();
    if (isUserProfileComplete(userData)) {
      const { nome, uf, registroCRA, areaAtuacao, semestre, ies, formacao, emailContato, curso, campus } = userData || {};
      const rawJornadaCursos = userData?.jornadaCursos || [];
      const cursosCache = getAllCursosEntries();
      const jornadaCursos = rawJornadaCursos.map((j: any) => {
        if (!j.cursoSnapshot?.titulo && !j.cursoSnapshot?.tituloEditado) {
          const match = cursosCache.find((c: any) => c.id === j.cursoId);
          if (match) {
            const resolvedTitle = match.titulo || match.tituloEditado || '';
            return {
              ...j,
              cursoSnapshot: {
                ...j.cursoSnapshot,
                titulo: resolvedTitle,
                tituloEditado: match.tituloEditado || resolvedTitle,
                instituicaoCooperada: j.cursoSnapshot?.instituicaoCooperada || match.instituicaoCooperada || '',
                image: j.cursoSnapshot?.image || match.image || null,
                linkDoCurso: j.cursoSnapshot?.linkDoCurso || match.linkDoCurso || match.link || null
              }
            };
          }
        }
        return j;
      });
      return res.json({ 
        profileComplete: true,
        data: { nome, uf, registroCRA, areaAtuacao, semestre, ies, formacao, emailContato, curso, campus, jornadaCursos, jornadaVagas: userData?.jornadaVagas || [], statusCarteira: userData?.statusCarteira || null }
      });
    }
    res.json({ profileComplete: false });
  } catch {
    console.error('Erro ao verificar perfil.');
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const atualizarStatusCarteira = async (uid: string, res: Response) => {
  const db = getFirestore();
  try {
    const userRef = db.collection('usuarios').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists || !isUserProfileComplete(userDoc.data())) {
      return res.status(403).json({ error: 'Conclua seu cadastro antes de atualizar o status da carteira.' });
    }
    await userRef.set({ statusCarteira: 'JA_TENHO' }, { merge: true });
    res.json({ success: true, message: 'Status atualizado com sucesso' });
  } catch {
    console.error('Erro ao atualizar status carteira.');
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const sanitizeFormulaInput = (input: string | null | undefined): string | null => {
  if (!input) return null;
  const clean = input.trim().replace(/<[^>]*>?/gm, '');
  if (/^[=@+\-\t\r]/.test(clean)) {
    return `'${clean}`;
  }
  return clean;
};

export const atualizarPerfil = async (uid: string, email: string | undefined, data: any, res: Response) => {
  const db = getFirestore();
  try {
    const isOutraArea = data.formacao === 'Profissional de outra área' || data.formacao === 'Estudante de outra área';
    const isEstudanteAdm = String(data.formacao || '').startsWith('Estudante de Administração');
    const secData = await processProfileSecurityData(uid, data.cpf, data.celular, email);
    const userData = {
      uid, emailHash: secData.emailHash, nome: data.nome.trim(), uf: data.uf, registroCRA: data.registroCRA, comoSoube: data.comoSoube,
      formacao: data.formacao,
      areaAtuacao: isOutraArea ? (data.areaAtuacao || null) : null,
      semestre: isEstudanteAdm ? (data.semestre || null) : null,
      ies: isEstudanteAdm ? sanitizeFormulaInput(data.ies) : null,
      campus: isEstudanteAdm ? sanitizeFormulaInput(data.campus) : null,
      curso: isEstudanteAdm ? sanitizeFormulaInput(data.curso) : null,
      cadastroManualIes: isEstudanteAdm ? !!data.cadastroManualIes : false,
      lgpdAceite: data.lgpd, cpfHash: secData.cpfHash, celularHash: secData.celularHash,
      globalCpfHash: secData.globalCpfHash, updatedAt: FieldValue.serverTimestamp()
    };
    
    const userRef = db.collection('usuarios').doc(uid);

    const { shouldIncrementUsuario } = await db.runTransaction(async (t) => {
      const userDocTransaction = await t.get(userRef);
      const dataExistente = userDocTransaction.data();
      
      if (dataExistente?.cpfHash) {
        throw new Error('USER_ALREADY_EXISTS');
      }
      
      const cpfIndexRef = db.collection('cpfs_indexados').doc(secData.globalCpfHash);
      const cpfIndexDoc = await t.get(cpfIndexRef);
      
      if (cpfIndexDoc.exists) {
        throw new Error('CPF_DUPLICATE');
      }
      
      t.set(cpfIndexRef, { uid, createdAt: FieldValue.serverTimestamp() });
      t.set(userRef, { ...userData, profileComplete: true }, { merge: true });
      
      const incrementUser = !dataExistente || !dataExistente.profileComplete;
      if (incrementUser) {
        t.set(db.collection('paginaPublica').doc('parte1'), { metadados: { totalUsuarios: FieldValue.increment(1) } }, { merge: true });
      }
      return { shouldIncrementUsuario: incrementUser };
    });

    if (shouldIncrementUsuario) {
      incrementMetadadosCache(1, 0);
    }
    res.json({ success: true, message: 'Perfil salvo com segurança!' });

    saveToVault({
      uid,
      nome: userData.nome,
      email: email ? encryptSensitiveData(email) : null,
      cpf: encryptSensitiveData(secData.cleanCpf),
      celular: encryptSensitiveData(secData.cleanCelular),
      uf: userData.uf,
      registroCRA: userData.registroCRA,
      comoSoube: userData.comoSoube,
      formacao: userData.formacao,
      areaAtuacao: userData.areaAtuacao,
      semestre: userData.semestre,
      ies: userData.ies,
      campus: userData.campus,
      curso: userData.curso,
      lgpdAceite: userData.lgpdAceite,
      origem: 'CRA-SP Educa (Cadastro Inicial)'
    }).catch(err => console.error('[AppSec CRA-SP ALERTA VAULT] Erro não bloqueante ao salvar no Cofre:', sanitizeLogText(err)));

  } catch (error: any) {
    if (error.message === 'USER_ALREADY_EXISTS') return res.status(403).json({ error: 'Cadastro já realizado. Os dados são imutáveis.' });
    if (error.message === 'CPF_DUPLICATE') return res.status(409).json({ error: 'Este CPF já está cadastrado em outra conta.' });
    console.error('Erro ao salvar perfil:', sanitizeLogText(error));
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


