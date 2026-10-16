import { useState, useMemo, useEffect } from 'react';
import { useVagasStore, Vaga } from '../store/useVagasStore';
import { useSearchStore } from '../store/useSearchStore';
import { parseMonetaryValue } from '../lib/formatters';

export function useVagasFilters() {
  const vagas = useVagasStore((s) => s.vagas);
  const { globalSearchTerm: searchTerm } = useSearchStore();
  
  const [filtroEmpresa, setFiltroEmpresa] = useState("");
  const [filtroTipoVaga, setFiltroTipoVaga] = useState("");
  const [filtroCidade, setFiltroCidade] = useState("");
  const [filtroBolsa, setFiltroBolsa] = useState("");

  useEffect(() => {
    setFiltroTipoVaga("");
    setFiltroCidade("");
    setFiltroBolsa("");
  }, [filtroEmpresa]);

  useEffect(() => {
    setFiltroCidade("");
    setFiltroBolsa("");
  }, [filtroTipoVaga]);

  useEffect(() => {
    setFiltroBolsa("");
  }, [filtroCidade]);

  const parseBolsa = (str: string | number | undefined) => parseMonetaryValue(str);

  const getBolsaRange = (valor: number) => {
    if (valor <= 500) return "ate_500";
    if (valor <= 1000) return "ate_1000";
    if (valor <= 1500) return "ate_1500";
    if (valor <= 2000) return "ate_2000";
    return "acima_2000";
  };

  const vagasFiltradasText = useMemo(() => {
    if (!searchTerm) return vagas;
    const lowerSearch = searchTerm.toLowerCase();
    return vagas.filter((v) => {
      const tipo = (v.tipoDeVaga || '').toLowerCase();
      const empresa = (v.nomeDaEmpresa || '').toLowerCase();
      const nivel = (v.nivelEscolar || '').toLowerCase();
      const desc = (v.descricao || '').toLowerCase();
      const ativ = (v.atividades || '').toLowerCase();
      
      return tipo.includes(lowerSearch) || 
             empresa.includes(lowerSearch) || 
             nivel.includes(lowerSearch) || 
             desc.includes(lowerSearch) || 
             ativ.includes(lowerSearch);
    });
  }, [vagas, searchTerm]);

  const empresas = useMemo<readonly string[]>(() => {
    const set = new Set<string>();
    vagasFiltradasText.forEach((v) => {
      if (v.instituicaoCooperada) set.add(v.instituicaoCooperada.trim().toUpperCase());
    });
    return Array.from(set).sort();
  }, [vagasFiltradasText]);

  const vagasFiltradasEmpresa = useMemo(
    () =>
      vagasFiltradasText.filter((v) => !filtroEmpresa || v.instituicaoCooperada?.trim().toUpperCase() === filtroEmpresa),
    [vagasFiltradasText, filtroEmpresa],
  );

  const tiposDeVaga = useMemo<readonly string[]>(() => {
    const set = new Set<string>();
    vagasFiltradasEmpresa.forEach((v) => {
      if (v.tipoDeVaga) set.add(v.tipoDeVaga.trim().toUpperCase());
    });
    return Array.from(set).sort();
  }, [vagasFiltradasEmpresa]);

  const vagasFiltradasTipo = useMemo(
    () =>
      vagasFiltradasEmpresa.filter((v) => !filtroTipoVaga || v.tipoDeVaga?.trim().toUpperCase() === filtroTipoVaga),
    [vagasFiltradasEmpresa, filtroTipoVaga],
  );

  const cidades = useMemo<readonly string[]>(() => {
    const set = new Set<string>();
    vagasFiltradasTipo.forEach((v) => {
      if (v.cidade) set.add(v.cidade.trim().toUpperCase());
    });
    return Array.from(set).sort();
  }, [vagasFiltradasTipo]);

  const vagasFiltradasCidade = useMemo(
    () =>
      vagasFiltradasTipo.filter(
        (v) => !filtroCidade || v.cidade?.trim().toUpperCase() === filtroCidade,
      ),
    [vagasFiltradasTipo, filtroCidade],
  );

  const bolsasDisponiveis = useMemo<ReadonlySet<string>>(() => {
    const ranges = new Set<string>();
    vagasFiltradasCidade.forEach((v) => {
      const valBolsa = parseBolsa(v.bolsaAuxilioExata);
      const valSalario = parseBolsa(v.salarioExato);
      const val = valBolsa > 0 ? valBolsa : valSalario;
      if (val > 0) {
        ranges.add(getBolsaRange(val));
      }
    });
    return ranges;
  }, [vagasFiltradasCidade]);

  const vagasFiltradas = useMemo<readonly Vaga[]>(() => {
    return vagasFiltradasCidade.filter((vaga) => {
      if (!filtroBolsa) return true;
      const valBolsa = parseBolsa(vaga.bolsaAuxilioExata);
      const valSalario = parseBolsa(vaga.salarioExato);
      const val = valBolsa > 0 ? valBolsa : valSalario;
      return val > 0 && getBolsaRange(val) === filtroBolsa;
    });
  }, [vagasFiltradasCidade, filtroBolsa]);

  return {
    filtroEmpresa, setFiltroEmpresa,
    filtroTipoVaga, setFiltroTipoVaga,
    filtroCidade, setFiltroCidade,
    filtroBolsa, setFiltroBolsa,
    empresas, tiposDeVaga, cidades, bolsasDisponiveis,
    vagasFiltradas, parseBolsa
  } as const;
}
