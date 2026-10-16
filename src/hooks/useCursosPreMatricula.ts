import { useState, useEffect } from "react";
import { useCursosStore, Curso } from "../store/useCursosStore";
import { useJornadaCursosStore } from "../store/useJornadaCursosStore";
import { getAuthSessionSnapshot, isAuthSessionCurrent } from "../store/useAuthStore";
import { api } from "../api";

export function useCursosPreMatricula() {
  const cursos = useCursosStore((s) => s.cursos);
  const loading = useCursosStore((s) => s.loading);
  const fetchCursos = useCursosStore((s) => s.fetchCursos);

  const jornadaCursos = useJornadaCursosStore((s) => s.jornadaCursos);

  const addJornadaCursoLocal = useJornadaCursosStore((s) => s.addJornadaCursoLocal);
  const updateJornadaCursoLocal = useJornadaCursosStore((s) => s.updateJornadaCursoLocal);

  const [cursoDetalhe, setCursoDetalhe] = useState<Curso | null>(null);
  const [cursoMatricula, setCursoMatricula] = useState<Curso | null>(null);
  const [loadingCursoId, setLoadingCursoId] = useState<string | null>(null);

  const [waitingReturnForCursoId, setWaitingReturnForCursoId] = useState<string | null>(() => sessionStorage.getItem('crasp_waitingReturnForCursoId'));
  const [activeJornadaId, setActiveJornadaId] = useState<string | null>(() => sessionStorage.getItem('crasp_activeJornadaId'));

  useEffect(() => {
    if (waitingReturnForCursoId) sessionStorage.setItem('crasp_waitingReturnForCursoId', waitingReturnForCursoId);
    else sessionStorage.removeItem('crasp_waitingReturnForCursoId');
  }, [waitingReturnForCursoId]);

  useEffect(() => {
    if (activeJornadaId) sessionStorage.setItem('crasp_activeJornadaId', activeJornadaId);
    else sessionStorage.removeItem('crasp_activeJornadaId');
  }, [activeJornadaId]);

  const [returnModalConfig, setReturnModalConfig] = useState<{
    isOpen: boolean;
    jornadaId: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePreMatricula = async (curso: Curso) => {
    if (!curso.id) {
      setErrorMessage("Este curso não possui um identificador válido (ID) no catálogo.");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }
    const sessionSnap = getAuthSessionSnapshot();
    setLoadingCursoId(curso.id);
    try {
      const tituloResolvido = curso.titulo || curso.tituloEditado || "";
      const cursoSnapshot = {
        titulo: tituloResolvido,
        tituloEditado: curso.tituloEditado || tituloResolvido,
        instituicaoCooperada: curso.instituicaoCooperada || "",
        area: curso.nomeCineRotulo || curso.area || "",
        cargaHoraria: curso.cargaHoraria?.toString(),
        image: curso.image || undefined,
        linkDoCurso: curso.linkDoCurso || curso.link || curso.url || curso.site || curso.linkDeInscricao || undefined
      };

      const resp = await api.jornadaCursos.criar(curso.id, cursoSnapshot);
      if (!isAuthSessionCurrent(sessionSnap)) return;

      addJornadaCursoLocal({
        id: curso.id,
        cursoId: curso.id,
        cursoSnapshot,
        status: resp.status,
      });

      setActiveJornadaId(curso.id);
      setCursoMatricula(curso);
      if (cursoDetalhe) {
        setCursoDetalhe(null);
      }
    } catch (error) {
      if (!isAuthSessionCurrent(sessionSnap)) return;
      console.error(error);
      setErrorMessage("Não foi possível realizar a pré-matrícula neste momento. Tente novamente mais tarde.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      if (isAuthSessionCurrent(sessionSnap)) {
        setLoadingCursoId(null);
      }
    }
  };

  useEffect(() => {
    fetchCursos();
  }, [fetchCursos]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && waitingReturnForCursoId && activeJornadaId) {

        setReturnModalConfig({ isOpen: true, jornadaId: activeJornadaId });

        setWaitingReturnForCursoId(null);
        setActiveJornadaId(null);
        setCursoMatricula(null);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [waitingReturnForCursoId, activeJornadaId]);

  const handleConfirmReturn = async (jornadaId: string) => {
    const sessionSnap = getAuthSessionSnapshot();
    setReturnModalConfig(null);
    updateJornadaCursoLocal(jornadaId, "MATRICULADO");

    try {
      await api.jornadaCursos.atualizarStatus(jornadaId, "MATRICULADO");
    } catch (error) {
      console.error(error);
      if (isAuthSessionCurrent(sessionSnap)) {
        updateJornadaCursoLocal(jornadaId, "PRE_MATRICULADO");
      }
    }
  };

  const handleCancelReturn = () => {
    setReturnModalConfig(null);
  };

  return {
    cursos,
    loading,
    jornadaCursos,
    cursoDetalhe,
    setCursoDetalhe,
    cursoMatricula,
    setCursoMatricula,
    loadingCursoId,
    setWaitingReturnForCursoId,
    handlePreMatricula,
    returnModalConfig,
    handleConfirmReturn,
    handleCancelReturn,
    errorMessage,
    setErrorMessage
  };
}
