import { UserCheck, BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigationStore } from '../../store/useNavigationStore';

const STEPS = [
  {
    id: 1,
    icon: UserCheck,
    title: "Faça seu Cadastro",
    description: "Faça seu cadastro gratuito em um minuto para desbloquear o acesso total e ilimitado ao catálogo de cursos e vagas."
  },
  {
    id: 2,
    icon: BookOpen,
    title: "Escolha seus Cursos ou Vagas",
    description: "Navegue pelas áreas da Administração, selecione cursos das instituições participantes ou participe das vagas em aberto."
  },
  {
    id: 3,
    icon: CheckCircle2,
    title: "Registre suas Conquistas",
    description: "Concluiu um curso ou garantiu uma vaga? Retorne à plataforma para enviar seu certificado ou informar sua contratação."
  }
];

export function HowItWorks() {
  const { user, setIsLoginOpen } = useAuthStore();
  const { setActiveTab } = useNavigationStore();

  const handleCtaClick = () => {
    if (user) {
      setActiveTab('inicio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsLoginOpen(true);
    }
  };
  
  return (
    <section  className="w-full bg-[#f9fafb] py-16 md:py-20">
      <div 
        className="max-w-[1152px] mx-auto px-[16px]"
      >
        <h2 className="text-xl font-bold text-left mb-10">
          Entenda como funciona
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id}
                className="relative overflow-hidden flex flex-col min-h-[16.25rem] rounded-[16px] p-8 bg-white border border-slate-200/80 shadow-sm hover:border-[#004b87]/40 hover:shadow-md transition-all duration-300 group"
              >
                <div 
                  className={`absolute -bottom-4 z-0 pointer-events-none select-none text-[192px] leading-none font-black text-slate-100 group-hover:text-blue-50 transition-colors duration-300 hc-black ${
                    step.id === 1 ? '-right-10 md:-right-4' : '-right-4'
                  }`}
                >
                  {step.id}
                </div>
                
                <div className="relative z-10 flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-[#004b87]" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 leading-[1.625]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-center mt-12 relative z-10">
          <button 
            onClick={handleCtaClick}
            className="group inline-flex items-center justify-center gap-[8px] rounded-full bg-blue-900 py-[12px] px-8 text-sm font-semibold text-white transition-all duration-150 hover:bg-blue-950 hover:shadow-lg hc-border hc-no-underline"
          >
            Quero me cadastrar agora
            <ChevronRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
