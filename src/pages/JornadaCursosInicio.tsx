import { useRef, useState } from "react";
import { api } from "../api";
import {
  useAuthStore,
  AuthSessionSnapshot,
  getAuthSessionSnapshot,
  isAuthSessionCurrent,
} from "../store/useAuthStore";
import { useJornadaCursosStore, JornadaCurso } from "../store/useJornadaCursosStore";
import { useJornadaVagasStore } from "../store/useJornadaVagasStore";
import { ChevronRight, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useNavigationStore } from "../store/useNavigationStore";
import { ListaJornadaCursos } from "../components/showcase/ListaJornadaCursos";
import { ListaJornadaVagas } from "../components/showcase/ListaJornadaVagas";
import { AcessoRapido } from "../components/showcase/AcessoRapido";
import { UploadCertificadoModal } from "../components/ui/UploadCertificadoModal";
import { JornadaCursosKpis } from "../components/showcase/JornadaCursosKpis";
import { CarteiraEstudanteHero } from "../components/showcase/CarteiraEstudanteHero";

export function JornadaCursosInicio() {
  const { user, userData } = useAuthStore();
  const setActiveTab = useNavigationStore((s) => s.setActiveTab);
  const jornadaCursos = useJornadaCursosStore((s) => s.jornadaCursos);
  const updateJornadaCursoLocal = useJornadaCursosStore((s) => s.updateJornadaCursoLocal);
  const jornadaVagas = useJornadaVagasStore((s) => s.jornadaVagas);
  const updateJornadaVagaLocal = useJornadaVagasStore((s) => s.updateJornadaVagaLocal);

  const [evaluatingJornadaCurso, setEvaluatingJornadaCurso] = useState<JornadaCurso | null>(
    null,
  );
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dismissedCarteiraHero, setDismissedCarteiraHero] = useState(false);
  const evaluationOpIdRef = useRef(0);

  const handleSetEvaluatingJornada = (jornada: JornadaCurso | null) => {
    evaluationOpIdRef.current += 1;
    setEvaluatingJornadaCurso(jornada);
  };

  const handleUpdateJornadaVagaStatus = async (
    vagaId: string,
    newStatus: string,
  ) => {
    const sessionSnap = getAuthSessionSnapshot();
    const previous = jornadaVagas.find((c) => c.vagaId === vagaId);
    const previousStatus = previous?.status;

    updateJornadaVagaLocal(vagaId, newStatus as any);

    try {
      await api.jornadaVagas.atualizarStatus(vagaId, newStatus);
    } catch (error) {
      if (!isAuthSessionCurrent(sessionSnap)) return;
      console.error(error);
      if (previousStatus) updateJornadaVagaLocal(vagaId, previousStatus as any);
      setErrorMessage("Falha de conexão. A ação foi revertida para sua segurança.");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleUpdateStatus = async (cursoId: string, newStatus: string) => {
    const sessionSnap = getAuthSessionSnapshot();
    const previousJornadaCurso = jornadaCursos.find((j) => j.cursoId === cursoId);
    const previousStatus = previousJornadaCurso?.status;

    updateJornadaCursoLocal(cursoId, newStatus as any);

    try {
      await api.jornadaCursos.atualizarStatus(cursoId, newStatus);
    } catch (error) {
      if (!isAuthSessionCurrent(sessionSnap)) return;
      console.error(error);
      if (previousStatus) updateJornadaCursoLocal(cursoId, previousStatus as any);
      setErrorMessage("Falha de conexão. A ação foi revertida para sua segurança.");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleSubmitEvaluation = async (
    file: File | null,
    evalData: { notaCurso?: number; notaPlataforma?: number; notaMaterial?: number; comentario?: string },
    originSession?: AuthSessionSnapshot,
    onFileUploaded?: () => void,
  ) => {
    if (!evaluatingJornadaCurso) return;
    const sessionSnap = originSession || getAuthSessionSnapshot();
    if (!isAuthSessionCurrent(sessionSnap)) return;

    const currentOpId = ++evaluationOpIdRef.current;
    const targetCursoId = evaluatingJornadaCurso.cursoId;
    const targetStatus = evaluatingJornadaCurso.status;

    try {
      let url = evaluatingJornadaCurso.certificadoUrl;
      if (file) {
        url = await api.certificados.enviar(targetCursoId, file);
        if (!isAuthSessionCurrent(sessionSnap) || evaluationOpIdRef.current !== currentOpId) {
          return;
        }
        updateJornadaCursoLocal(targetCursoId, targetStatus, {
          certificadoUrl: url,
          avaliacao: evalData,
        });
        setEvaluatingJornadaCurso((prev) =>
          prev && prev.cursoId === targetCursoId
            ? { ...prev, certificadoUrl: url, avaliacao: evalData }
            : prev
        );
        onFileUploaded?.();
      }

      if (!url) {
        throw new Error("Selecione um certificado válido antes de enviar.");
      }

      if (!isAuthSessionCurrent(sessionSnap) || evaluationOpIdRef.current !== currentOpId) {
        return;
      }

      await api.jornadaCursos.atualizarStatus(targetCursoId, "EM_ANALISE", {
        certificadoUrl: url,
        avaliacao: evalData,
      });
      if (!isAuthSessionCurrent(sessionSnap) || evaluationOpIdRef.current !== currentOpId) {
        return;
      }

      updateJornadaCursoLocal(targetCursoId, "EM_ANALISE", {
        certificadoUrl: url,
        avaliacao: evalData,
      });
      setEvaluatingJornadaCurso((prev) => (prev && prev.cursoId === targetCursoId ? null : prev));
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (error: any) {
      if (!isAuthSessionCurrent(sessionSnap) || evaluationOpIdRef.current !== currentOpId) {
        return;
      }
      console.error(error);
      setErrorMessage(error.message || "Erro ao enviar o certificado.");
      setTimeout(() => setErrorMessage(null), 5000);
      throw error;
    }
  };

  const firstName = userData?.nome?.split(" ")[0] || user?.displayName?.split(" ")[0] || "Profissional";
  
  const showCarteiraHero = userData?.formacao?.startsWith('Estudante de Administração') 
                           && userData?.uf === 'SP' 
                           && userData?.statusCarteira !== 'JA_TENHO' 
                           && !dismissedCarteiraHero;

  return (
    <div className="flex flex-col gap-12">
      {showCarteiraHero ? (
        <CarteiraEstudanteHero 
          firstName={firstName} 
          onDismissSession={() => setDismissedCarteiraHero(true)} 
        />
      ) : (
        <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] p-[24px] sm:p-[32px] lg:p-[40px] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),_0_4px_6px_-4px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center gap-[24px] justify-between">
          <div 
            className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5"
            style={{ transform: 'translateY(-50%) translateX(33.333333%)' }}
          />
          <div 
            className="absolute bottom-0 right-32 w-48 h-48 rounded-full bg-white/5"
            style={{ transform: 'translateY(33.333333%) translateX(25%)' }}
          />

          <div className="relative z-10 w-full flex flex-col justify-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white mb-2">
              Olá, {firstName}!
            </h1>
            <p className="text-[16px] lg:text-lg text-[#dbeafe] leading-relaxed max-w-2xl mb-6">
              Mantenha o status das suas matrículas, certificados e processos seletivos atualizado para receber recomendações de cursos e vagas sob medida para o seu momento.
            </p>

            <div className="flex flex-col sm:flex-row gap-[12px]">
              <button 
                onClick={() => setActiveTab('cursos')}
                className="group inline-flex items-center justify-center gap-[8px] w-full sm:w-auto rounded-full bg-yellow-500 border border-transparent text-black py-2.5 px-6 text-sm font-semibold transition-colors hover:bg-yellow-400"
              >
                Explorar Cursos
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
              <button 
                onClick={() => setActiveTab('vagas')}
                className="group inline-flex items-center justify-center gap-[8px] w-full sm:w-auto rounded-full bg-transparent border border-white/40 text-white py-2.5 px-6 text-sm font-semibold transition-colors hover:bg-white/10 hover:border-white/60"
              >
                Explorar Vagas
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      <JornadaCursosKpis jornadaCursos={jornadaCursos} />

      <div className="flex flex-col gap-12 w-full">
        <ListaJornadaCursos
          jornadaCursos={jornadaCursos}
          handleUpdateStatus={handleUpdateStatus}
          setEvaluatingJornada={handleSetEvaluatingJornada}
        />
        
        {jornadaVagas && jornadaVagas.length > 0 && (
          <ListaJornadaVagas
            jornadaVagas={jornadaVagas}
            handleUpdateJornadaVagaStatus={handleUpdateJornadaVagaStatus}
          />
        )}

        <AcessoRapido />
      </div>

      {evaluatingJornadaCurso && (
        <UploadCertificadoModal
          onClose={() => handleSetEvaluatingJornada(null)}
          existingCertificadoUrl={evaluatingJornadaCurso.certificadoUrl}
          existingAvaliacao={evaluatingJornadaCurso.avaliacao}
          onSubmit={handleSubmitEvaluation}
        />
      )}

      {uploadSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 bg-green-50 border border-green-200 text-green-800 px-6 py-[16px] rounded-xl shadow-lg flex items-start gap-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-5"
        >
          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" aria-hidden="true" />
          <div className="flex flex-col">
            <h4 className="font-bold text-sm">Certificado Enviado</h4>
            <p className="text-sm mt-1 opacity-90">Recebemos seu certificado com sucesso! O CRA-SP fará a análise em breve.</p>
          </div>
          <button
            type="button"
            aria-label="Fechar notificação de sucesso"
            onClick={() => setUploadSuccess(false)}
            className="text-green-600 hover:text-green-800 transition-colors ml-auto"
          >
            <X className="w-5 h-[20px]" aria-hidden="true" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-6 right-6 bg-red-50 border border-red-200 text-red-800 px-6 py-[16px] rounded-xl shadow-lg flex items-start gap-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-5"
        >
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0" aria-hidden="true" />
          <div className="flex flex-col">
            <h4 className="font-bold text-sm">Ops, ocorreu um erro</h4>
            <p className="text-sm mt-1 opacity-90">{errorMessage}</p>
          </div>
          <button
            type="button"
            aria-label="Fechar notificação de erro"
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-800 transition-colors ml-auto"
          >
            <X className="w-5 h-[20px]" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
