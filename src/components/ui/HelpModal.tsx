import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone } from 'lucide-react';
import { lockScroll, unlockScroll, useModalAccessibility } from '../../lib/modalScroll';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
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
  useModalAccessibility(modalRef, isOpen, onClose);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl hc-border overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 id="help-modal-title" className="text-xl font-bold text-[#111827]">Central de Ajuda</h2>
          <button 
            type="button"
            onClick={onClose}
            aria-label="Fechar Central de Ajuda"
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-700 focus:outline-none"
          >
            <X className="w-5 h-[20px]" aria-hidden="true" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-[#374151] mb-6">
            Precisa de ajuda ou ficou com alguma dúvida? Nossa equipe está à disposição para auxiliar você.
          </p>

          <div className="bg-blue-50 p-[20px] rounded-[16px] border border-blue-100 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-[40px] rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-[20px] text-blue-600" />
              </div>
              <div>
                <h5 className="font-bold text-blue-900">Suporte Técnico</h5>
                <p className="text-blue-800 text-xs mt-1">Para problemas com acesso, uploads ou erros no portal.</p>
                <a href="mailto:craspeduca@crasp.gov.br" className="text-blue-600 font-bold text-sm hover:underline mt-2 inline-block">craspeduca@crasp.gov.br</a>
              </div>
            </div>

            <div className="w-full h-px bg-blue-200" />

            <div className="flex items-start gap-4">
              <div className="w-10 h-[40px] rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-[20px] text-blue-600" />
              </div>
              <div>
                <h5 className="font-bold text-blue-900">Telefone Institucional</h5>
                <p className="text-blue-800 text-xs mt-1">Atendimento das 09h às 17h, de segunda a sexta-feira.</p>
                <a href="tel:+551130873200" className="text-blue-600 font-bold text-sm hover:underline mt-2 inline-block">(11) 3087-3200</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-200 text-[#374151] rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
