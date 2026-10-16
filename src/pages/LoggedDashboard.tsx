import { useEffect } from 'react';
import { useNavigationStore } from '../store/useNavigationStore';
import { ExplorarCursos } from './ExplorarCursos';
import { ExplorarVagas } from './ExplorarVagas';
import { JornadaCursosInicio } from './JornadaCursosInicio';
import { MinhasConquistas } from './MinhasConquistas';

export function LoggedDashboard() {
  const { activeTab } = useNavigationStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  return (
    <div className="bg-[#f9fafb] text-gray-900 min-h-screen">
      <div className="w-full max-w-[1152px] mx-auto px-[16px] py-8">
        {activeTab === 'inicio' && <JornadaCursosInicio />}

        {activeTab === 'dados' && (
          <div className="border border-black p-12 text-center mt-4 rounded-xl">
            <h2 className="text-2xl font-black uppercase mb-4 tracking-tight">Meus Dados</h2>
            <p className="uppercase tracking-widest text-sm font-bold">Gestão de perfil estará disponível em breve.</p>
          </div>
        )}

        {activeTab === 'cursos' && <ExplorarCursos />}

        {activeTab === 'vagas' && <ExplorarVagas />}

        {activeTab === 'conquistas' && <MinhasConquistas />}
      </div>
    </div>
  );
}
