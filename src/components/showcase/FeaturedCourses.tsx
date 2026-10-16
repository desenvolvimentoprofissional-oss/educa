import { useHomeStore } from '../../store/useHomeStore';
import { ChevronRight, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigationStore } from '../../store/useNavigationStore';
import { useImagensStore } from '../../store/useImagensStore';
import { getVagaImageFallback } from '../../lib/vagasImages';
import { optimizeImageUrl, formatCargaHoraria, getInstitutionLogo } from '../../lib/formatters';

export function FeaturedCourses() {
  const { user, setIsLoginOpen } = useAuthStore();
  const { setActiveTab } = useNavigationStore();
  const { cursosDestaque: destaques, loading, instituicoes } = useHomeStore();
  const { imagensPublicas } = useImagensStore();

  const handleNavigateCursos = () => {
    if (user) {
      setActiveTab('cursos');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsLoginOpen(true);
    }
  };

  if (loading) {
    return (
      <section className="bg-[#f9fafb] pt-16 md:pt-20 pb-12 min-h-[500px]">
        <div className="max-w-[1152px] mx-auto px-[16px]">
          <h2 className="text-xl font-bold text-[#111827] mb-6">Encontre seu curso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-[16px] h-96 border border-gray-100 p-4 flex flex-col justify-between animate-pulse">
                <div className="h-44 bg-gray-200 rounded-[12px]" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mt-4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (destaques.length === 0) return null;

  return (
    <section className="bg-[#f9fafb] pt-16 md:pt-20 pb-12 min-h-[500px]">
      <div className="max-w-[1152px] mx-auto px-[16px]">
        <h2 className="text-xl font-bold text-[#111827] mb-6">Encontre seu curso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {destaques.map((curso, index) => {
            const imageUrl = curso.image || getVagaImageFallback(curso.id, imagensPublicas);
            const logoParceiro = getInstitutionLogo(instituicoes, curso.instituicaoCooperada);
            const titulo = curso.titulo || curso.tituloEditado || 'Curso sem título';
            const area = curso.nomeCineRotulo || curso.area || 'Conhecimento';
            const apresentacao = curso.apresentacao || curso.objetivo || 'Descrição não disponível para este curso. Inscreva-se para descobrir mais detalhes sobre a trilha de conhecimento.';
            
            return (
              <button 
                type="button"
                key={curso.id || index}
                className="flex flex-col text-left w-full h-full bg-[#ffffff] border border-[#f3f4f6] rounded-[16px] overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer group hc-white"
                onClick={handleNavigateCursos}
              >
                <div className="relative w-full aspect-video shrink-0 bg-gray-100 overflow-hidden min-h-0">
                  <img 
                    src={optimizeImageUrl(imageUrl, 400, 260)} 
                    alt=""
                    width="400" height="225" loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col flex-grow p-[20px]">
                  <div className="flex items-center gap-[8px] mb-[12px]">
                    <div className="w-[14px] h-[14px] rounded-full border-2 border-[#2563eb] bg-transparent shrink-0" />
                    <span className="text-xs font-medium text-[#374151] truncate">
                      {area}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#111827] line-clamp-2 min-h-[54px]">
                    {titulo}
                  </h3>
                  <p className="mt-2 mb-4 text-sm text-[#374151] line-clamp-3">
                    {apresentacao}
                  </p>
                  
                  <div className="pt-3 border-t border-gray-100 flex flex-row-reverse justify-between items-center mt-auto">
                    {logoParceiro ? (
                      <img 
                        src={logoParceiro} 
                        alt={curso.instituicaoCooperada} 
                        width="100"
                        height="28"
                        decoding="async"
                        className="hc-invert"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-gray-500 truncate max-w-[60%]">
                        {curso.instituicaoCooperada || 'Instituição participante'}
                      </span>
                    )}
                    
                    {curso.cargaHoraria && (
                      <div className="flex items-center text-xs text-gray-500 gap-1.5 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-medium">{formatCargaHoraria(curso.cargaHoraria)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex justify-center mt-8">
          <button 
            onClick={handleNavigateCursos}
            className="flex items-center justify-center rounded-full bg-[rgba(239,246,255,0.5)] border border-[#dbeafe] py-[10px] px-6 text-sm font-medium text-[#1e40af] transition-colors hover:bg-[#eff6ff] hc-border hc-no-underline"
          >
            Ver mais cursos
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
}
