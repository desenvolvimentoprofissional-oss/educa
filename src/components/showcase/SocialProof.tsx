import { ChevronRight, FileCheck, Users, MonitorPlay, Briefcase } from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigationStore } from '../../store/useNavigationStore';
import { useHomeStore } from '../../store/useHomeStore';
import { useInView } from '../../hooks/useInView';

function CountUp({ end, duration = 2000, startAnimation = true }: { end: number; duration?: number; startAnimation?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    let startTime: number;

    const update = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(end * easeOut(percentage)));
      
      if (progress < duration) {
        animationFrame = requestAnimationFrame(update);
      }
    };

    if (startAnimation && end > 0) {
      animationFrame = requestAnimationFrame(update);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, startAnimation]);

  return <>{count.toLocaleString('pt-BR')}</>;
}

export function SocialProof() {
  const { user, setIsLoginOpen, totalUsuarios, totalMatriculas, fetchTotais } = useAuthStore();
  const { setActiveTab } = useNavigationStore();
  const { stats } = useHomeStore();

  const handleCtaClick = () => {
    if (user) {
      setActiveTab('inicio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsLoginOpen(true);
    }
  };
  
  const totalDeCursos = stats?.totalDeCursos || 0;
  const totalDeVagas = stats?.totalDeVagas || 0;

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "300px 0px" });

  const visibilityRef = useRef(null);
  const isVisible = useInView(visibilityRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      fetchTotais();
    }
  }, [fetchTotais, isInView]);

  const metrics = useMemo(() => [
    { 
      id: 1, 
      label: 'matrículas realizadas', 
      value: totalMatriculas ?? 0,
      icon: FileCheck
    },
    { 
      id: 2, 
      label: 'usuários cadastrados', 
      value: totalUsuarios ?? 0,
      icon: Users
    },
    { 
      id: 3, 
      label: 'cursos gratuitos', 
      value: totalDeCursos,
      icon: MonitorPlay
    },
    { 
      id: 4, 
      label: 'oportunidades de mercado', 
      value: totalDeVagas,
      icon: Briefcase
    }
  ], [totalMatriculas, totalUsuarios, totalDeCursos, totalDeVagas]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#172554] py-16 md:py-24 min-h-[450px]">
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)] rounded-full pointer-events-none -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)] rounded-full pointer-events-none translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        <div className="max-w-[48rem] mx-auto mb-16 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Dê o seu <span className="text-[#eab308]">próximo passo</span>
          </h2>
          <p className="text-base lg:text-lg text-slate-200 leading-relaxed">
            Junte-se a milhares de estudantes e acelere a sua jornada na Administração.
          </p>
        </div>
        
        <div ref={visibilityRef} className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 md:gap-y-16 lg:gap-y-0 pt-8 relative">
          {metrics.map((metric, index) => (
            <div 
              key={metric.id}
              className={`flex flex-col items-center text-center group ${
                index !== metrics.length - 1 ? 'lg:border-r border-white/[0.08]' : ''
              }`}
            >
              <metric.icon 
                className="w-8 h-8 md:w-10 md:h-10 text-[#38bdf8] mb-4 md:mb-5 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" 
                strokeWidth={1.5} 
              />

              <div className="flex flex-col items-center px-4">
                <span className="text-4xl md:text-5xl font-bold text-white mb-1 tracking-tight">
                  <CountUp end={metric.value} startAnimation={isVisible} />
                </span>
                <span className="text-xs md:text-sm font-medium text-slate-300">
                  {metric.label}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-16 relative z-10">
          <button 
            onClick={handleCtaClick}
            className="group flex items-center justify-center gap-[8px] rounded-full bg-[#eab308] py-[12px] px-8 text-sm font-bold text-black transition-all duration-300 hover:bg-[#facc15] hover:shadow-[0_10px_15px_-3px_rgba(234,179,8,0.2)] hc-border hc-no-underline"
          >
            Fazer parte do CRA-SP Educa
            <ChevronRight className="w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
