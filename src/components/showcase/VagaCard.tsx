import { MapPin, Clock, DollarSign } from 'lucide-react';
import { Vaga } from '../../store/useVagasStore';
import { useImagensStore } from '../../store/useImagensStore';
import { useHomeStore } from '../../store/useHomeStore';
import { getVagaImageFallback, getVagaColorFallback } from '../../lib/vagasImages';
import { formatTime, formatCurrency, optimizeImageUrl, mapNivelEscolar, getInstitutionLogo } from '../../lib/formatters';

type VagaCardProps = Readonly<{
  vaga: Vaga;
  isCandidatado: boolean;
  loadingJornadaVaga: boolean;
  onDetalhe: (vaga: Vaga) => void;
  onQueroConcorrer: (vaga: Vaga) => void;
  parseBolsa: (valor: any) => number;
  displayColor?: string;
  displayImage?: string;
}>;

export function VagaCard({ vaga, isCandidatado, loadingJornadaVaga, onDetalhe, onQueroConcorrer, parseBolsa, displayColor, displayImage }: VagaCardProps) {
  const { imagensPublicas } = useImagensStore();
  const { instituicoes } = useHomeStore();
  const logoParceiro = getInstitutionLogo(instituicoes, vaga.instituicaoCooperada) || getInstitutionLogo(instituicoes, vaga.nomeDaEmpresa);

  return (
    <article className="flex flex-col h-full bg-[#ffffff] border border-[#f3f4f6] rounded-[16px] overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

      <div 
        className="relative w-full aspect-video overflow-hidden flex shrink-0 min-h-0"
        style={{ backgroundColor: displayColor || getVagaColorFallback(vaga.codigoDaVaga || vaga.id) }}
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
            src={optimizeImageUrl(displayImage || vaga.image || getVagaImageFallback(vaga.codigoDaVaga || vaga.id, imagensPublicas), 400, 260)} 
            alt={vaga.areaProfissional || 'Vaga'}
            
            
            width="400" height="225" loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="flex flex-col flex-grow p-[20px]">

        <div className="flex items-center gap-[8px] mb-[12px]">
          <div className="w-[14px] h-[14px] rounded-full border-2 border-[#2563eb] bg-transparent shrink-0" />
          <span className="text-xs font-medium text-[#374151] truncate" title={vaga.areaProfissional || vaga.areaDeAtuacao}>
            {vaga.areaProfissional || vaga.areaDeAtuacao || 'Área não informada'}
          </span>
        </div>

        <div className="flex flex-col gap-1 mb-2">
          <h3 className="text-lg font-semibold text-[#111827] line-clamp-2" title={vaga.nomeDaEmpresa}>
            {vaga.nomeDaEmpresa || 'Empresa Confidencial'}
          </h3>
        </div>

        {vaga.cidade && vaga.uf && (
          <p className="mt-1 text-xs font-medium text-[#6b7280] line-clamp-1">
            {vaga.cidade} - {vaga.uf}
          </p>
        )}

        <p className="mt-2 mb-4 text-sm text-[#374151] line-clamp-3">
          {vaga.atividades || 'Descrição não disponível para esta vaga. Inscreva-se para descobrir mais detalhes sobre a oportunidade.'}
        </p>

        <div className="mb-[20px] flex flex-row-reverse justify-between items-center pt-3 border-t border-[#f3f4f6] mt-auto">
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

        <div className="flex flex-col sm:flex-row gap-[12px] w-full">
          <button 
            onClick={() => onDetalhe(vaga)}
            className="flex-1 flex items-center justify-center rounded-full bg-white border border-[#e5e7eb] py-[10px] px-[16px] text-sm font-medium text-[#374151] transition-colors hover:bg-[#f3f4f6]"
          >
            Detalhes
          </button>
          {isCandidatado ? (
             <button 
               disabled
               className="flex-1 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 py-[10px] px-[16px] text-sm font-medium text-gray-500 opacity-70 cursor-not-allowed"
             >
               Já Participando
             </button>
          ) : (
            <button 
              onClick={() => onQueroConcorrer(vaga)}
              disabled={loadingJornadaVaga}
              className="flex-1 flex items-center justify-center rounded-full bg-[#1e3a8a] py-[10px] px-[16px] text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:opacity-50 shadow-sm"
            >
              {loadingJornadaVaga ? 'Aguarde...' : 'Participar'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
