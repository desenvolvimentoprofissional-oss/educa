import { VagaCard } from "../components/showcase/VagaCard";
import { VagaDetalheModal } from "../components/ui/VagaDetalheModal";
import { VagasFilterBar } from "../components/showcase/VagasFilterBar";
import { InteresseVagaModal } from "../components/ui/InteresseVagaModal";
import { useVagasFilters } from "../hooks/useVagasFilters";
import { useVagasInteresse } from "../hooks/useVagasInteresse";
import { ConfirmationModal } from "../components/ui/ConfirmationModal";
import { SearchX, AlertCircle, X } from "lucide-react";
import { VAGAS_COLORS } from "../lib/vagasImages";
import { useImagensStore } from "../store/useImagensStore";

export function ExplorarVagas() {
  const filters = useVagasFilters();
  const { imagensPublicas } = useImagensStore();
  const {
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
  } = useVagasInteresse();

  return (
    <div className="w-full relative flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <VagasFilterBar
          filtroEmpresa={filters.filtroEmpresa}
          setFiltroEmpresa={filters.setFiltroEmpresa}
          empresas={filters.empresas}
          filtroTipoVaga={filters.filtroTipoVaga}
          setFiltroTipoVaga={filters.setFiltroTipoVaga}
          tiposDeVaga={filters.tiposDeVaga}
          filtroCidade={filters.filtroCidade}
          setFiltroCidade={filters.setFiltroCidade}
          cidades={filters.cidades}
          filtroBolsa={filters.filtroBolsa}
          setFiltroBolsa={filters.setFiltroBolsa}
          bolsasDisponiveis={filters.bolsasDisponiveis}
        />

        <div className="flex items-center">
          <span className="bg-gray-100 text-gray-700 rounded-full px-[16px] py-1.5 text-xs font-bold uppercase tracking-widest border border-gray-200">
            {filters.vagasFiltradas.length}{" "}
            {filters.vagasFiltradas.length === 1
              ? "RESULTADO ENCONTRADO"
              : "RESULTADOS ENCONTRADOS"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading && filters.vagasFiltradas.length === 0 ? (
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
            filters.vagasFiltradas.map((vaga, index) => {
              const displayColor = VAGAS_COLORS[index % VAGAS_COLORS.length];
              const hasImages = imagensPublicas && imagensPublicas.length > 0;
              const displayImage = hasImages ? imagensPublicas[index % imagensPublicas.length] : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
              return (
                <VagaCard
                  key={vaga.codigoDaVaga || index}
                  vaga={vaga}
                  isCandidatado={jornadaVagas.some(
                    (c) => c.vagaId === vaga.id && c.status !== "DESISTIU",
                  )}
                  loadingJornadaVaga={loadingVagaId === vaga.id}
                  onDetalhe={setVagaDetalhe}
                  onQueroConcorrer={handleQueroConcorrer}
                  parseBolsa={filters.parseBolsa}
                  displayColor={displayColor}
                  displayImage={displayImage}
                />
              );
            })
          )}
        </div>

        {filters.vagasFiltradas.length === 0 && !loading && (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-gray-50 border-2 border-dashed border-gray-300 mt-8 rounded-[16px]">
            <SearchX className="w-12 h-12 text-gray-400 mb-4" aria-hidden="true" />
            <p className="uppercase tracking-widest text-sm font-bold text-gray-500">
              Nenhuma vaga atende aos filtros aplicados.
            </p>
          </div>
        )}
      </div>

      {vagaDetalhe && (
        <VagaDetalheModal
          vagaDetalhe={vagaDetalhe}
          isCandidatado={jornadaVagas.some(
            (c) => c.vagaId === vagaDetalhe.id && c.status !== "DESISTIU",
          )}
          loadingJornadaVaga={loadingVagaId === vagaDetalhe.id}
          onClose={() => setVagaDetalhe(null)}
          onQueroConcorrer={handleQueroConcorrer}
        />
      )}

      {vagaInteresse && (
        <InteresseVagaModal
          vagaInteresse={vagaInteresse}
          onClose={() => setVagaInteresse(null)}
          onOpenPortal={() => setWaitingReturnForVagaId(vagaInteresse.id)}
        />
      )}

      {returnModalConfig && (
        <ConfirmationModal
          isOpen={returnModalConfig.isOpen}
          variant="success"
          title="Jornada Realizada?"
          description="Bem-vindo de volta! Conseguiu finalizar sua inscrição no portal da vaga?"
          cancelText="Ainda não"
          confirmText="Sim, já estou participando!"
          onCancel={handleCancelReturn}
          onConfirm={() => handleConfirmReturn(returnModalConfig.jornadaVagaId)}
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
