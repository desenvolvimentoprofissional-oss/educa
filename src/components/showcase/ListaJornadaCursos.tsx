import { JornadaCursoCard } from "./JornadaCursoCard";
import { ChevronRight, BookOpen } from "lucide-react";
import { useNavigationStore } from "../../store/useNavigationStore";

export type ListaJornadaCursosProps = Readonly<{
  jornadaCursos: any[];
  handleUpdateStatus: (id: string, newStatus: string) => Promise<void>;
  setEvaluatingJornada: (jornada: any) => void;
}>;

export function ListaJornadaCursos({
  jornadaCursos,
  handleUpdateStatus,
  setEvaluatingJornada,
}: ListaJornadaCursosProps) {
  const { setActiveTab } = useNavigationStore();
  const jornadasAtivas = [...jornadaCursos]
    .filter((j) => j.status !== "DESISTIU" && j.status !== "CONCLUIDO")
    .sort((a, b) => {
      const tituloA = (a.cursoSnapshot?.titulo || a.cursoSnapshot?.tituloEditado || "").toLowerCase();
      const tituloB = (b.cursoSnapshot?.titulo || b.cursoSnapshot?.tituloEditado || "").toLowerCase();
      return tituloA.localeCompare(tituloB);
    });

  return (
    <section>
      <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-2 mb-6">
        <h2 className="text-xl font-bold text-[#111827]">
          Meus Cursos
        </h2>
        <button 
          onClick={() => setActiveTab('cursos')}
          className="flex items-center gap-1 text-sm font-medium text-[#2563eb] hover:underline"
        >
          Explorar cursos
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {jornadasAtivas.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-[16px] py-12 flex flex-col items-center justify-center">
          <BookOpen className="w-12 h-12 text-gray-400 mb-4" strokeWidth={1.5} />
          <h3 className="text-base font-medium text-gray-500">
            Nenhum curso em andamento
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {jornadasAtivas.map((jornada) => (
            <JornadaCursoCard
              key={jornada.id}
              jornada={jornada}
              cursoSnapshot={jornada.cursoSnapshot || {}}
              onUpdateStatus={handleUpdateStatus}
              onEvaluate={setEvaluatingJornada}
            />
          ))}
        </div>
      )}
    </section>
  );
}
