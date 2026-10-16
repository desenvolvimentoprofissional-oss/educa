import { useState } from 'react';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { sanitizeUrlForOpenRedirect } from '../../lib/validators';
import { useImagensStore } from '../../store/useImagensStore';
import { getVagaImageFallback } from '../../lib/vagasImages';
import { optimizeImageUrl } from '../../lib/formatters';
import { useCursosStore } from '../../store/useCursosStore';

type JornadaCursoCardProps = Readonly<{
  jornada: any;
  cursoSnapshot: any;
  onUpdateStatus: (id: string, status: string) => void;
  onEvaluate: (jornada: any) => void;
}>;

export function JornadaCursoCard({ jornada, cursoSnapshot, onUpdateStatus, onEvaluate }: JornadaCursoCardProps) {
  const { imagensPublicas } = useImagensStore();
  const cursos = useCursosStore((s) => s.cursos);
  const cursoNoCatalogo = cursos.find((c) => c.id === (jornada.cursoId || jornada.id));

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    variant: 'danger' | 'success';
    title: string;
    description: string;
    cancelText: string;
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

  const titulo = cursoSnapshot?.titulo || cursoSnapshot?.tituloEditado || cursoNoCatalogo?.titulo || cursoNoCatalogo?.tituloEditado || 'Curso Indisponível';
  const instituicao = cursoSnapshot?.instituicaoCooperada || cursoNoCatalogo?.instituicaoCooperada || 'Instituição Desconhecida';
  const linkDoCurso = cursoSnapshot?.linkDoCurso || cursoSnapshot?.link || cursoSnapshot?.url || cursoSnapshot?.site || cursoSnapshot?.linkDeInscricao || cursoNoCatalogo?.linkDoCurso || cursoNoCatalogo?.link;
  
  const dataPreMatricula = jornada.createdAt ? new Date(jornada.createdAt).toLocaleDateString('pt-BR') : null;
  const dataMatricula = jornada.matriculadoAt ? new Date(jornada.matriculadoAt).toLocaleDateString('pt-BR') : null;

  const labelData = jornada.status === 'PRE_MATRICULADO'
    ? (dataPreMatricula ? `Pré-matrícula em: ${dataPreMatricula}` : "")
    : (dataMatricula ? `Matriculado em: ${dataMatricula}` : (dataPreMatricula ? `Adicionado em: ${dataPreMatricula}` : ""));

  let cardOpacity = "opacity-100";
  let tagBg = "bg-gray-100";
  let tagText = "text-gray-800";
  let tagDot = "bg-gray-400";
  let tagLabel = jornada.status;

  if (jornada.status === 'PRE_MATRICULADO') {
    tagBg = "bg-blue-50";
    tagText = "text-blue-700";
    tagDot = "bg-blue-500";
    tagLabel = "Pré-Matriculado";
  } else if (jornada.status === 'MATRICULADO' || jornada.status === 'AGUARDANDO_CERTIFICADO') {
    tagBg = "bg-amber-50";
    tagText = "text-amber-700";
    tagDot = "bg-amber-500 animate-pulse";
    tagLabel = "Em Andamento";
  } else if (jornada.status === 'EM_ANALISE') {
    cardOpacity = "opacity-80";
    tagBg = "bg-teal-50";
    tagText = "text-teal-700";
    tagDot = "bg-teal-500";
    tagLabel = "Em Análise";
  } else if (jornada.status === 'CONCLUIDO') {
    tagBg = "bg-emerald-50";
    tagText = "text-emerald-700";
    tagDot = "bg-emerald-500";
    tagLabel = "Concluído";
  }

  const handleDesistir = () => {
    setModalConfig({
      isOpen: true,
      variant: 'danger',
      title: 'Remover da lista?',
      description: 'O curso será removido da sua lista de andamento e arquivado.',
      cancelText: 'Cancelar',
      confirmText: 'Sim, remover',
      onConfirm: () => {
        onUpdateStatus(jornada.id, 'DESISTIU');
        setModalConfig(null);
      },
    });
  };

  const handleMatriculado = () => {
    onUpdateStatus(jornada.id, 'MATRICULADO');
  };

  return (
    <>
      <div className={`bg-[#ffffff] border border-[#f3f4f6] rounded-[16px] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full ${cardOpacity}`}>
        <div className="w-full aspect-video relative shrink-0 bg-gray-100 overflow-hidden min-h-0">
          <img 
            src={optimizeImageUrl(cursoSnapshot?.image || cursoNoCatalogo?.image || getVagaImageFallback(cursoSnapshot?.codigoDaVaga || jornada.cursoId, imagensPublicas), 400, 260)} 
            alt={titulo} 
            width="400" height="225" loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="p-[20px] flex flex-col flex-grow">
          <div className="flex items-center mb-4">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tagBg} ${tagText}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tagDot}`}></span>
              {tagLabel}
            </div>
          </div>
          <h3 className="text-base font-semibold text-[#111827] leading-tight mb-2 truncate" title={titulo}>{titulo}</h3>
          <p className="text-[13px] text-[#6b7280] line-clamp-1 font-medium mb-1" title={instituicao}>{instituicao}</p>
          {labelData && (
            <p className="text-xs text-gray-400 font-medium mb-4">{labelData}</p>
          )}

          <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
            {linkDoCurso && (jornada.status === 'PRE_MATRICULADO' || jornada.status === 'MATRICULADO' || jornada.status === 'AGUARDANDO_CERTIFICADO') && (
              <a 
                href={sanitizeUrlForOpenRedirect(linkDoCurso)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full px-4 py-2.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-semibold transition-colors text-center"
              >
                Acessar AVA da Instituição
              </a>
            )}

            {jornada.status === 'PRE_MATRICULADO' && (
              <>
                <button 
                  onClick={handleMatriculado}
                  className="w-full px-4 py-2.5 rounded-full bg-[#1e3a8a] text-white hover:bg-[#1e40af] text-sm font-semibold transition-colors text-center"
                >
                  Já iniciei o curso
                </button>
                <button 
                  onClick={handleDesistir}
                  className="w-full px-4 py-2.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 text-sm font-semibold transition-colors text-center"
                >
                  Remover da lista
                </button>
              </>
            )}

            {(jornada.status === 'MATRICULADO' || jornada.status === 'AGUARDANDO_CERTIFICADO') && (
              <>
                <button 
                  onClick={() => onEvaluate(jornada)}
                  className="w-full px-4 py-2.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold transition-colors text-center"
                >
                  Enviar Certificado
                </button>
                <button 
                  onClick={handleDesistir}
                  className="w-full px-4 py-2.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 text-sm font-semibold transition-colors text-center"
                >
                  Não vou mais cursar
                </button>
              </>
            )}

            {jornada.status === 'EM_ANALISE' && (
              <div className="w-full text-center px-4 py-2.5 bg-teal-50 text-teal-700 rounded-full font-semibold text-sm">
                Certificado em Análise
              </div>
            )}

            {jornada.status === 'CONCLUIDO' && (
              <div className="w-full text-center px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-full font-semibold text-sm">
                Concluído e Aprovado
              </div>
            )}
          </div>
        </div>
      </div>

      {modalConfig && (
        <ConfirmationModal
          isOpen={modalConfig.isOpen}
          variant={modalConfig.variant}
          title={modalConfig.title}
          description={modalConfig.description}
          cancelText={modalConfig.cancelText}
          confirmText={modalConfig.confirmText}
          onCancel={() => setModalConfig(null)}
          onConfirm={modalConfig.onConfirm}
        />
      )}
    </>
  );
}
