import { useState, lazy, Suspense } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { TOPBAR_SOCIAL_ITEMS } from './TopBarSocial';
const DocumentModal = lazy(() => import('../ui/DocumentModal').then(m => ({ default: m.DocumentModal })));
import { HelpModal } from '../ui/HelpModal';
import { DocumentType } from '../../hooks/useDocumentModal';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigationStore } from '../../store/useNavigationStore';

export function Footer() {
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const { user, profileComplete } = useAuthStore();
  const { setActiveTab } = useNavigationStore();
  const isLoggedIn = !!(user && profileComplete);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [docType, setDocType] = useState<DocumentType>('privacidade');

  const openDocument = (type: DocumentType) => {
    setDocType(type);
    setIsDocModalOpen(true);
  };

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <div className="w-full bg-[#172554] text-[#eff6ff]">
        <div className="max-w-[1152px] mx-auto p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <a href="tel:+551130873200" className="flex items-center gap-[8px] text-base font-semibold hover:opacity-80 transition-opacity">
            <span className="text-[#bfdbfe]">Telefone</span>
            <Phone className="w-5 h-[20px] text-white" />
            <span className="text-white">(11) 3087-3200</span>
          </a>
          <div className="hidden md:block w-[0.0625rem] h-6 bg-white/10" />
          <a href="mailto:craspeduca@crasp.gov.br" className="flex items-center gap-[8px] text-base font-semibold hover:opacity-80 transition-opacity">
            <Mail className="w-5 h-[20px] text-white" />
            <span className="text-[#bfdbfe]">
              crasp<span className="font-bold text-white">educa</span>@crasp.gov.br
            </span>
          </a>
        </div>
      </div>

      <footer className="w-full bg-[#1e3a8a]">
        <div className="max-w-[1152px] mx-auto py-12 px-[16px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">CRA-SP</h2>
              <p className="text-sm text-[#dbeafe] mb-4">
                O Conselho Regional de Administração de São Paulo é responsável pela regulamentação e fiscalização da profissão de Administrador no estado de São Paulo.
              </p>
              <div className="space-y-2 text-sm text-[#dbeafe] mb-4">
                <p className="font-semibold text-white">Endereço</p>
                <div className="space-y-1">
                  <p>Rua Estados Unidos, 889</p>
                  <p>Jardim América, CEP: 01427-001</p>
                  <p>São Paulo/SP</p>
                </div>
              </div>
              <a 
                href="https://maps.google.com/?q=Rua+Estados+Unidos,+889,+Jardim+América,+São+Paulo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-[8px] rounded-full bg-white py-2 px-[16px] text-sm font-semibold text-[#1e3a8a] transition-all hover:bg-gray-100"
              >
                <MapPin className="w-4 h-4" />
                Como chegar
              </a>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Acesso Rápido</h3>
              <div className="flex flex-col space-y-3">
                {isLoggedIn ? (
                  <>
                    <button onClick={() => { setActiveTab('inicio'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm text-[#dbeafe] hover:text-white transition-colors text-left">
                      Meu Painel
                    </button>
                    <button onClick={() => { setActiveTab('cursos'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm text-[#dbeafe] hover:text-white transition-colors text-left">
                      Explorar Cursos
                    </button>
                    <button onClick={() => { setActiveTab('vagas'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm text-[#dbeafe] hover:text-white transition-colors text-left">
                      Explorar Vagas
                    </button>
                    <button onClick={() => { setActiveTab('conquistas'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm text-[#dbeafe] hover:text-white transition-colors text-left">
                      Minhas Conquistas
                    </button>
                  </>
                ) : (
                  <>
                    <a href="#cursos" onClick={(e) => handleScrollToSection(e, '#cursos')} className="text-sm text-[#dbeafe] hover:text-white transition-colors">
                      Cursos
                    </a>
                    <a href="#vagas" onClick={(e) => handleScrollToSection(e, '#vagas')} className="text-sm text-[#dbeafe] hover:text-white transition-colors">
                      Vagas
                    </a>
                    <a href="#jornada" onClick={(e) => handleScrollToSection(e, '#jornada')} className="text-sm text-[#dbeafe] hover:text-white transition-colors">
                      Jornada
                    </a>
                    <a href="#instituicoes" onClick={(e) => handleScrollToSection(e, '#instituicoes')} className="text-sm text-[#dbeafe] hover:text-white transition-colors">
                      Instituições
                    </a>
                    <a href="#perguntas" onClick={(e) => handleScrollToSection(e, '#perguntas')} className="text-sm text-[#dbeafe] hover:text-white transition-colors">
                      Perguntas Frequentes
                    </a>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Institucional</h3>
              <div className="flex flex-col space-y-3">
                <a href="https://www.crasp.gov.br/crasp/site/institucional/o-cra-sp" target="_blank" rel="noopener noreferrer" className="text-sm text-[#dbeafe] hover:text-white transition-colors">
                  Sobre o CRA-SP
                </a>
                <a href="https://cra-sp.implanta.net.br/portaltransparencia/#" target="_blank" rel="noopener noreferrer" className="text-sm text-[#dbeafe] hover:text-white transition-colors">
                  Transparência
                </a>
                <button onClick={() => setIsHelpModalOpen(true)} className="text-sm text-[#dbeafe] hover:text-white transition-colors text-left">
                  Central de Ajuda
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Políticas e Termos</h3>
              <div className="flex flex-col space-y-3">
                <button onClick={() => openDocument('privacidade')} className="text-sm text-[#dbeafe] hover:text-white transition-colors text-left">
                  Política de Privacidade
                </button>
                <button onClick={() => openDocument('seguranca')} className="text-sm text-[#dbeafe] hover:text-white transition-colors text-left">
                  Política de Segurança
                </button>
                <button onClick={() => openDocument('termos')} className="text-sm text-[#dbeafe] hover:text-white transition-colors text-left">
                  Termos de Uso
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-4">
            <div className="flex flex-wrap justify-start gap-[8px]">
              {TOPBAR_SOCIAL_ITEMS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white text-gray-900 flex items-center justify-center hover:shadow-md transition-shadow hc-no-underline hc-yellow hc-border"
                >
                  <Icon />
                </a>
              ))}
            </div>
            
            <a href="https://portal.crasp.gov.br/fale-conosco/ouvidoria/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-3 py-2 text-sm font-semibold text-black transition hover:bg-yellow-400 self-start sm:self-auto hc-no-underline hc-border hc-yellow">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span>Acesso à informação</span>
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-left">
            <p className="text-sm text-[#dbeafe]">
              Todos direitos reservados © Conselho Regional de Administração de São Paulo
            </p>
          </div>
        </div>
      </footer>

      {isDocModalOpen && <Suspense fallback={null}><DocumentModal 
        isOpen={isDocModalOpen} 
        initialDocument={docType}
        onClose={() => setIsDocModalOpen(false)} 
      />
      </Suspense>}
      <HelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />
    </>
  );
}
