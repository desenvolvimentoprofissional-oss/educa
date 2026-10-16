import { ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigationStore } from '../../store/useNavigationStore';

export function HeroBanner() {
  const { user, setIsLoginOpen } = useAuthStore();
  const { setActiveTab } = useNavigationStore();

  const handleExploreClick = () => {
    if (user) {
      setActiveTab('inicio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <section 
      className="relative overflow-hidden w-full min-h-[36.25rem] flex items-center hc-bg-black"
    >
      <picture className="absolute inset-0 w-full h-full z-0">
        <source media="(min-width: 1024px)" srcSet="/image1-desktop.webp" />
        <source media="(min-width: 640px)" srcSet="/image1-tablet.webp" />
        <img 
          src="/image1-mobile.webp" 
          alt="Estudantes em ambiente educacional do CRA-SP Educa" 
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          className="w-full h-full object-cover object-[37.5%_center] md:object-[56.25%_center] lg:object-[75%_center]"
        />
      </picture>
      <div className="w-full max-w-[1152px] mx-auto px-[16px] relative z-10 bg-transparent">
        <div className="max-w-2xl py-12 md:py-24 bg-transparent">
          <h1 className="flex flex-col text-3xl md:text-[44px] lg:text-[56px] leading-[1.25] hc-hero-text">
            <span className="font-normal text-slate-900">Conhecimento e</span>
            <span className="font-normal text-slate-900">oportunidade para</span>
            <span className="font-bold text-[#003865]">líderes do amanhã.</span>
          </h1>
          <p className="mt-6 text-lg leading-[1.625] text-slate-800 max-w-[19.375rem] md:max-w-[42.1875rem] [text-wrap:balance] md:[text-wrap:auto] hc-hero-text">
            O <strong>CRA-SP Educa</strong> é a plataforma oficial e 100% gratuita do CRA-SP{' '}
            <br className="hidden md:block" />
            que conecta você a cursos de alta qualidade e a oportunidades{' '}
            <br className="hidden md:block" />
            de estágio e aprendiz para impulsionar sua jornada.
          </p>
          <div className="bg-transparent">
            <button 
              onClick={handleExploreClick}
              className="group mt-8 inline-flex items-center justify-center gap-[8px] w-full md:w-auto rounded-full bg-blue-900 py-[12px] px-6 text-sm font-semibold text-white transition-all duration-150 hover:bg-blue-950 hover:shadow-lg hc-border hc-no-underline"
            >
              Explorar Cursos e Vagas
              <ChevronRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
