import { Award, ChevronRight } from 'lucide-react';
import { useNavigationStore } from '../../store/useNavigationStore';
import { AtualizacaoCadastralAccordion } from './acesso-rapido/AtualizacaoCadastralAccordion';
import { CentralAjudaAccordion } from './acesso-rapido/CentralAjudaAccordion';

export function AcessoRapido() {
  const { setActiveTab } = useNavigationStore();

  return (
    <section className="flex flex-col gap-6 mt-12 w-full">
      <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-2 mb-6">
        <h2 className="text-xl font-bold text-[#111827]">
          Acesso Rápido
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <button 
          onClick={() => setActiveTab('conquistas')}
          className="bg-white border border-[#e5e7eb] rounded-[16px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full text-left overflow-hidden relative group"
        >
          <div className="flex items-center gap-4 p-[24px] pb-4 border-b border-gray-100 w-full relative z-10">
            <div className="w-12 h-[48px] rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-[24px]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1f2937]">
                Minhas Conquistas
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Certificados e badges
              </p>
            </div>
          </div>
          <div className="p-[24px] flex flex-col items-center justify-center flex-1 relative z-10 bg-gray-50/30">
             <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 mb-4 group-hover:scale-110 transition-transform duration-300">
               <Award className="w-8 h-8 text-amber-500" strokeWidth={1.5} />
             </div>
             <p className="text-sm font-medium text-gray-600 text-center max-w-[200px]">
               Acesse sua galeria oficial de certificados e méritos.
             </p>
          </div>
          <div className="px-[24px] py-[16px] flex items-center justify-between mt-auto w-full group relative z-10 border-t border-gray-100 bg-white">
            <span className="text-sm font-semibold text-amber-600 group-hover:underline">Abrir galeria</span>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
          </div>
        </button>

        <AtualizacaoCadastralAccordion 
          isOpen={true} 
          onToggle={() => {}} 
        />
        <CentralAjudaAccordion 
          isOpen={true} 
          onToggle={() => {}} 
        />
      </div>
    </section>
  );
}
