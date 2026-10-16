import { BookOpen, Briefcase, Building, HelpCircle } from 'lucide-react';
import { type InstituicaoCatalogo } from '../../types/catalog';

interface SearchResultsProps {
  hasResults: boolean;
  searchResults: {
    cursos: any[];
    vagas: any[];
    faq: any[];
    inst: InstituicaoCatalogo[];
  };
  handleResultClick: (type: 'curso' | 'vaga' | 'faq' | 'inst') => void;
}

export function HeaderSearchResults({ hasResults, searchResults, handleResultClick }: SearchResultsProps) {
  if (!hasResults) {
    return (
      <div className="p-4 text-sm text-[#6b7280] text-center">Nenhum resultado encontrado.</div>
    );
  }

  return (
    <div className="flex flex-col py-2">
      {searchResults.cursos.length > 0 && (
        <div className="px-2">
          <div className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider px-2 py-1 mb-1">Cursos</div>
          {searchResults.cursos.map(c => (
            <button key={c.id} onClick={() => handleResultClick('curso')} className="w-full text-left px-2 py-2 flex items-start gap-2 hover:bg-[#f9fafb] rounded-[8px] transition-colors">
              <BookOpen className="w-4 h-4 text-[#2563eb] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#111827] line-clamp-1">{c.titulo || c.tituloEditado}</span>
                <span className="text-xs text-[#6b7280] line-clamp-1">{c.nomeCineRotulo || c.area || 'Conhecimento'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {searchResults.vagas.length > 0 && (
        <div className="px-2 mt-2">
          <div className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider px-2 py-1 mb-1">Vagas</div>
          {searchResults.vagas.map(v => (
            <button key={v.id} onClick={() => handleResultClick('vaga')} className="w-full text-left px-2 py-2 flex items-start gap-2 hover:bg-[#f9fafb] rounded-[8px] transition-colors">
              <Briefcase className="w-4 h-4 text-[#2563eb] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#111827] line-clamp-1">{v.tipoDeVaga} {v.nomeDaEmpresa ? `- ${v.nomeDaEmpresa}` : ''}</span>
                <span className="text-xs text-[#6b7280] line-clamp-1">{v.areaProfissional || v.areaDeAtuacao || 'Oportunidade'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {searchResults.inst.length > 0 && (
        <div className="px-2 mt-2">
          <div className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider px-2 py-1 mb-1">Instituições</div>
          {searchResults.inst.map(i => (
            <button key={i.sigla || i.instituicao} onClick={() => handleResultClick('inst')} className="w-full text-left px-2 py-2 flex items-start gap-2 hover:bg-[#f9fafb] rounded-[8px] transition-colors">
              <Building className="w-4 h-4 text-[#2563eb] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#111827] line-clamp-1">{i.sigla || i.instituicao}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {searchResults.faq.length > 0 && (
        <div className="px-2 mt-2">
          <div className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider px-2 py-1 mb-1">Dúvidas Frequentes</div>
          {searchResults.faq.map(f => (
            <button key={f.id} onClick={() => handleResultClick('faq')} className="w-full text-left px-2 py-2 flex items-start gap-2 hover:bg-[#f9fafb] rounded-[8px] transition-colors">
              <HelpCircle className="w-4 h-4 text-[#2563eb] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#111827] line-clamp-1">{f.pergunta}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
