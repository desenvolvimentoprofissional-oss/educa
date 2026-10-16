import { useEffect, useRef } from 'react';
import { X, MapPin, Building2, Clock, DollarSign, ExternalLink } from 'lucide-react';
import { Vaga } from '../../store/useVagasStore';
import { useImagensStore } from '../../store/useImagensStore';
import { getVagaImageFallback, getVagaColorFallback } from '../../lib/vagasImages';
import { formatTime, formatCurrency, parseMonetaryValue } from '../../lib/formatters';
import { lockScroll, unlockScroll, useModalAccessibility } from '../../lib/modalScroll';

type VagaDetalheModalProps = Readonly<{
  vagaDetalhe: Vaga;
  isCandidatado: boolean;
  loadingJornadaVaga: boolean;
  onClose: () => void;
  onQueroConcorrer: (vaga: Vaga) => void;
}>;

export function VagaDetalheModal({ vagaDetalhe, isCandidatado, loadingJornadaVaga, onClose, onQueroConcorrer }: VagaDetalheModalProps) {
  const { imagensPublicas } = useImagensStore();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);
  useModalAccessibility(modalRef, true, onClose);

  const parseBolsa = (valor: any) => parseMonetaryValue(valor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">

      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vaga-detalhe-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-4xl bg-white rounded-[16px] shadow-2xl hc-border animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden"
      >

        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <h2 id="vaga-detalhe-modal-title" className="text-xl font-bold text-gray-900 tracking-tight">Detalhes da Oportunidade</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 bg-gray-50 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-blue-700 focus:outline-none"
            aria-label="Fechar"
          >
            <X className="w-5 h-[20px]" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex flex-col gap-8">

          <div 
            className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden shadow-sm flex shrink-0"
            style={{ backgroundColor: getVagaColorFallback(vagaDetalhe.codigoDaVaga || vagaDetalhe.id) }}
          >

            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute bottom-8 left-[35%] w-24 h-24 rounded-full border-4 border-white/10" />

            <div className="relative z-10 w-[55%] p-8 flex flex-col justify-center gap-[12px]">
              <span className="text-white font-bold text-2xl md:text-4xl leading-snug drop-shadow-md capitalize mb-[12px]">
                {vagaDetalhe.tipoDeVaga ? vagaDetalhe.tipoDeVaga.toLowerCase() : 'Oportunidade'}
              </span>

              {vagaDetalhe.cidade && (
                <div className="flex items-center text-white/90 text-sm md:text-base font-medium gap-[8px]">
                  <MapPin className="w-5 h-[20px] shrink-0" />
                  <span className="truncate">{vagaDetalhe.cidade}</span>
                </div>
              )}

                  {vagaDetalhe.horarioEntrada && vagaDetalhe.horarioSaida && (
                    <div className="flex items-center text-white/90 text-sm md:text-base font-medium gap-[8px]">
                      <Clock className="w-5 h-[20px] shrink-0" />
                      <span className="truncate">
                        {formatTime(vagaDetalhe.horarioEntrada)} às {formatTime(vagaDetalhe.horarioSaida)}
                      </span>
                    </div>
                  )}
                  {((vagaDetalhe.tipoDeVaga?.toUpperCase().includes('ESTAGIO') || vagaDetalhe.tipoDeVaga?.toUpperCase().includes('ESTÁGIO')) && parseBolsa(vagaDetalhe.bolsaAuxilioExata) > 0) ? (
                    <div className="flex items-center text-white/90 text-sm md:text-base font-medium gap-[8px]">
                      <DollarSign className="w-5 h-[20px] shrink-0" />
                      <span className="truncate">
                        R$ {formatCurrency(parseBolsa(vagaDetalhe.bolsaAuxilioExata))} {vagaDetalhe.tipoAuxilioBolsa ? `/ ${vagaDetalhe.tipoAuxilioBolsa}` : ''}
                      </span>
                    </div>
                  ) : ((vagaDetalhe.tipoDeVaga?.toUpperCase().includes('APRENDIZ')) && parseBolsa(vagaDetalhe.salarioExato) > 0) ? (
                    <div className="flex items-center text-white/90 text-sm md:text-base font-medium gap-[8px]">
                      <DollarSign className="w-5 h-[20px] shrink-0" />
                      <span className="truncate">
                        R$ {formatCurrency(parseBolsa(vagaDetalhe.salarioExato))} {vagaDetalhe.tipoDeSalario ? `/ ${vagaDetalhe.tipoDeSalario}` : ''}
                      </span>
                    </div>
                  ) : ((parseBolsa(vagaDetalhe.bolsaAuxilioExata) > 0 || parseBolsa(vagaDetalhe.salarioExato) > 0)) && (
                    <div className="flex items-center text-white/90 text-sm md:text-base font-medium gap-[8px]">
                      <DollarSign className="w-5 h-[20px] shrink-0" />
                      <span className="truncate">
                        R$ {parseBolsa(vagaDetalhe.bolsaAuxilioExata) > 0 ? formatCurrency(parseBolsa(vagaDetalhe.bolsaAuxilioExata)) : formatCurrency(parseBolsa(vagaDetalhe.salarioExato))} {vagaDetalhe.tipoAuxilioBolsa ? `/ ${vagaDetalhe.tipoAuxilioBolsa}` : vagaDetalhe.tipoDeSalario ? `/ ${vagaDetalhe.tipoDeSalario}` : ''}
                      </span>
                    </div>
                  )}
            </div>

            <div className="relative z-10 w-[45%] h-full shrink-0">
              <img 
                src={vagaDetalhe.image || getVagaImageFallback(vagaDetalhe.codigoDaVaga || vagaDetalhe.id, imagensPublicas)} 
                alt={vagaDetalhe.areaProfissional} 
                className="w-full h-full object-cover border-l-[3px] border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {vagaDetalhe.areaProfissional || vagaDetalhe.areaDeAtuacao || 'Vaga Confidencial'}
            </h3>

            <div className="flex flex-wrap gap-[12px]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <Building2 className="w-4 h-4" />
                {vagaDetalhe.nomeDaEmpresa || 'Confidencial'}
              </div>
              {vagaDetalhe.instituicaoCooperada && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-full text-sm font-medium">
                  <ExternalLink className="w-4 h-4" />
                  {vagaDetalhe.instituicaoCooperada}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-[24px]">
            {vagaDetalhe.descricao && (
              <section>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-[12px]">Descrição</h4>
                <p className="text-gray-700 leading-relaxed text-base">{vagaDetalhe.descricao}</p>
              </section>
            )}

            {vagaDetalhe.atividades && (
              <section>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-[12px]">Atividades</h4>
                <p className="text-gray-700 leading-relaxed text-base">{vagaDetalhe.atividades}</p>
              </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              <section>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-[12px]">Requisitos</h4>
                <p className="text-gray-700 leading-relaxed text-base">
                  {(() => {
                    const i = vagaDetalhe.semestreInicio;
                    const f = vagaDetalhe.semestreFinal;
                    if (i && f && i === f) return `Cursando o ${i}º semestre.`;
                    if (i && f) return `Cursando do ${i}º ao ${f}º semestre.`;
                    if (i) return `A partir do ${i}º semestre.`;
                    if (f) return `Até o ${f}º semestre.`;
                    return 'Não informado';
                  })()}
                </p>
              </section>
              {(parseBolsa(vagaDetalhe.bolsaAuxilioExata) > 0 || parseBolsa(vagaDetalhe.salarioExato) > 0 || vagaDetalhe.beneficios) && (
                <section>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-[12px]">
                    {vagaDetalhe.beneficios 
                      ? ((vagaDetalhe.tipoDeVaga?.toUpperCase().includes('APRENDIZ')) ? 'Salário / Benefícios' : 'Bolsa / Benefícios')
                      : ((vagaDetalhe.tipoDeVaga?.toUpperCase().includes('APRENDIZ')) ? 'Salário' : (vagaDetalhe.tipoDeVaga?.toUpperCase().includes('ESTAGIO') || vagaDetalhe.tipoDeVaga?.toUpperCase().includes('ESTÁGIO')) ? 'Bolsa' : 'Remuneração')}
                  </h4>
                  <div className="text-gray-700 leading-relaxed text-base flex flex-col gap-1">
                    {(parseBolsa(vagaDetalhe.bolsaAuxilioExata) > 0 || parseBolsa(vagaDetalhe.salarioExato) > 0) && (
                      <p>
                        {((vagaDetalhe.tipoDeVaga?.toUpperCase().includes('ESTAGIO') || vagaDetalhe.tipoDeVaga?.toUpperCase().includes('ESTÁGIO')) && parseBolsa(vagaDetalhe.bolsaAuxilioExata) > 0) ? (
                          <>R$ {formatCurrency(parseBolsa(vagaDetalhe.bolsaAuxilioExata))} {vagaDetalhe.tipoAuxilioBolsa ? `/ ${vagaDetalhe.tipoAuxilioBolsa}` : ''}</>
                        ) : ((vagaDetalhe.tipoDeVaga?.toUpperCase().includes('APRENDIZ')) && parseBolsa(vagaDetalhe.salarioExato) > 0) ? (
                          <>R$ {formatCurrency(parseBolsa(vagaDetalhe.salarioExato))} {vagaDetalhe.tipoDeSalario ? `/ ${vagaDetalhe.tipoDeSalario}` : ''}</>
                        ) : (
                          <>R$ {parseBolsa(vagaDetalhe.bolsaAuxilioExata) > 0 ? formatCurrency(parseBolsa(vagaDetalhe.bolsaAuxilioExata)) : formatCurrency(parseBolsa(vagaDetalhe.salarioExato))} {vagaDetalhe.tipoAuxilioBolsa ? `/ ${vagaDetalhe.tipoAuxilioBolsa}` : vagaDetalhe.tipoDeSalario ? `/ ${vagaDetalhe.tipoDeSalario}` : ''}</>
                        )}
                      </p>
                    )}
                    {vagaDetalhe.beneficios && (
                      <p className="text-sm text-gray-600 mt-1">{vagaDetalhe.beneficios}</p>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 p-6 flex justify-end shrink-0">
          {isCandidatado ? (
             <button
                disabled
               className="bg-gray-200 text-gray-500 px-8 py-[12px] rounded-full font-medium cursor-not-allowed w-full sm:w-auto"
             >
               Você já está participando desta vaga
             </button>
          ) : (
            <button 
              onClick={() => onQueroConcorrer(vagaDetalhe)}
              disabled={loadingJornadaVaga}
              className="bg-[#1e3a8a] text-white px-8 py-[12px] rounded-full font-semibold hover:bg-[#1e40af] transition-all duration-300 disabled:opacity-50 shadow-sm w-full sm:w-auto"
            >
              {loadingJornadaVaga ? 'Processando...' : 'Quero Participar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
