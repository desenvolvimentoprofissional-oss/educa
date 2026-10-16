import { Response } from 'express';
import crypto from 'crypto';
import { sanitizeLogText } from '../utils/logSanitizer.ts';
import {
  ensurePaginaPublicaLoaded,
  getPaginaPublicaCache,
  ensureCursosDataLoaded,
  ensureVagasDataLoaded,
  getAllCursosEntries,
  getAllVagasEntries
} from '../services/cache.ts';

const secureShuffle = <T>(array: T[]): T[] => { 
  const result = [...array]; 
  for (let i = result.length - 1; i > 0; i--) { 
    const j = crypto.randomInt(0, i + 1); 
    const temp = result.at(i)!;
    result.splice(i, 1, result.at(j)!);
    result.splice(j, 1, temp);
  } 
  return result; 
};

export const getCursos = async (res: Response) => {
  await ensureCursosDataLoaded();
  res.json(getAllCursosEntries());
};

export const getVagas = async (res: Response) => {
  await ensureVagasDataLoaded();
  res.json(getAllVagasEntries());
};

export const getHomeStartup = async (res: Response) => {
  try {
    await ensurePaginaPublicaLoaded();
    const cache = getPaginaPublicaCache();
    
    if (!cache) {
      return res.status(500).json({ error: 'Cache da página pública indisponível' });
    }

    const cursos = cache.vitrineCursos || [];
    const vagas = cache.vitrineVagas || [];
    
    const shuffledCursos = secureShuffle(cursos);
    const uniqueInstituicoes = new Set<string>();
    const filteredCursos: any[] = [];
    
    for (const curso of shuffledCursos as any[]) {
      const instituicao = curso.instituicaoCooperada || curso.siglaInstituicao || 'default';
      
      if (!uniqueInstituicoes.has(instituicao)) {
        uniqueInstituicoes.add(instituicao);
        filteredCursos.push(curso);
      }
      if (filteredCursos.length === 3) break;
    }
    
    if (filteredCursos.length < 3) {
      for (const curso of shuffledCursos as any[]) {
        if (!filteredCursos.find((c: any) => c.id === curso.id)) {
          filteredCursos.push(curso);
        }
        if (filteredCursos.length === 3) break;
      }
    }

    const poolVagas = secureShuffle(vagas);
    const aprendizes = poolVagas.filter((v: any) => v.tipoDeVaga?.toUpperCase().includes('APRENDIZ'));
    const estagios = poolVagas.filter((v: any) => v.tipoDeVaga?.toUpperCase().includes('ESTAGIO') || v.tipoDeVaga?.toUpperCase().includes('ESTÁGIO'));
    const outros = poolVagas.filter((v: any) => !v.tipoDeVaga?.toUpperCase().includes('APRENDIZ') && !v.tipoDeVaga?.toUpperCase().includes('ESTAGIO') && !v.tipoDeVaga?.toUpperCase().includes('ESTÁGIO'));
    
    const selectedVagas: any[] = [];
    const usedEmpresas = new Set<string>();

    const addVagaIfUnique = (v: any) => {
      const empresa = v.nomeDaEmpresa || v.instituicaoCooperada || v.id;
      if (!usedEmpresas.has(empresa)) {
        usedEmpresas.add(empresa);
        selectedVagas.push(v);
        return true;
      }
      return false;
    };

    while (aprendizes.length > 0 && selectedVagas.length < 1) {
      addVagaIfUnique(aprendizes.shift());
    }

    while (estagios.length > 0 && selectedVagas.length < 3) {
      addVagaIfUnique(estagios.shift());
    }
    
    const combinedRest = [...aprendizes, ...estagios, ...outros] as any[];
    while (combinedRest.length > 0 && selectedVagas.length < 3) {
      addVagaIfUnique(combinedRest.shift());
    }

    const payload = {
      cursosDestaque: filteredCursos,
      vagasDestaque: selectedVagas,
      instituicoes: cache.instituicoesParticipantes || [],
      perguntas: cache.perguntasFrequentes || [],
      stats: {
        totalDeCursos: cache.metadados?.totalCursos || 0,
        totalDeVagas: cache.metadados?.totalVagas || 0
      }
    };

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(payload);
  } catch (error) {
    console.error('Erro na rota unificada home-startup:', sanitizeLogText(error));
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const getMetadadosTotais = async (res: Response) => {
  try {
    await ensurePaginaPublicaLoaded();
    const cache = getPaginaPublicaCache();
    
    if (!cache || !cache.metadados) {
      return res.json({ totalMatriculas: 0, totalUsuarios: 0, totalDeCursos: 0, totalDeVagas: 0 });
    }

    res.json({
      totalMatriculas: cache.metadados.totalMatriculas || 0,
      totalUsuarios: cache.metadados.totalUsuarios || 0,
      totalDeCursos: cache.metadados.totalCursos || 0,
      totalDeVagas: cache.metadados.totalVagas || 0
    });
  } catch (error) {
    console.error('Erro ao buscar metadados totais:', sanitizeLogText(error));
    res.status(500).json({ error: 'Erro interno' });
  }
};
