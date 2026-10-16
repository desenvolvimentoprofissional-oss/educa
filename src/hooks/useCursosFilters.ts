import { useState, useMemo, useEffect } from 'react';
import { useCursosStore, Curso } from '../store/useCursosStore';

export function useCursosFilters() {
  const cursos = useCursosStore((s) => s.cursos);

  const [filtroInstituicao, setFiltroInstituicao] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [filtroCarga, setFiltroCarga] = useState("");

  useEffect(() => {
    setFiltroArea("");
    setFiltroCarga("");
  }, [filtroInstituicao]);

  useEffect(() => {
    setFiltroCarga("");
  }, [filtroArea]);

  const parseHoras = (val: string | number | undefined | null) => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return Math.floor(val);
    const match = String(val).match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const getRange = (horas: number) => {
    if (horas <= 4) return "ate_4";
    if (horas <= 12) return "ate_12";
    if (horas <= 20) return "ate_20";
    if (horas <= 40) return "ate_40";
    if (horas <= 80) return "ate_80";
    return "acima_80";
  };

  const instituicoes = useMemo<readonly string[]>(() => {
    const set = new Set<string>();
    cursos.forEach((c) => {
      if (c.instituicaoCooperada) set.add(String(c.instituicaoCooperada).trim().toUpperCase());
    });
    return Array.from(set).sort();
  }, [cursos]);

  const areas = useMemo<readonly string[]>(() => {
    const set = new Set<string>();
    cursos.forEach((c) => {
      if (filtroInstituicao && String(c.instituicaoCooperada || '').trim().toUpperCase() !== filtroInstituicao) return;
      const areaVal = c.nomeCineRotulo || c.area;
      if (areaVal) set.add(String(areaVal).trim().toUpperCase());
    });
    return Array.from(set).sort();
  }, [cursos, filtroInstituicao]);

  const cursosFiltradosInstituicao = useMemo(
    () =>
      cursos.filter(
        (c) =>
          !filtroInstituicao || String(c.instituicaoCooperada || '').trim().toUpperCase() === filtroInstituicao,
      ),
    [cursos, filtroInstituicao],
  );

  const cursosFiltradosArea = useMemo(
    () =>
      cursosFiltradosInstituicao.filter(
        (c) => !filtroArea || String(c.nomeCineRotulo || c.area || '').trim().toUpperCase() === filtroArea,
      ),
    [cursosFiltradosInstituicao, filtroArea],
  );

  const cargasDisponiveis = useMemo<ReadonlySet<string>>(() => {
    const ranges = new Set<string>();
    cursosFiltradosArea.forEach((c) => {
      const h = parseHoras(c.cargaHoraria);
      ranges.add(getRange(h));
    });
    return ranges;
  }, [cursosFiltradosArea]);

  const cursosFiltrados = useMemo<readonly Curso[]>(() => {
    return cursosFiltradosArea.filter((curso) => {
      if (!filtroCarga) return true;
      const h = parseHoras(curso.cargaHoraria);
      return getRange(h) === filtroCarga;
    });
  }, [cursosFiltradosArea, filtroCarga]);

  return {
    filtroInstituicao, setFiltroInstituicao,
    filtroArea, setFiltroArea,
    filtroCarga, setFiltroCarga,
    instituicoes, areas, cargasDisponiveis,
    cursosFiltrados
  } as const;
}
