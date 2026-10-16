import { useState, lazy, Suspense } from 'react';
import { LogIn, LogOut, Cookie } from 'lucide-react';
import { TopBarSocial } from './TopBarSocial';

import { useAuthStore } from '../../store/useAuthStore';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

const DocumentModal = lazy(() => import('../ui/DocumentModal').then(m => ({ default: m.DocumentModal })));

export function TopBar() {
  const { user, setIsLoginOpen, signOut } = useAuthStore();
  const { 
    fontSizeScale, 
    increaseFontSize, 
    decreaseFontSize, 
    resetFontSize,
    toggleHighContrast,
    isHighContrast
  } = useAccessibilityStore();

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  return (
    <>
      <div className="w-full bg-blue-900 border-b border-blue-800 text-blue-100">
      <div className="max-w-[1152px] mx-auto py-2 px-[16px] flex justify-between items-center">

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex shrink-0 flex-nowrap items-center gap-1.5 sm:gap-2">
            <span className="hidden text-xs font-medium sm:inline sm:text-sm">Acessibilidade</span>
            <div className="flex shrink-0 flex-nowrap items-center gap-1 sm:gap-1.5">
              <button 
                onClick={toggleHighContrast}
                aria-pressed={isHighContrast}
                className={`w-[30px] h-[30px] flex items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900 hc-no-underline hc-yellow hc-border ${isHighContrast ? 'bg-white/20 shadow-[inset_0_0_0_2px_#DBEAFE]' : 'bg-white/12 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)] hover:bg-white/20'}`} 
                aria-label="Ativar ou desativar alto contraste"
                title="Alto contraste"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="hc-yellow" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10V2z"/></svg>
              </button>
              <button 
                onClick={increaseFontSize}
                className={`w-[30px] h-[30px] flex items-center justify-center rounded-full transition-all text-[11px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900 hc-no-underline hc-yellow hc-border ${fontSizeScale > 1 ? 'bg-white/20 shadow-[inset_0_0_0_2px_#DBEAFE]' : 'bg-white/12 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)] hover:bg-white/20'}`} 
                aria-label="Aumentar tamanho da fonte"
                title="Aumentar fonte"
              >
                A+
              </button>
              <button 
                onClick={decreaseFontSize}
                className={`w-[30px] h-[30px] flex items-center justify-center rounded-full transition-all text-[11px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900 hc-no-underline hc-yellow hc-border ${fontSizeScale < 1 ? 'bg-white/20 shadow-[inset_0_0_0_2px_#DBEAFE]' : 'bg-white/12 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)] hover:bg-white/20'}`} 
                aria-label="Diminuir tamanho da fonte"
                title="Diminuir fonte"
              >
                A-
              </button>
              <button 
                onClick={resetFontSize}
                className={`w-[30px] h-[30px] flex items-center justify-center rounded-full transition-all text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900 hc-no-underline hc-yellow hc-border ${fontSizeScale === 1 ? 'bg-white/20 shadow-[inset_0_0_0_2px_#DBEAFE]' : 'bg-white/12 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)] hover:bg-white/20'}`} 
                aria-label="Tamanho de fonte normal"
                title="Voltar ao tamanho de fonte normal"
              >
                A
              </button>
            </div>
          </div>
          
          <button 
            className="transition hover:opacity-80 inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900 hc-no-underline hc-yellow" 
            aria-label="Controle de Privacidade"
            title="Cookies"
            onClick={() => setIsPrivacyModalOpen(true)}
          >
            <Cookie className="h-5 w-5 text-white hc-yellow" strokeWidth={2.2} />
          </button>
        </div>

        <div className="flex items-center gap-[8px] md:gap-[12px]">
          <TopBarSocial />

          <div className="hidden md:block w-[0.0625rem] h-6 bg-blue-800" />

          <div className="flex gap-[8px] md:gap-[12px] items-center">
            {user ? (
              <button 
                onClick={signOut}
                aria-label="Sair"
                className="bg-yellow-500 text-blue-900 rounded-full py-2 min-w-[134px] sm:min-w-[154px] text-sm font-semibold flex items-center justify-center gap-[8px] hover:bg-yellow-400 transition-colors shadow-sm hc-border hc-no-underline hc-yellow"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)}
                aria-label="Entrar"
                className="bg-yellow-500 text-blue-900 rounded-full py-2 min-w-[134px] sm:min-w-[154px] text-sm font-semibold flex items-center justify-center gap-[8px] hover:bg-yellow-400 transition-colors shadow-sm hc-border hc-no-underline hc-yellow"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
      {isPrivacyModalOpen && <Suspense fallback={null}><DocumentModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} initialDocument='cookies' /></Suspense>}
    </>
  );
}
