import { getFirestore, FieldValue, type Firestore, type DocumentReference } from 'firebase-admin/firestore';
import { getApp, type App } from 'firebase-admin/app';
import crypto from 'crypto';
import { sanitizeLogText } from '../utils/logSanitizer.ts';

const MAX_PARTE_BYTES = 900 * 1024;

let vaultWriteChain: Promise<void> = Promise.resolve();

function enqueueVaultWrite<T>(task: () => Promise<T>): Promise<T> {
  const next = vaultWriteChain.then(task, task);
  vaultWriteChain = next.then(() => undefined, () => undefined);
  return next;
}

function computeNextVaultState(data: Record<string, unknown> | undefined, itemBytes: number) {
  let parteAtual = Number(data?.parteAtual) || 1;
  let bytesAcumulados = Number(data?.bytesAcumulados) || 0;
  const totalRegistros = Number(data?.totalRegistros) || 0;

  if (bytesAcumulados + itemBytes > MAX_PARTE_BYTES) {
    parteAtual += 1;
    bytesAcumulados = 0;
  }

  return {
    parteAtual,
    bytesAcumulados: bytesAcumulados + itemBytes,
    totalRegistros: totalRegistros + 1
  };
}

async function commitVaultRecord(
  db: Firestore,
  usuariosCol: FirebaseFirestore.CollectionReference,
  controleRef: DocumentReference,
  registro: Record<string, unknown>,
  itemBytes: number
): Promise<void> {
  const nowIso = new Date().toISOString();

  if (typeof db.runTransaction === 'function') {
    await db.runTransaction(async (transaction) => {
      const controleDoc = await transaction.get(controleRef);
      const next = computeNextVaultState(controleDoc.exists ? controleDoc.data() : undefined, itemBytes);
      const parteDocRef = usuariosCol.doc(`parte${next.parteAtual}`);

      transaction.set(parteDocRef, {
        registros: FieldValue.arrayUnion(registro),
        ultimaAtualizacao: nowIso
      }, { merge: true });

      transaction.set(controleRef, {
        ...next,
        ultimaAtualizacao: nowIso
      }, { merge: true });
    });
    return;
  }

  const controleDoc = await controleRef.get();
  const next = computeNextVaultState(controleDoc.exists ? controleDoc.data() : undefined, itemBytes);
  const parteDocRef = usuariosCol.doc(`parte${next.parteAtual}`);
  const batch = db.batch();

  batch.set(parteDocRef, {
    registros: FieldValue.arrayUnion(registro),
    ultimaAtualizacao: nowIso
  }, { merge: true });

  batch.set(controleRef, {
    ...next,
    ultimaAtualizacao: nowIso
  }, { merge: true });

  await batch.commit();
}

export async function saveToVault(payload: Record<string, unknown>): Promise<void> {
  let vaultApp: App;
  try {
    vaultApp = getApp('vaultProject');
  } catch {
    console.warn('[Cofre/Vault] Instância vaultProject não configurada no ambiente.');
    return;
  }

  const db = getFirestore(vaultApp);
  const usuariosCol = db.collection('usuarios');
  const controleRef = usuariosCol.doc('_controle');

  const registro: Record<string, unknown> = {
    ...payload,
    id: (typeof payload.uid === 'string' && payload.uid) ? payload.uid : crypto.randomUUID(),
    timestamp: (typeof payload.timestamp === 'string' && payload.timestamp) ? payload.timestamp : new Date().toISOString()
  };

  const itemBytes = Buffer.byteLength(JSON.stringify(registro), 'utf8');

  try {
    await enqueueVaultWrite(() => commitVaultRecord(db, usuariosCol, controleRef, registro, itemBytes));
  } catch (err) {
    console.error('[AppSec CRA-SP ALERTA VAULT] Falha na gravação em lote (batch) no Cofre:', sanitizeLogText(err));
    throw err;
  }
}

