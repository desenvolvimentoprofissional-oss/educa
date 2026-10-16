import { useHomeStore } from '../../store/useHomeStore';
import { ChevronRight, MapPin, Clock, DollarSign } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigationStore } from '../../store/useNavigationStore';
import { useImagensStore } from '../../store/useImagensStore';
import { getVagaImageFallback, getVagaColorFallback } from '../../lib/vagasImages';
import { formatTime, formatCurrency, parseMonetaryValue, optimizeImageUrl, getInstitutionLogo, mapNivelEscolar } from '../../lib/formatters';

const parseBolsa = (valor: any) => parseMonetaryValue(valor);


export function FeaturedVagas() {
  const { user, setIsLoginOpen } = useAuthStore();
  const { setActiveTab } = useNavigationStore();
  const { vagasDestaque: destaques, loading, instituicoes } = useHomeStore();
  const { imagensPublicas } = useImagensStore();

  const handleNavigateVagas = () => {
    if (user) {
      setActiveTab('vagas');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsLoginOpen(true);
    }
  };

  if (loading) {
    return (
      <section className="bg-white pt-16 md:pt-20 pb-12 min-h-[500px]">
        <div className="max-w-[1152px] mx-auto px-[16px]">
          <h2 className="text-xl font-bold text-[#111827] mb-6">Conquiste sua vaga</h2>
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
    <section className="bg-white pt-16 md:pt-20 pb-12 min-h-[500px]">
      <div className="max-w-[1152px] mx-auto px-[16px]">
        <h2 className="text-xl font-bold text-[#111827] mb-6">Conquiste sua vaga</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {destaques.map((vaga, index) => {
            const logoParceiro = getInstitutionLogo(instituicoes, vaga.instituicaoCooperada) || getInstitutionLogo(instituicoes, vaga.nomeDaEmpresa);

            return (
              <button 
                type="button"
                key={vaga.id || index}
                className="flex flex-col text-left w-full h-full bg-[#ffffff] border border-[#f3f4f6] rounded-[16px] overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer group hc-white"
                onClick={handleNavigateVagas}
              >
                <div 
                  className="relative w-full h-48 overflow-hidden flex shrink-0"
                  style={{ backgroundColor: getVagaColorFallback(vaga.codigoDaVaga || vaga.id) }}
                >
                  <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/10" />
                  <div className="absolute bottom-4 left-[30%] w-16 h-16 rounded-full border-4 border-white/10" />
                  
                  <div className="relative z-10 w-[55%] p-[20px] flex flex-col justify-center gap-[8px]">
                    <span className="text-white font-bold text-xl leading-snug drop-shadow-md capitalize mb-2">
                      {vaga.tipoDeVaga ? vaga.tipoDeVaga.toLowerCase() : 'Oportunidade'}
                    </span>
                    {vaga.cidade && (
                      <div className="flex items-center text-white/90 text-xs font-medium gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{vaga.cidade}</span>
                      </div>
                    )}
                    {vaga.horarioEntrada && vaga.horarioSaida && (
                      <div className="flex items-center text-white/90 text-xs font-medium gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {formatTime(vaga.horarioEntrada)} às {formatTime(vaga.horarioSaida)}
                        </span>
                      </div>
                    )}
                  {((vaga.tipoDeVaga?.toUpperCase().includes('ESTAGIO') || vaga.tipoDeVaga?.toUpperCase().includes('ESTÁGIO')) && parseBolsa(vaga.bolsaAuxilioExata) > 0) ? (
                    <div className="flex items-center text-white/90 text-xs font-medium gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        R$ {formatCurrency(parseBolsa(vaga.bolsaAuxilioExata))} {vaga.tipoAuxilioBolsa ? `/ ${vaga.tipoAuxilioBolsa}` : ''}
                      </span>
                    </div>
                  ) : ((vaga.tipoDeVaga?.toUpperCase().includes('APRENDIZ')) && parseBolsa(vaga.salarioExato) > 0) ? (
                    <div className="flex items-center text-white/90 text-xs font-medium gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        R$ {formatCurrency(parseBolsa(vaga.salarioExato))} {vaga.tipoDeSalario ? `/ ${vaga.tipoDeSalario}` : ''}
                      </span>
                    </div>
                  ) : ((parseBolsa(vaga.bolsaAuxilioExata) > 0 || parseBolsa(vaga.salarioExato) > 0)) && (
                    <div className="flex items-center text-white/90 text-xs font-medium gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        R$ {parseBolsa(vaga.bolsaAuxilioExata) > 0 ? formatCurrency(parseBolsa(vaga.bolsaAuxilioExata)) : formatCurrency(parseBolsa(vaga.salarioExato))} {vaga.tipoAuxilioBolsa ? `/ ${vaga.tipoAuxilioBolsa}` : vaga.tipoDeSalario ? `/ ${vaga.tipoDeSalario}` : ''}
                      </span>
                    </div>
                  )}
                  </div>
                  
                  <div className="absolute inset-y-0 right-0 w-[45%] z-10">
                    <img 
                      src={optimizeImageUrl(vaga.image || getVagaImageFallback(vaga.codigoDaVaga || vaga.id, imagensPublicas), 400, 260)} 
                      alt=""
                      width="400" height="225" loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col flex-grow p-[20px]">
                  <div className="flex items-center gap-[8px] mb-[12px]">
                    <div className="w-[14px] h-[14px] rounded-full border-2 border-[#2563eb] bg-transparent shrink-0" />
                    <span className="text-xs font-medium text-[#374151] truncate">
                      {vaga.areaProfissional || vaga.areaDeAtuacao || 'Área não informada'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-[#111827] line-clamp-2">
                      {vaga.nomeDaEmpresa || 'Empresa Confidencial'}
                    </h3>
                  </div>
                  <p className="mt-2 mb-4 text-sm text-[#374151] line-clamp-3">
                    {vaga.atividades || 'Descrição não disponível para esta vaga. Inscreva-se para descobrir mais detalhes sobre a oportunidade.'}
                  </p>
                  
                  <div className="pt-3 border-t border-gray-100 flex flex-row-reverse justify-between items-center mt-auto">
                    {logoParceiro ? (
                      <img 
                        src={logoParceiro} 
                        alt={vaga.instituicaoCooperada || vaga.nomeDaEmpresa} 
                        className="h-7 max-w-[70%] object-contain object-right hc-invert"
                        width="100" height="28" loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-gray-500 truncate max-w-[60%]">
                        {vaga.instituicaoCooperada || vaga.nomeDaEmpresa || 'Instituição participante'}
                      </span>
                    )}
                    
                    {vaga.nivelEscolar && (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md shrink-0">
                        {mapNivelEscolar(vaga.nivelEscolar)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="flex justify-center mt-8">
          <button 
            onClick={handleNavigateVagas}
            className="flex items-center justify-center rounded-full bg-[rgba(239,246,255,0.5)] border border-[#dbeafe] py-[10px] px-6 text-sm font-medium text-[#1e40af] transition-colors hover:bg-[#eff6ff] hc-border hc-no-underline"
          >
            Ver mais vagas
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
}
