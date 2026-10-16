import { VitrineCard } from "../components/showcase/VitrineCard";
import { CursoDetalheModal } from "../components/ui/CursoDetalheModal";
import { CursosFilterBar } from "../components/showcase/CursosFilterBar";
import { PreMatriculaCursoModal } from "../components/ui/PreMatriculaCursoModal";
import { useCursosFilters } from "../hooks/useCursosFilters";
import { useCursosPreMatricula } from "../hooks/useCursosPreMatricula";
import { ConfirmationModal } from "../components/ui/ConfirmationModal";
import { SearchX, AlertCircle, X } from "lucide-react";

export function ExplorarCursos() {
  const filters = useCursosFilters();
  const {
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
  } = useCursosPreMatricula();

  return (
    <div className="w-full relative flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <CursosFilterBar
          filtroInstituicao={filters.filtroInstituicao}
          setFiltroInstituicao={filters.setFiltroInstituicao}
          instituicoes={filters.instituicoes}
          filtroArea={filters.filtroArea}
          setFiltroArea={filters.setFiltroArea}
          areas={filters.areas}
          filtroCarga={filters.filtroCarga}
          setFiltroCarga={filters.setFiltroCarga}
          cargasDisponiveis={filters.cargasDisponiveis}
        />

        <div className="flex items-center">
          <span className="bg-gray-100 text-gray-700 rounded-full px-[16px] py-1.5 text-xs font-bold uppercase tracking-widest border border-gray-200">
            {filters.cursosFiltrados.length}{" "}
            {filters.cursosFiltrados.length === 1
              ? "RESULTADO ENCONTRADO"
              : "RESULTADOS ENCONTRADOS"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading && filters.cursosFiltrados.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#f3f4f6] rounded-[16px] p-6 shadow-sm animate-pulse h-[300px] flex flex-col justify-between">
                <div className="flex flex-col gap-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-10 bg-gray-200 rounded-full w-24"></div>
                  <div className="h-10 bg-gray-200 rounded-full w-24"></div>
                </div>
              </div>
            ))
          ) : (
            filters.cursosFiltrados.map((curso, index) => (
              <VitrineCard
                key={curso.id || index}
                curso={curso}
                isInscrito={jornadaCursos.some(
                  (j) => j.cursoId === curso.id && j.status !== "DESISTIU",
                )}
                loadingMatricula={loadingCursoId === curso.id}
                onDetalhe={setCursoDetalhe}
                onPreMatricula={handlePreMatricula}
              />
            ))
          )}
        </div>

        {filters.cursosFiltrados.length === 0 && !loading && (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-gray-50 border-2 border-dashed border-gray-300 mt-8 rounded-[16px]">
            <SearchX className="w-12 h-12 text-gray-400 mb-4" aria-hidden="true" />
            <p className="uppercase tracking-widest text-sm font-bold text-gray-500">
              Nenhum curso atende aos filtros aplicados.
            </p>
          </div>
        )}
      </div>

      {cursoDetalhe && (
        <CursoDetalheModal
          cursoDetalhe={cursoDetalhe}
          isInscrito={jornadaCursos.some(
            (j) => j.cursoId === cursoDetalhe.id && j.status !== "DESISTIU",
          )}
          loadingMatricula={loadingCursoId === cursoDetalhe.id}
          onClose={() => setCursoDetalhe(null)}
          onPreMatricula={handlePreMatricula}
        />
      )}

      {cursoMatricula && (
        <PreMatriculaCursoModal
          cursoMatricula={cursoMatricula}
          onClose={() => setCursoMatricula(null)}
          onOpenAva={() => setWaitingReturnForCursoId(cursoMatricula.id)}
        />
      )}

      {returnModalConfig && (
        <ConfirmationModal
          isOpen={returnModalConfig.isOpen}
          variant="success"
          title="Matrícula Efetuada?"
          description="Bem-vindo de volta! E aí, conseguiu realizar a matrícula no Ambiente da Instituição Participante?"
          cancelText="Ainda não"
          confirmText="Sim, me matriculei!"
          onCancel={handleCancelReturn}
          onConfirm={() => handleConfirmReturn(returnModalConfig.jornadaId)}
        />
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
