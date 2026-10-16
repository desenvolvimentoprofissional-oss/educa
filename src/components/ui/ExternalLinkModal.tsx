import { useEffect, useRef } from 'react';
import { ExternalLink, X, ShieldAlert } from 'lucide-react';
import { useExternalLinkStore } from '../../store/useExternalLinkStore';
import { lockScroll, unlockScroll, useModalAccessibility } from '../../lib/modalScroll';

export function ExternalLinkModal() {
  const { isOpen, url, institutionName, closeModal } = useExternalLinkStore();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let locked = false;
    if (isOpen) {
      lockScroll();
      locked = true;
    }
    return () => { 
      if (locked) unlockScroll();
    };
  }, [isOpen]);

  useModalAccessibility(modalRef, isOpen, closeModal);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeModal}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="external-link-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-md bg-white rounded-[16px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col p-6 text-center"
      >
        <button 
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 focus-visible:ring-2 focus-visible:ring-blue-700 focus:outline-none"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-7 h-7" aria-hidden="true" />
          </div>
        </div>

        <h2 id="external-link-modal-title" className="text-lg font-semibold text-slate-900 mb-2">
          Redirecionamento Externo
        </h2>
        
        <p className="text-slate-600 mb-8 text-sm leading-[1.6]">
          Você está saindo do portal oficial do CRA-SP Educa para o ambiente da <strong>{institutionName}</strong>. O conteúdo e a segurança dessa página são de responsabilidade da instituição participante.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={closeModal}
            className="flex-1 py-[12px] px-4 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-700 focus:outline-none"
          >
            Voltar ao Portal
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeModal}
            className="flex-1 bg-blue-900 text-white font-semibold py-[12px] px-4 rounded-full hover:bg-blue-950 transition-all flex items-center justify-center gap-2 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-700 focus:outline-none"
          >
            Continuar <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
