import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Minus, Plus, Moon, Info, RotateCcw } from 'lucide-react';
import { useDocumentModal, DocumentType } from '../../hooks/useDocumentModal';
import { DocumentContent } from './DocumentContent';
import { lockScroll, unlockScroll, useModalAccessibility } from '../../lib/modalScroll';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocument?: DocumentType;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  initialDocument = 'privacidade',
}) => {
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

  const {
    currentDoc, zoomLevel, isDarkMode, isHighContrast,
    handleZoomIn, handleZoomOut, toggleDarkMode, toggleHighContrast,
    handleReset, handleNextDoc, getDocTitle, getDocName, nextDocMap,
  } = useDocumentModal(isOpen, initialDocument);

  const resolveThemeTokens = (isDark: boolean, isHighContr: boolean) => {
    const TOKENS = {
      dark: { modalBg: 'bg-gray-900', textColor: 'text-gray-300', headingColor: 'text-white', numberBg: 'bg-cyan-500', numberText: 'text-white', subHeadingColor: 'text-cyan-400', boxBg: 'bg-gray-800 border-gray-700', quoteBorder: 'border-cyan-500', linkColor: 'text-cyan-400 hover:text-cyan-500', markerColor: 'marker:text-cyan-500', scrollbarThumb: 'scrollbar-thumb-gray-600', footerBorder: 'border-gray-800', footerText: 'text-gray-500' },
      highContrast: { modalBg: 'bg-black', textColor: 'text-white', headingColor: 'text-yellow-400', numberBg: 'bg-yellow-400', numberText: 'text-black', subHeadingColor: 'text-yellow-300', boxBg: 'bg-gray-900 border-yellow-400', quoteBorder: 'border-yellow-400', linkColor: 'text-yellow-300 hover:text-yellow-400 underline', markerColor: 'marker:text-yellow-400', scrollbarThumb: 'scrollbar-thumb-yellow-400', footerBorder: 'border-yellow-400', footerText: 'text-yellow-500' },
      light: { modalBg: 'bg-white', textColor: 'text-gray-600', headingColor: 'text-gray-900', numberBg: 'bg-cyan-500', numberText: 'text-white', subHeadingColor: 'text-cyan-600', boxBg: 'bg-gray-50 border-gray-200', quoteBorder: 'border-cyan-500', linkColor: 'text-cyan-600 hover:text-cyan-700', markerColor: 'marker:text-cyan-500', scrollbarThumb: 'scrollbar-thumb-gray-300', footerBorder: 'border-gray-200', footerText: 'text-gray-400' }
    };
    if (isDark) return TOKENS.dark;
    if (isHighContr) return TOKENS.highContrast;
    return TOKENS.light;
  };

  const resolveZoomTokens = (zoomLvl: number) => {
    if (zoomLvl === 1) return { bodyTextSize: 'text-base', mainTitleSize: 'text-xl' };
    if (zoomLvl === 2) return { bodyTextSize: 'text-lg', mainTitleSize: 'text-2xl' };
    return { bodyTextSize: 'text-sm', mainTitleSize: 'text-lg' };
  };

  const { modalBg, textColor, headingColor, numberBg, numberText, subHeadingColor, boxBg, quoteBorder, linkColor, markerColor, scrollbarThumb, footerBorder, footerText } = resolveThemeTokens(isDarkMode, isHighContrast);
  const { bodyTextSize, mainTitleSize } = resolveZoomTokens(zoomLevel);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-modal-title"
            tabIndex={-1}
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`${modalBg} rounded-xl lg:rounded-[16px] shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden transition-colors duration-300 hc-border`}
          >
            <div className="bg-[#172554] text-white px-[16px] py-[12px] sm:px-6 sm:py-[16px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[12px] shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-[12px] sm:gap-[20px]">
                <div>
                  <div className="text-[#bfdbfe] text-[9px] font-bold tracking-widest uppercase mb-0.5">
                    Documento em Exibição
                  </div>
                  <h2 id="document-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight">{getDocTitle()}</h2>
                </div>
                

              </div>

              <div className="flex items-center gap-1 self-end sm:self-auto">
                <div className="hidden md:flex items-center gap-2 mr-2 pr-3 border-r border-white/10">
                  <span className="text-[#bfdbfe] opacity-80 text-[9px] font-medium tracking-widest uppercase">
                    Ver Próximo
                  </span>
                  <button
                    type="button"
                    onClick={handleNextDoc}
                    className="h-7 w-[145px] flex items-center justify-between px-2.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-[10px] font-bold tracking-wider"
                    aria-label="Ver próximo documento"
                  >
                    <span className="truncate">
                      {currentDoc === 'privacidade' ? nextDocMap.privacidade.label : currentDoc === 'seguranca' ? nextDocMap.seguranca.label : currentDoc === 'termos' ? nextDocMap.termos.label : nextDocMap.cookies.label}
                    </span>
                    <ArrowRight size={14} className="flex-shrink-0 ml-1" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex items-center gap-1 mr-1 border-r border-white/10 pr-1 sm:pr-3">
                  <button type="button" onClick={handleZoomOut} aria-label="Diminuir tamanho do texto" className="w-7 h-7 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"><Minus size={14} aria-hidden="true" /></button>
                  <button type="button" onClick={handleZoomIn} aria-label="Aumentar tamanho do texto" className="w-7 h-7 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"><Plus size={14} aria-hidden="true" /></button>
                </div>
                <button type="button" onClick={toggleDarkMode} aria-label="Alternar modo noturno do documento" className={`w-7 h-7 flex items-center justify-center rounded ${isDarkMode ? 'bg-cyan-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'}`}><Moon size={14} aria-hidden="true" /></button>
                <button type="button" onClick={toggleHighContrast} aria-label="Alternar alto contraste do documento" className={`w-7 h-7 flex items-center justify-center rounded ${isHighContrast ? 'bg-yellow-400 text-black' : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'}`}><Info size={14} aria-hidden="true" /></button>
                <button type="button" onClick={handleReset} aria-label="Restaurar visualização padrão" className="w-7 h-7 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white mr-1 sm:mr-2"><RotateCcw size={14} aria-hidden="true" /></button>
                <button type="button" onClick={onClose} aria-label="Fechar documento" className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-white"><X size={18} aria-hidden="true" /></button>
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin ${scrollbarThumb} transition-colors duration-300`}>
              <h3 className={`font-bold mb-6 ${headingColor} ${mainTitleSize}`}>
                {getDocName()}
              </h3>
              
              <div className={`pl-4 border-l-4 mb-10 leading-relaxed text-justify ${quoteBorder} ${textColor} ${bodyTextSize}`}>
                {currentDoc === 'privacidade' 
                  ? "O Conselho Regional de Administração de São Paulo – CRA/SP (“CRA/SP” ou “nós”), autarquia pública federal, reafirma seu compromisso com a privacidade e a proteção de dados pessoais de seus usuários, associados e visitantes. Valorizamos a transparência, a ética e o respeito às informações pessoais, adotando práticas e medidas rigorosas para garantir a segurança e a confidencialidade de todos os dados coletados. Nosso objetivo é oferecer serviços com excelência e responsabilidade, sempre em conformidade com a Lei Geral de Proteção de Dados (LGPD) e demais normativos aplicáveis. Este Aviso de Privacidade foi elaborado para informar, de forma clara e acessível, como tratamos os dados pessoais, assegurando os direitos dos titulares e demonstrando nosso compromisso contínuo com a proteção de sua privacidade. Para mais informações sobre as condições de uso de nossos serviços, acesse o Termo de Uso disponível em nosso site (crasp.gov.br)."
                  : currentDoc === 'cookies'
                  ? "O CRA-SP Educa preza pela sua privacidade. O armazenamento local (tecnologia similar aos cookies) é utilizado exclusivamente para duas finalidades estritamente funcionais:"
                  : currentDoc === 'seguranca'
                  ? "O CRA-SP está comprometido em proteger a segurança do Sistema Integrado de Gestão (SIG) e das informações de seus usuários. Adotamos as seguintes medidas de segurança:"
                  : "Ao acessar e utilizar o site do Conselho Regional de Administração de São Paulo (“CRA-SP” ou “Conselho”), disponível no endereço eletrônico https://www.crasp.gov.br/crasp/home/, você (“Usuário” ou “Visitante”) declara ter lido, compreendido e aceitado integralmente este Termo de Uso."
                }
              </div>

              <div className="space-y-10">
                <DocumentContent
                  currentDoc={currentDoc}
                  bodyTextSize={bodyTextSize} textColor={textColor}
                  subHeadingColor={subHeadingColor} headingColor={headingColor}
                  numberBg={numberBg} numberText={numberText} boxBg={boxBg}
                  linkColor={linkColor} markerColor={markerColor} onClose={onClose}
                />
              </div>

              <div className={`mt-12 pt-6 border-t ${footerBorder} flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.85em] ${footerText}`}>
                <span>Conselho Regional de Administração de São Paulo</span>
                <span className="font-medium">São Paulo, 01 de setembro de 2026</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
