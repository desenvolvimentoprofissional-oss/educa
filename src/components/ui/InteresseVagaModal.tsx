import { CheckCircle2 } from "lucide-react";
import { sanitizeUrlForOpenRedirect } from "../../lib/validators";
import { useExternalLinkStore } from '../../store/useExternalLinkStore';
import { Vaga } from "../../store/useVagasStore";
import { useEffect, useRef } from "react";
import { lockScroll, unlockScroll, useModalAccessibility } from "../../lib/modalScroll";

interface InteresseVagaModalProps {
  vagaInteresse: Vaga;
  onClose: () => void;
  onOpenPortal: () => void;
}

export function InteresseVagaModal({
  vagaInteresse,
  onClose,
  onOpenPortal,
}: InteresseVagaModalProps) {
  const { openLink } = useExternalLinkStore();
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);
  useModalAccessibility(modalRef, true, onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="interesse-vaga-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-lg bg-white rounded-[16px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col p-8 text-center"
      >

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" aria-hidden="true" />
          </div>
        </div>

        <h2 id="interesse-vaga-modal-title" className="text-xl font-semibold text-gray-900 mb-5">
          Interesse Registrado no CRA-SP Educa
        </h2>

        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 mb-6 text-[15px] leading-relaxed">
          <strong>ATENÇÃO:</strong> Para prosseguir com a jornada, você deve acessar o portal da instituição participante:{" "}
          <strong>{vagaInteresse.instituicaoCooperada || "Instituição Participante"}</strong>.
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              const link = vagaInteresse.linkDeInscricao || vagaInteresse.link || vagaInteresse.url || vagaInteresse.site;
              const safeUrl = sanitizeUrlForOpenRedirect(link);
              if (safeUrl === "#") {
                console.warn("Link ausente");
              } else {
                onOpenPortal();
                openLink(safeUrl, vagaInteresse.instituicaoCooperada || vagaInteresse.nomeDaEmpresa);
              }
            }}
            className="w-full bg-[#1e3a8a] text-white font-medium py-3 px-6 rounded-full hover:bg-[#1e40af] transition-colors shadow-sm"
          >
            Ir para {vagaInteresse.instituicaoCooperada || vagaInteresse.nomeDaEmpresa || "Instituição Participante"}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 font-medium py-[12px] px-6 rounded-full hover:bg-gray-200 transition-colors"
          >
            Voltar às Vagas
          </button>
        </div>
      </div>
    </div>
  );
}
