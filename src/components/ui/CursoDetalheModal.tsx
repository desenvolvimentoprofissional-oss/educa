import { useEffect, useRef } from 'react';
import { X, Clock, BookOpen, Presentation, Building2 } from 'lucide-react';
import { Curso } from '../../store/useCursosStore';
import { lockScroll, unlockScroll, useModalAccessibility } from '../../lib/modalScroll';

type CursoDetalheModalProps = Readonly<{
  cursoDetalhe: Curso;
  isInscrito: boolean;
  loadingMatricula: boolean;
  onClose: () => void;
  onPreMatricula: (curso: Curso) => void;
}>;

export function CursoDetalheModal({ cursoDetalhe, isInscrito, loadingMatricula, onClose, onPreMatricula }: CursoDetalheModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);
  useModalAccessibility(modalRef, true, onClose);

  const titulo = cursoDetalhe.titulo || cursoDetalhe.tituloEditado || 'Curso sem título';
  const area = cursoDetalhe.nomeCineRotulo || cursoDetalhe.area || 'Conhecimento';
  const tipoOferta = cursoDetalhe.tipoDeOferta || cursoDetalhe.formato || 'Online';
  const apresentacao = cursoDetalhe.apresentacao || cursoDetalhe.objetivo;
  const ementa = cursoDetalhe.conteudoProgramatico || cursoDetalhe.conteudo;

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
        aria-labelledby="curso-detalhe-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-4xl bg-white rounded-[16px] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden"
      >

        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <h2 id="curso-detalhe-modal-title" className="text-xl font-bold text-gray-900 tracking-tight">Detalhes do Curso</h2>
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

          {cursoDetalhe.image && (
            <div className="w-full rounded-xl overflow-hidden shadow-sm bg-gray-50">
              <img 
                src={cursoDetalhe.image} 
                alt={titulo} 
                className="w-full aspect-video md:aspect-[21/9] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {titulo}
            </h3>

            <div className="flex flex-wrap gap-[12px]">
              {cursoDetalhe.instituicaoCooperada && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  <Building2 className="w-4 h-4" />
                  {cursoDetalhe.instituicaoCooperada}
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                <BookOpen className="w-4 h-4" />
                {area}
              </div>
              {cursoDetalhe.cargaHoraria && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  {cursoDetalhe.cargaHoraria}
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                <Presentation className="w-4 h-4" />
                {tipoOferta}
              </div>
              {cursoDetalhe.prazoConclusao && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  <span className="font-semibold">Prazo:</span> {cursoDetalhe.prazoConclusao}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-[24px]">
            {apresentacao && (
              <section>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-[12px]">Apresentação</h4>
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">{apresentacao}</p>
              </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              {cursoDetalhe.publicoAlvo && (
                <section>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-[12px]">Público-Alvo</h4>
                  <p className="text-gray-700 leading-relaxed text-base">{cursoDetalhe.publicoAlvo}</p>
                </section>
              )}
              {cursoDetalhe.preRequisitos && (
                <section>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-[12px]">Pré-Requisitos</h4>
                  <p className="text-gray-700 leading-relaxed text-base">{cursoDetalhe.preRequisitos}</p>
                </section>
              )}
              {cursoDetalhe.certificador && (
                <section>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-[12px]">Certificador</h4>
                  <p className="text-gray-700 leading-relaxed text-base">{cursoDetalhe.certificador}</p>
                </section>
              )}
              {cursoDetalhe.conteudista && (
                <section>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-[12px]">Conteudista</h4>
                  <p className="text-gray-700 leading-relaxed text-base">{cursoDetalhe.conteudista}</p>
                </section>
              )}
            </div>

            {ementa && (
              <section>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-[12px]">Conteúdo Programático</h4>
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">{ementa}</p>
              </section>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 p-6 flex justify-end shrink-0">
          {isInscrito ? (
             <button
                disabled
               className="bg-gray-200 text-gray-500 px-8 py-[12px] rounded-full font-medium cursor-not-allowed w-full sm:w-auto"
             >
               Você já está inscrito neste curso
             </button>
          ) : (
            <button 
              onClick={() => onPreMatricula(cursoDetalhe)}
              disabled={loadingMatricula}
              className="bg-[#1e3a8a] text-white px-8 py-[12px] rounded-full font-semibold hover:bg-[#1e40af] transition-all duration-300 disabled:opacity-50 shadow-sm w-full sm:w-auto"
            >
              {loadingMatricula ? 'Processando...' : 'Fazer Pré-Matrícula'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
