import { useState, useEffect } from "react";
import { useVagasStore, Vaga } from "../store/useVagasStore";
import { useJornadaVagasStore } from "../store/useJornadaVagasStore";
import { getAuthSessionSnapshot, isAuthSessionCurrent } from "../store/useAuthStore";
import { api } from "../api";

export function useVagasInteresse() {
  const vagas = useVagasStore((s) => s.vagas);
  const loading = useVagasStore((s) => s.loading);
  const fetchVagas = useVagasStore((s) => s.fetchVagas);

  const jornadaVagas = useJornadaVagasStore((s) => s.jornadaVagas);

  const addJornadaVagaLocal = useJornadaVagasStore((s) => s.addJornadaVagaLocal);
  const updateJornadaVagaLocal = useJornadaVagasStore((s) => s.updateJornadaVagaLocal);

  const [vagaDetalhe, setVagaDetalhe] = useState<Vaga | null>(null);
  const [vagaInteresse, setVagaInteresse] = useState<Vaga | null>(null);
  const [loadingVagaId, setLoadingVagaId] = useState<string | null>(null);

  const [waitingReturnForVagaId, setWaitingReturnForVagaId] = useState<string | null>(() => sessionStorage.getItem('crasp_waitingReturnForVagaId'));
  const [activeJornadaVagaId, setActiveJornadaVagaId] = useState<string | null>(() => sessionStorage.getItem('crasp_activeJornadaVagaId'));

  useEffect(() => {
    if (waitingReturnForVagaId) sessionStorage.setItem('crasp_waitingReturnForVagaId', waitingReturnForVagaId);
    else sessionStorage.removeItem('crasp_waitingReturnForVagaId');
  }, [waitingReturnForVagaId]);

  useEffect(() => {
    if (activeJornadaVagaId) sessionStorage.setItem('crasp_activeJornadaVagaId', activeJornadaVagaId);
    else sessionStorage.removeItem('crasp_activeJornadaVagaId');
  }, [activeJornadaVagaId]);

  const [returnModalConfig, setReturnModalConfig] = useState<{
    isOpen: boolean;
    jornadaVagaId: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQueroConcorrer = async (vaga: Vaga) => {
    if (!vaga.id) return;
    const sessionSnap = getAuthSessionSnapshot();
    setLoadingVagaId(vaga.id);
    try {
      const vagaSnapshot = {
        tituloEditado: vaga.areaProfissional || "",
        nomeDaEmpresa: vaga.nomeDaEmpresa || "Confidencial",
        instituicaoCooperada: vaga.instituicaoCooperada || "",
        bolsaAuxilioExata: vaga.bolsaAuxilioExata,
        image: vaga.image || undefined,
        linkDeInscricao: vaga.linkDeInscricao || undefined,
        localidade: vaga.localidade || undefined,
        tipoDeVaga: vaga.tipoDeVaga || undefined
      };

      const resp = await api.jornadaVagas.criar(vaga.id, vagaSnapshot);
      if (!isAuthSessionCurrent(sessionSnap)) return;

      addJornadaVagaLocal({
        id: vaga.id,
        vagaId: vaga.id,
        vagaSnapshot,
        status: resp.status,
      });

      setActiveJornadaVagaId(vaga.id);
      setVagaInteresse(vaga);
      if (vagaDetalhe) {
        setVagaDetalhe(null);
      }
    } catch (error) {
      if (!isAuthSessionCurrent(sessionSnap)) return;
      console.error(error);
      setErrorMessage("Não foi possível processar sua participação neste momento. Tente novamente mais tarde.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      if (isAuthSessionCurrent(sessionSnap)) {
        setLoadingVagaId(null);
      }
    }
  };

  useEffect(() => {
    fetchVagas();
  }, [fetchVagas]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && waitingReturnForVagaId && activeJornadaVagaId) {
        setReturnModalConfig({ isOpen: true, jornadaVagaId: activeJornadaVagaId });

        setWaitingReturnForVagaId(null);
        setActiveJornadaVagaId(null);
        setVagaInteresse(null);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [waitingReturnForVagaId, activeJornadaVagaId]);

  const handleConfirmReturn = async (jornadaVagaId: string) => {
    const sessionSnap = getAuthSessionSnapshot();
    setReturnModalConfig(null);
    updateJornadaVagaLocal(jornadaVagaId, "CANDIDATADO");

    try {
      await api.jornadaVagas.atualizarStatus(jornadaVagaId, "CANDIDATADO");
    } catch (error) {
      console.error(error);
      if (isAuthSessionCurrent(sessionSnap)) {
        updateJornadaVagaLocal(jornadaVagaId, "PRE_CANDIDATADO");
      }
    }
  };

  const handleCancelReturn = () => {
    setReturnModalConfig(null);
  };

  return {
    vagas,
    loading,
    jornadaVagas,
    vagaDetalhe,
    setVagaDetalhe,
    vagaInteresse,
    setVagaInteresse,
    loadingVagaId,
    setWaitingReturnForVagaId,
    handleQueroConcorrer,
    returnModalConfig,
    handleConfirmReturn,
    handleCancelReturn,
    errorMessage,
    setErrorMessage
  };
}
