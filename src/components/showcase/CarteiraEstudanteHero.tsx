import { useState } from 'react';
import { api } from '../../api';
import { useAuthStore, getAuthSessionSnapshot, isAuthSessionCurrent } from '../../store/useAuthStore';
import { useExternalLinkStore } from '../../store/useExternalLinkStore';

interface CarteiraEstudanteHeroProps {
  firstName: string;
  onDismissSession: () => void;
}
export function CarteiraEstudanteHero({ firstName, onDismissSession }: CarteiraEstudanteHeroProps) {
  const { setUserData } = useAuthStore();
  const { openLink } = useExternalLinkStore();
  const [loading, setLoading] = useState(false);
  const handleMarkAsOwned = async () => {
    const sessionSnap = getAuthSessionSnapshot();
    try {
      setLoading(true);
      await api.usuarios.marcarCarteiraComoObtida();
      if (!isAuthSessionCurrent(sessionSnap)) return;
      const currentUserData = useAuthStore.getState().userData;
      if (currentUserData) {
        setUserData({ ...currentUserData, statusCarteira: 'JA_TENHO' });
      }
    } catch (error) {
      console.error('Erro ao atualizar status da carteira:', error);
    } finally {
      if (isAuthSessionCurrent(sessionSnap)) {
        setLoading(false);
      }
    }
  };
  return (
    <div className="relative rounded-[16px] bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] p-[24px] sm:p-[32px] lg:p-[40px] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),_0_4px_6px_-4px_rgba(0,0,0,0.1)] flex items-center">
      <div className="absolute inset-0 overflow-hidden rounded-[16px] pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5"
          style={{ transform: 'translateY(-50%) translateX(33.333333%)' }}
        />
        <div 
          className="absolute bottom-0 right-32 w-48 h-48 rounded-full bg-white/5"
          style={{ transform: 'translateY(33.333333%) translateX(25%)' }}
        />
      </div>
      <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="w-full md:max-w-2xl lg:max-w-3xl">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-2 md:whitespace-nowrap">
            Carteira de Estudante da Administração
          </h1>
          <p className="text-lg text-[#dbeafe] leading-relaxed mb-6 max-w-xl">
            Olá, {firstName}! Garanta já a sua Carteira de Estudante oficial do CRA-SP.<br/>
            É 100% gratuita, digital e cheia de benefícios.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => openLink('https://crasp.gov.br/estudante/carteira/', 'CRA-SP')}
              className="inline-flex items-center justify-center rounded-full bg-yellow-500 border border-transparent text-black py-2.5 px-6 text-sm font-semibold transition-colors hover:bg-yellow-400"
            >
              Eu Quero
            </button>
            <button 
              onClick={handleMarkAsOwned}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white py-2.5 px-6 text-sm font-semibold transition-colors hover:bg-white/20 disabled:opacity-50"
            >
              {loading ? 'Atualizando...' : 'Já tenho'}
            </button>
            <button 
              onClick={onDismissSession}
              className="inline-flex items-center justify-center rounded-full bg-transparent border border-white/40 text-white/80 py-2.5 px-6 text-sm font-semibold transition-colors hover:bg-white/10 hover:border-white/60 hover:text-white"
            >
              Ver depois
            </button>
          </div>
        </div>
      </div>
      <img 
        src="/image-carteiraestudante.webp?v=2" 
        alt="Carteira de Estudante CRA-SP" 
        className="absolute right-4 -bottom-0 h-[100%] md:h-[115%] object-contain object-right-bottom hidden md:block z-20 pointer-events-none"
        style={{ maxWidth: '40%' }}
      />
    </div>
  );
}
