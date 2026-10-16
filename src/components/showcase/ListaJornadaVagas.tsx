import { JornadaVagaCard } from "./JornadaVagaCard";
import { ChevronRight } from "lucide-react";
import { useNavigationStore } from "../../store/useNavigationStore";

export type ListaJornadaVagasProps = Readonly<{
  jornadaVagas: any[];
  handleUpdateJornadaVagaStatus: (id: string, newStatus: string) => Promise<void>;
}>;

export function ListaJornadaVagas({
  jornadaVagas,
  handleUpdateJornadaVagaStatus,
}: ListaJornadaVagasProps) {
  const { setActiveTab } = useNavigationStore();
  const jornadaVagasVisiveis = [...jornadaVagas]
    .filter((j) => !['NAO_FOI_DESTA_VEZ', 'CONTRATADO', 'DESISTIU'].includes(j.status))
    .sort((a, b) => {
      const empresaA = (a.vagaSnapshot?.nomeDaEmpresa || "").toLowerCase();
      const empresaB = (b.vagaSnapshot?.nomeDaEmpresa || "").toLowerCase();
      return empresaA.localeCompare(empresaB);
    });

  if (jornadaVagasVisiveis.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-2 mb-6">
        <h2 className="text-xl font-bold text-[#111827]">
          Minhas Vagas
        </h2>
        <button 
          onClick={() => setActiveTab('vagas')}
          className="flex items-center gap-1 text-sm font-medium text-[#2563eb] hover:underline"
        >
          Explorar vagas
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {jornadaVagasVisiveis.map((jornadaVaga, index) => (
          <JornadaVagaCard
            key={jornadaVaga.id}
            jornadaVaga={jornadaVaga}
            vagaSnapshot={jornadaVaga.vagaSnapshot || {}}
            onUpdateStatus={handleUpdateJornadaVagaStatus}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
