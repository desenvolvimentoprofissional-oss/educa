import { useState, useRef, useEffect, useMemo, lazy, Suspense } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigationStore, DashboardTab } from '../../store/useNavigationStore';
import { useHomeStore } from '../../store/useHomeStore';
import { useSearchStore } from '../../store/useSearchStore';
import { LogoCRA } from '../ui/LogoCRA';

const HeaderSearchResults = lazy(() => import('./HeaderSearchResults').then(m => ({ default: m.HeaderSearchResults })));
const HeaderMobileMenu = lazy(() => import('./HeaderMobileMenu').then(m => ({ default: m.HeaderMobileMenu })));

const normalizeStr = (str?: string) =>
  (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const PUBLIC_LINKS = [
  { label: 'Cursos', href: '#cursos' },
  { label: 'Vagas', href: '#vagas' },
  { label: 'Jornada', href: '#jornada' },
  { label: 'Instituições', href: '#instituicoes' },
  { label: 'Dúvidas', href: '#perguntas' }
];

const PRIVATE_LINKS: { label: string; id: DashboardTab }[] = [
  { label: 'Meu Painel', id: 'inicio' },
  { label: 'Explorar Cursos', id: 'cursos' },
  { label: 'Explorar Vagas', id: 'vagas' },
  { label: 'Minhas Conquistas', id: 'conquistas' }
];

export function Header() {
  const { user, profileComplete, setIsLoginOpen } = useAuthStore();
  const { activeTab, setActiveTab } = useNavigationStore();
  const { cursosDestaque, vagasDestaque, instituicoes, perguntas } = useHomeStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { globalSearchTerm: searchTerm, setGlobalSearchTerm: setSearchTerm } = useSearchStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);

  const isLoggedIn = !!(user && profileComplete);

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement> | null, href: string) => {
    if (e) e.preventDefault();
    if (href.startsWith('#')) {
      const doScroll = () => {
        const targetId = href.substring(1);
        if (targetId === '') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const targetElement = document.getElementById(targetId);
        if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
      };

      if (isLoggedIn && activeTab !== 'vitrine') {
        setActiveTab('vitrine');
        setTimeout(doScroll, 100);
      } else {
        doScroll();
      }
      setIsMobileMenuOpen(false);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  const term = normalizeStr(searchTerm);

  const searchResults = useMemo(() => {
    if (term.length < 2) return { cursos: [], vagas: [], faq: [], inst: [] };
    return {
      cursos: cursosDestaque.filter(c => normalizeStr(c.titulo || c.tituloEditado).includes(term) || normalizeStr(c.nomeCineRotulo || c.area).includes(term)).slice(0, 3),
      vagas: vagasDestaque.filter(v =>
        normalizeStr(v.nomeDaEmpresa).includes(term) ||
        normalizeStr(v.tipoDeVaga).includes(term) ||
        normalizeStr(v.nivelEscolar).includes(term) ||
        normalizeStr(v.descricao).includes(term) ||
        normalizeStr(v.atividades).includes(term)
      ).slice(0, 3),
      faq: perguntas.filter(p => normalizeStr(p.pergunta).includes(term)).slice(0, 2),
      inst: instituicoes.filter(i => normalizeStr(i.instituicao).includes(term) || normalizeStr(i.sigla).includes(term)).slice(0, 2)
    };
  }, [term, cursosDestaque, vagasDestaque, perguntas, instituicoes]);

  const hasResults = useMemo(() => Object.values(searchResults).some(arr => arr.length > 0), [searchResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (type: 'curso' | 'vaga' | 'faq' | 'inst') => {
    setIsSearchOpen(false);
    setSearchTerm('');
    setIsMobileMenuOpen(false);
    if (type === 'faq') return handleScrollToSection(null, '#perguntas');
    if (type === 'inst') return handleScrollToSection(null, '#instituicoes');
    if (!isLoggedIn) {
      setIsLoginOpen(true);
    } else {
      setActiveTab(type === 'curso' ? 'cursos' : 'vagas');
    }
  };

  return (
    <header className="w-full bg-[#ffffff] relative z-40 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
      <div className="max-w-[1152px] mx-auto flex items-center justify-between px-[16px] py-[16px] gap-[12px]">
        <div className="flex items-center gap-[24px] lg:gap-12">
          <a
            href="/"
            aria-label="Página Inicial"
            className="flex items-center gap-[12px] hc-white hc-no-underline"
            onClick={(e) => {
              if (isLoggedIn) {
                e.preventDefault();
                setActiveTab('vitrine');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <LogoCRA className="w-auto h-[40px] lg:h-[2.75rem] translate-y-[0.0625rem]" />
          </a>

          <nav aria-label="Navegação principal" className="hidden lg:flex items-center gap-[12px]">
            {isLoggedIn && activeTab !== 'vitrine' ? (
              PRIVATE_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  aria-current={activeTab === link.id ? 'page' : undefined}
                  className={`block font-sans py-[12px] px-[16px] text-base font-normal rounded-full transition-colors hover:bg-[#f9fafb] hover:text-[#1e40af] ${activeTab === link.id ? 'bg-[#f9fafb] text-[#1e40af]' : 'text-[#374151]'}`}
                >
                  {link.label}
                </button>
              ))
            ) : (
              <>
                {PUBLIC_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleScrollToSection(e, link.href)}
                    className="block font-sans py-[12px] px-[16px] text-base font-normal text-[#374151] rounded-full hover:bg-[#f9fafb] hover:text-[#1e40af] transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                {isLoggedIn && (
                  <button
                    onClick={() => setActiveTab('inicio')}
                    className="ml-2 block font-sans py-[8px] px-[20px] text-base font-semibold text-white bg-[#1e40af] rounded-full hover:bg-blue-800 transition-colors shadow-sm hc-yellow hc-border hc-no-underline"
                  >
                    Meu Painel
                  </button>
                )}
              </>
            )}
          </nav>
        </div>

        <form className="hidden lg:block relative w-full lg:w-72 group crasp-header-search-form" ref={searchRef} onSubmit={(e) => e.preventDefault()}>
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder="Buscar"
            aria-label="Buscar no site"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setIsSearchOpen(true); }}
            onFocus={() => { if (searchTerm.length >= 2) setIsSearchOpen(true); }}
            onKeyDown={(e) => { if (e.key === 'Escape') setIsSearchOpen(false); }}
            className="w-full bg-white border border-gray-200 rounded-full font-sans text-sm text-gray-800 py-2 pl-4 pr-12 focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 transition-all hc-placeholder-yellow"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-600 hover:text-blue-800 flex items-center justify-center transition-colors"
            aria-label="Pesquisar"
          >
            <Search className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </button>

          {isSearchOpen && term.length >= 2 && (
            <div id="header-search-results" role="region" aria-label="Resultados da busca" className="absolute top-full mt-2 left-0 w-[320px] bg-white border border-gray-200 rounded-[12px] shadow-lg overflow-hidden flex flex-col z-50 max-h-[400px] overflow-y-auto">
              <Suspense fallback={null}>
                <HeaderSearchResults hasResults={hasResults} searchResults={searchResults} handleResultClick={handleResultClick} />
              </Suspense>
            </div>
          )}
        </form>

        <div className="flex lg:hidden items-center gap-[8px]">
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(true);
              setTimeout(() => document.getElementById('mobile-search-input')?.focus(), 100);
            }}
            className="bg-white border border-gray-200 rounded-full p-2 shadow-sm hover:border-blue-800 transition-colors cursor-pointer inline-flex items-center justify-center"
            aria-label="Buscar"
          >
            <Search className="w-5 h-5 text-gray-700" strokeWidth={2} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="bg-[#ffffff] border border-[#e5e7eb] rounded-full p-2 shadow-sm hover:border-[#1e40af] transition-colors"
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-[20px] text-[#374151]" aria-hidden="true" /> : <Menu className="w-5 h-[20px] text-[#374151]" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <Suspense fallback={null}>
          <HeaderMobileMenu
            isLoggedIn={isLoggedIn}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            term={term}
            hasResults={hasResults}
            searchResults={searchResults}
            handleResultClick={handleResultClick}
            handleScrollToSection={handleScrollToSection}
            PUBLIC_LINKS={PUBLIC_LINKS}
            PRIVATE_LINKS={PRIVATE_LINKS}
          />
        </Suspense>
      )}
    </header>
  );
}
