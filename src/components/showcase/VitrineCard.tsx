import { Clock } from 'lucide-react';
import { Curso } from '../../store/useCursosStore';
import { useImagensStore } from '../../store/useImagensStore';
import { useHomeStore } from '../../store/useHomeStore';
import { getVagaImageFallback } from '../../lib/vagasImages';
import { optimizeImageUrl, formatCargaHoraria, getInstitutionLogo } from '../../lib/formatters';

type VitrineCardProps = Readonly<{
  curso: Curso;
  isInscrito: boolean;
  loadingMatricula: boolean;
  onDetalhe: (curso: Curso) => void;
  onPreMatricula: (curso: Curso) => void;
}>;

export function VitrineCard({ curso, isInscrito, loadingMatricula, onDetalhe, onPreMatricula }: VitrineCardProps) {
  const { imagensPublicas } = useImagensStore();
  const { instituicoes } = useHomeStore();
  const logoParceiro = getInstitutionLogo(instituicoes, curso.instituicaoCooperada);

  const titulo = curso.titulo || curso.tituloEditado || 'Curso sem título';
  const area = curso.nomeCineRotulo || curso.area || 'Conhecimento';
  const apresentacao = curso.apresentacao || curso.objetivo || 'Descrição não disponível para este curso. Inscreva-se para descobrir mais detalhes sobre a trilha de conhecimento.';

  return (
    <article className="flex flex-col h-full bg-[#ffffff] border border-[#f3f4f6] rounded-[16px] overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative w-full aspect-video shrink-0 bg-gray-100 overflow-hidden min-h-0">
        <img 
          src={optimizeImageUrl(curso.image || getVagaImageFallback(curso.id, imagensPublicas), 400, 260)} 
          alt={titulo}
          width="400" height="225" loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-col flex-grow p-[20px]">

        <div className="flex items-center gap-[8px] mb-[12px]">
          <div className="w-[14px] h-[14px] rounded-full border-2 border-[#2563eb] bg-transparent shrink-0" />
          <span className="text-xs font-medium text-[#374151]">
            {area}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-[#111827] line-clamp-2 min-h-[54px]">
          {titulo}
        </h3>

        <p className="mt-2 mb-4 text-sm text-[#374151] line-clamp-3">
          {apresentacao}
        </p>

        <div className="mb-[16px] flex flex-row-reverse justify-between items-center pt-3 border-t border-[#f3f4f6] mt-auto">
          {logoParceiro ? (
            <img 
              src={logoParceiro} 
              alt={curso.instituicaoCooperada} 
              width="100"
              height="28"
              decoding="async"
              className="hc-invert h-7 max-w-[70%] object-contain object-right"
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

        <div className="flex flex-col sm:flex-row gap-[12px] w-full">
          <button 
            onClick={() => onDetalhe(curso)}
            className="flex-1 flex items-center justify-center rounded-full bg-white border border-[#e5e7eb] py-[10px] px-[16px] text-sm font-medium text-[#374151] transition-colors hover:bg-[#f3f4f6]"
          >
            Detalhes
          </button>
          {isInscrito ? (
             <button 
               disabled
               className="flex-1 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 py-[10px] px-[16px] text-sm font-medium text-gray-500 opacity-70 cursor-not-allowed"
             >
               Já Inscrito
             </button>
          ) : (
            <button 
              onClick={() => onPreMatricula(curso)}
              disabled={loadingMatricula}
              className="flex-1 flex items-center justify-center rounded-full bg-[#1e3a8a] py-[10px] px-[16px] text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:opacity-50 shadow-sm"
            >
              {loadingMatricula ? 'Aguarde...' : 'Pré-Matrícula'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
