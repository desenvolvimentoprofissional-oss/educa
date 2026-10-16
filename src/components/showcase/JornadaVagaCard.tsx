import { useState } from 'react';
import { MapPin, Banknote, Landmark } from 'lucide-react';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { sanitizeUrlForOpenRedirect } from '../../lib/validators';
import { getVagaImageFallback } from '../../lib/vagasImages';
import { useImagensStore } from '../../store/useImagensStore';
import { useVagasStore } from '../../store/useVagasStore';
import { formatCurrency, parseMonetaryValue } from '../../lib/formatters';
type JornadaVagaCardProps = Readonly<{
  jornadaVaga: any;
  vagaSnapshot: any;
  onUpdateStatus: (id: string, status: string) => void;
  index?: number;
}>;
const FIXED_COLORS = [
  '#004e9a',
  '#0369a1',
  '#0f766e',
  '#1d4ed8'
];
export function JornadaVagaCard({ jornadaVaga, vagaSnapshot, onUpdateStatus, index = 0 }: JornadaVagaCardProps) {
  const { imagensPublicas } = useImagensStore();
  const vagas = useVagasStore(s => s.vagas);
  const vagaOriginal = vagas.find(v => (v.id || v.codigoDaVaga) === (vagaSnapshot?.codigoDaVaga || jornadaVaga.vagaId));
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    variant: 'danger' | 'success';
    title: string;
    description: string;
    cancelText: string;
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);
  const cargo = vagaSnapshot?.tipoDeVaga || vagaOriginal?.tipoDeVaga || 'Oportunidade';
  const empresa = vagaSnapshot?.nomeDaEmpresa1 || vagaSnapshot?.nomeDaEmpresa || vagaOriginal?.nomeDaEmpresa1 || vagaOriginal?.nomeDaEmpresa || 'Empresa Confidencial';
  const localidade = vagaSnapshot?.cidade || vagaOriginal?.cidade || 'Local não informado';
  const instituicao = vagaSnapshot?.instituicaoCooperada || vagaOriginal?.instituicaoCooperada;
  const rawBolsa = parseMonetaryValue(vagaSnapshot?.bolsaAuxilioExata || vagaOriginal?.bolsaAuxilioExata);
  const rawSalario = parseMonetaryValue(vagaSnapshot?.salarioExato || vagaOriginal?.salarioExato);
  const hasBolsa = rawBolsa > 0;
  const hasSalario = rawSalario > 0;
  const tipoAuxilio = vagaSnapshot?.tipoAuxilioBolsa || vagaOriginal?.tipoAuxilioBolsa ? `/ ${vagaSnapshot?.tipoAuxilioBolsa || vagaOriginal?.tipoAuxilioBolsa}` : '';
  const linkDeInscricao = vagaSnapshot?.linkDeInscricao || vagaOriginal?.linkDeInscricao || vagaSnapshot?.link || vagaOriginal?.link || vagaSnapshot?.url || vagaOriginal?.url || vagaSnapshot?.site || vagaOriginal?.site;
  const imageUrl = vagaSnapshot?.imageUrl || vagaSnapshot?.image || vagaOriginal?.image || vagaOriginal?.imageUrl;
  const dataPreCandidatura = jornadaVaga.createdAt ? new Date(jornadaVaga.createdAt).toLocaleDateString('pt-BR') : null;
  const dataCandidatura = jornadaVaga.candidatadoAt ? new Date(jornadaVaga.candidatadoAt).toLocaleDateString('pt-BR') : null;
  const labelData = jornadaVaga.status === 'PRE_CANDIDATADO'
    ? (dataPreCandidatura ? `Pré-participação em: ${dataPreCandidatura}` : "")
    : (dataCandidatura ? `Participando desde: ${dataCandidatura}` : (dataPreCandidatura ? `Adicionado em: ${dataPreCandidatura}` : ""));
  let tagBg = "bg-gray-100";
  let tagText = "text-gray-800";
  let tagDot = "bg-gray-400";
  let tagLabel = jornadaVaga.status;
  let actionOpacity = "opacity-100";
  const status = jornadaVaga.status;
  if (status === 'PRE_CANDIDATADO') {
    tagBg = "bg-blue-50";
    tagText = "text-blue-700";
    tagDot = "bg-blue-500";
    tagLabel = "Interesse";
  } else if (status === 'CANDIDATADO') {
    tagBg = "bg-amber-50";
    tagText = "text-amber-700";
    tagDot = "bg-amber-500 animate-pulse";
    tagLabel = "Em andamento";
  } else if (status === 'CONTRATADO') {
    tagBg = "bg-emerald-50";
    tagText = "text-emerald-700";
    tagDot = "bg-emerald-500";
    tagLabel = "Contratado";
  } else if (status === 'NAO_FOI_DESTA_VEZ' || status === 'DESISTIU') {
    actionOpacity = "opacity-75";
    tagBg = "bg-gray-100";
    tagText = "text-gray-800";
    tagDot = "bg-gray-500";
    tagLabel = "Encerrado";
  }
  const handleDesistir = () => {
    setModalConfig({
      isOpen: true,
      variant: 'danger',
      title: 'Remover da lista?',
      description: 'A vaga será removida da sua lista de andamento e arquivada.',
      cancelText: 'Cancelar',
      confirmText: 'Sim, remover',
      onConfirm: () => {
        onUpdateStatus(jornadaVaga.id, 'DESISTIU');
        setModalConfig(null);
      },
    });
  };
  const handleCandidatado = () => {
    onUpdateStatus(jornadaVaga.id, 'CANDIDATADO');
  };
  const handleNaoFoiDestaVez = () => {
    setModalConfig({
      isOpen: true,
      variant: 'danger',
      title: 'Encerrar processo?',
      description: 'Deseja marcar este processo como "Não foi desta vez"? Ele será movido para o histórico.',
      cancelText: 'Cancelar',
      confirmText: 'Sim, encerrar',
      onConfirm: () => {
        onUpdateStatus(jornadaVaga.id, 'NAO_FOI_DESTA_VEZ');
        setModalConfig(null);
      },
    });
  };
  const cardColor = FIXED_COLORS[index % FIXED_COLORS.length];
  return (
    <>
      <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full ${actionOpacity}`}>
        <div 
          className="relative w-full aspect-video overflow-hidden flex shrink-0 min-h-0"
          style={{ backgroundColor: cardColor }}
        >
          <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute bottom-4 left-[30%] w-16 h-16 rounded-full border-4 border-white/10" />
          <div className="relative z-10 w-[55%] p-[20px] flex flex-col justify-center gap-[8px]">
            <span className="text-white font-bold text-xl leading-snug drop-shadow-md capitalize mb-2 line-clamp-3">
              {cargo.toLowerCase()}
            </span>
          </div>
          <div className="absolute inset-y-0 right-0 w-[45%] z-10">
            <img 
              src={imageUrl || getVagaImageFallback(vagaSnapshot?.codigoDaVaga || jornadaVaga.vagaId, imagensPublicas)}
              alt={cargo}
              className="w-full h-full object-cover object-center"
              width="400" height="225" loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center mb-4">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tagBg} ${tagText}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tagDot}`}></span>
              {tagLabel}
            </div>
          </div>
          <h3 className="text-base font-semibold text-[#111827] leading-tight mb-2 truncate" title={empresa}>{empresa}</h3>
          {labelData && (
            <p className="text-xs text-gray-400 font-medium mb-3">{labelData}</p>
          )}
          <div className="flex flex-col gap-2.5 text-[13px] text-gray-600 mb-4 font-medium mt-auto">
            {instituicao && (
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 shrink-0 text-gray-400" />
                <span className="line-clamp-1" title={instituicao}>{instituicao}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
              <span className="line-clamp-1" title={localidade}>{localidade}</span>
            </div>
            {(hasBolsa || hasSalario) && (
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 shrink-0 text-green-600" />
                <span className="line-clamp-1 font-semibold text-green-700">
                  R$ {hasBolsa ? formatCurrency(rawBolsa) : formatCurrency(rawSalario)} {tipoAuxilio}
                </span>
              </div>
            )}
          </div>
          <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
            {status === 'PRE_CANDIDATADO' && (
              <>
                {linkDeInscricao && (
                  <a 
                    href={sanitizeUrlForOpenRedirect(linkDeInscricao)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full px-4 py-2.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-semibold transition-colors text-center"
                  >
                    Acessar Portal da Vaga
                  </a>
                )}
                <button 
                  onClick={handleCandidatado}
                  className="w-full px-4 py-2.5 rounded-full bg-[#1e3a8a] text-white hover:bg-[#1e40af] text-sm font-semibold transition-colors text-center"
                >
                  Já estou participando
                </button>
                <button 
                  onClick={handleDesistir}
                  className="w-full px-4 py-2.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 text-sm font-semibold transition-colors text-center"
                >
                  Remover da lista
                </button>
              </>
            )}
            {status === 'CANDIDATADO' && (
              <div className="flex flex-col gap-2 w-full">
                <button 
                  onClick={() => onUpdateStatus(jornadaVaga.id, 'CONTRATADO')}
                  className="w-full px-4 py-2.5 rounded-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-sm font-semibold transition-colors shadow-sm text-center"
                >
                  Fui Contratado!
                </button>
                <button 
                  onClick={handleNaoFoiDestaVez}
                  className="w-full px-4 py-2.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 text-sm font-semibold transition-colors text-center"
                >
                  Não foi desta vez
                </button>
              </div>
            )}
            {status === 'CONTRATADO' && (
              <div className="w-full text-center px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-full font-semibold text-sm">
                Processo Aprovado!
              </div>
            )}
            {(status === 'NAO_FOI_DESTA_VEZ' || status === 'DESISTIU') && (
              <div className="w-full text-center px-4 py-2.5 bg-gray-100 text-gray-600 rounded-full font-semibold text-sm">
                Processo Encerrado
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
