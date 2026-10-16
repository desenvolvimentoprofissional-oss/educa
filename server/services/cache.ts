import { getFirestore } from 'firebase-admin/firestore';
import { sanitizeLogText } from '../utils/logSanitizer.ts';

let allMecEntries: any[] = [];
let mecIndexByIes = new Map<string, any[]>();
let loadMecDataPromise: Promise<void> | null = null;
let allCursosEntries: any[] = [];
let loadCursosPromise: Promise<void> | null = null;
let allVagasEntries: any[] = [];
let loadVagasPromise: Promise<void> | null = null;

let paginaPublicaCache: any = null;
let loadPaginaPublicaPromise: Promise<void> | null = null;

export async function loadPaginaPublica() {
  const db = getFirestore();
  console.log('[CACHE] Iniciando carregamento da Página Pública (1 Leitura)...');
  try {
    const doc = await db.collection('paginaPublica').doc('parte1').get();
    if (doc.exists) {
      paginaPublicaCache = doc.data();
      console.log('[CACHE] Sucesso: Página Pública materializada carregada em RAM.');
    } else {
      console.warn('[CACHE] Aviso: Documento paginaPublica/parte1 não encontrado.');
      paginaPublicaCache = {};
    }
  } catch (error) {
    console.error('[CACHE] Erro ao carregar Página Pública:', sanitizeLogText(error));
    paginaPublicaCache = {};
    loadPaginaPublicaPromise = null;
  }
}

export async function loadMecData() {
  const db = getFirestore();
  console.log('Iniciando carregamento dos dados do e-MEC para o cache...');
  try {
    const snapshot = await db.collection('catalogoIes').select('ies').get();
    const entries: any[] = [];
    snapshot.forEach(doc => {
      if (doc.id.startsWith('parte')) {
        const data = doc.data();
        if (data.ies && Array.isArray(data.ies)) {
          entries.push(...data.ies);
        }
      }
    });
    allMecEntries = entries;
    
    const index = new Map<string, any[]>();
    entries.forEach(entry => {
      const key = String(entry.codIes);
      if (!index.has(key)) index.set(key, []);
      index.get(key)!.push(entry);
    });
    mecIndexByIes = index;

    console.log(`Sucesso: ${allMecEntries.length} cursos do MEC carregados em memória (Indexados).`);
  } catch (error) {
    console.error('Erro ao carregar dados do MEC:', sanitizeLogText(error));
    loadMecDataPromise = null;
  }
}

export async function loadCursosData() {
  const db = getFirestore();
  console.log('Iniciando carregamento dos dados de Cursos para o cache (Lazy Load)...');
  try {
    const snapshot = await db.collection('catalogoCursos').select('cursos').get();
    const entries: any[] = [];
    snapshot.forEach(doc => {
      if (doc.id.startsWith('parte')) {
        const data = doc.data();
        if (data.cursos && Array.isArray(data.cursos)) {
          entries.push(...data.cursos);
        }
      }
    });
    allCursosEntries = entries;
    console.log(`Sucesso: ${allCursosEntries.length} cursos carregados em memória.`);
  } catch (error) {
    console.error('Erro ao carregar dados de Cursos:', sanitizeLogText(error));
    loadCursosPromise = null;
  }
}

export async function loadVagasData() {
  const db = getFirestore();
  console.log('Iniciando carregamento dos dados de Vagas para o cache (Lazy Load)...');
  try {
    const snapshot = await db.collection('catalogoVagas').select('vagas').get();
    const entries: any[] = [];
    snapshot.forEach(doc => {
      if (doc.id.startsWith('parte')) {
        const data = doc.data();
        if (data.vagas && Array.isArray(data.vagas)) {
          entries.push(...data.vagas);
        }
      }
    });
    allVagasEntries = entries;
    console.log(`Sucesso: ${allVagasEntries.length} vagas carregadas em memória.`);
  } catch (error) {
    console.error('Erro ao carregar dados de Vagas:', sanitizeLogText(error));
    loadVagasPromise = null;
  }
}

export function ensureMecDataLoaded(): Promise<void> {
  if (!loadMecDataPromise) loadMecDataPromise = loadMecData();
  return loadMecDataPromise;
}

export function ensureCursosDataLoaded(): Promise<void> {
  if (!loadCursosPromise) loadCursosPromise = loadCursosData();
  return loadCursosPromise;
}

export function ensureVagasDataLoaded(): Promise<void> {
  if (!loadVagasPromise) loadVagasPromise = loadVagasData();
  return loadVagasPromise;
}

const CACHE_TTL_MS = 30 * 60 * 1000;
let lastLoadTime = 0;

export function ensurePaginaPublicaLoaded(): Promise<void> {
  const now = Date.now();
  if (!loadPaginaPublicaPromise || (now - lastLoadTime > CACHE_TTL_MS)) {
    lastLoadTime = now;
    loadPaginaPublicaPromise = loadPaginaPublica();
  }
  return loadPaginaPublicaPromise;
}

let isCacheInitialized = false;

export async function initCache() {
  if (isCacheInitialized) {
    console.log('[CACHE LEAK PREVENTED] initCache() chamado, mas já inicializado. Abortando nova leitura.');
    return;
  }
  
  console.log('[CACHE] Iniciando inicialização otimizada (Cold Start de 1 leitura)...');
  isCacheInitialized = true;
  lastLoadTime = Date.now();
  
  loadPaginaPublicaPromise = loadPaginaPublica();
  await loadPaginaPublicaPromise;
  
  console.log('[CACHE] Página inicial carregada com sucesso do Firestore para a memória RAM.');
}

export function incrementMetadadosCache(usuariosInc: number, matriculasInc: number, contratadosInc: number = 0) {
  if (paginaPublicaCache && paginaPublicaCache.metadados) {
    paginaPublicaCache.metadados.totalUsuarios = (paginaPublicaCache.metadados.totalUsuarios || 0) + usuariosInc;
    paginaPublicaCache.metadados.totalMatriculas = (paginaPublicaCache.metadados.totalMatriculas || 0) + matriculasInc;
    paginaPublicaCache.metadados.totalContratados = (paginaPublicaCache.metadados.totalContratados || 0) + contratadosInc;
    console.log(`[CACHE] Metadados em RAM atualizados (+${usuariosInc} usuarios, +${matriculasInc} matriculas, +${contratadosInc} contratados).`);
  }
}

export function getPaginaPublicaCache() { return paginaPublicaCache; }
export function getAllMecEntries() { return allMecEntries; }
export function getAllCursosEntries() { return allCursosEntries; }
export function getAllVagasEntries() { return allVagasEntries; }

export function getMecByIes(codIes: string) { return mecIndexByIes.get(String(codIes)) || []; }
