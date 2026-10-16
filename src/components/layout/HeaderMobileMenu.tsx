import { Search } from 'lucide-react';
import { type DashboardTab } from '../../store/useNavigationStore';
import { HeaderSearchResults } from './HeaderSearchResults';

interface HeaderMobileMenuProps {
  isLoggedIn: boolean;
  activeTab: DashboardTab | 'vitrine';
  setActiveTab: (tab: DashboardTab | 'vitrine') => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  term: string;
  hasResults: boolean;
  searchResults: any;
  handleResultClick: (type: 'curso' | 'vaga' | 'faq' | 'inst') => void;
  handleScrollToSection: (e: React.MouseEvent<HTMLAnchorElement> | null, href: string) => void;
  PUBLIC_LINKS: { label: string; href: string }[];
  PRIVATE_LINKS: { label: string; id: DashboardTab }[];
}

export function HeaderMobileMenu({
  isLoggedIn,
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  searchTerm,
  setSearchTerm,
  term,
  hasResults,
  searchResults,
  handleResultClick,
  handleScrollToSection,
  PUBLIC_LINKS,
  PRIVATE_LINKS
}: HeaderMobileMenuProps) {
  if (!isMobileMenuOpen) return null;

  return (
    <div id="mobile-menu" className="absolute left-0 top-full w-full bg-[#ffffff] shadow-lg lg:hidden border-t border-[#e5e7eb] max-h-[calc(100vh-70px)] overflow-y-auto">
      <div className="p-4 border-b border-[#e5e7eb] bg-[#f9fafb]">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#6b7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input 
            id="mobile-search-input" name="mobile-q"
            type="search" 
            placeholder="Buscar..." 
            aria-label="Buscar no site"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#ffffff] border border-[#e5e7eb] rounded-full font-sans text-sm text-[#1f2937] py-2 pr-4 pl-[2.25rem] outline-none focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/20 transition-all"
          />
        </div>
        {term.length >= 2 && (
          <div className="mt-3 bg-white border border-[#e5e7eb] rounded-[12px] shadow-sm overflow-hidden flex flex-col">
            <HeaderSearchResults 
              hasResults={hasResults} 
              searchResults={searchResults} 
              handleResultClick={handleResultClick} 
            />
          </div>
        )}
      </div>
      
      <nav aria-label="Navegação móvel" className="flex flex-col p-4 gap-1">
        {isLoggedIn && activeTab !== 'vitrine' ? (
          PRIVATE_LINKS.map((link) => (
            <button
              key={link.id}
              aria-current={activeTab === link.id ? 'page' : undefined}
              onClick={() => {
                setActiveTab(link.id);
                setIsMobileMenuOpen(false);
              }}
              className={`block text-left font-sans py-[12px] px-[16px] text-base font-normal rounded-full transition-colors hover:bg-[#f9fafb] hover:text-[#1e40af] ${activeTab === link.id ? 'bg-[#f9fafb] text-[#1e40af]' : 'text-[#374151]'}`}
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
                onClick={() => {
                  setActiveTab('inicio');
                  setIsMobileMenuOpen(false);
                }}
                className="mt-2 block text-center font-sans py-[12px] px-[16px] text-base font-semibold text-white bg-[#1e40af] rounded-full hover:bg-blue-800 transition-colors shadow-sm hc-yellow hc-border hc-no-underline"
              >
                Meu Painel
              </button>
            )}
          </>
        )}
      </nav>
    </div>
  );
}
