import { create } from 'zustand';

interface HomeStore {
  cursosDestaque: any[];
  vagasDestaque: any[];
  instituicoes: any[];
  perguntas: any[];
  stats: { totalDeCursos: number; totalDeVagas: number } | null;
  loading: boolean;
  fetchHomeData: () => Promise<void>;
}

export const useHomeStore = create<HomeStore>((set, get) => ({
  cursosDestaque: [],
  vagasDestaque: [],
  instituicoes: [],
  perguntas: [],
  stats: null,
  loading: true,
  fetchHomeData: async () => {
    if (get().cursosDestaque.length > 0) return;
    set({ loading: true });
    try {
      const res = await fetch('/api/home-startup');
      if (res.ok) {
        const data = await res.json();
        set({ 
          cursosDestaque: data.cursosDestaque || [],
          vagasDestaque: data.vagasDestaque || [],
          instituicoes: data.instituicoes || [],
          perguntas: data.perguntas || [],
          stats: data.stats || null,
          loading: false 
        });
      } else {
        set({ loading: false });
      }
    } catch(err) {
      console.error('Erro ao buscar pacote inicial (home-startup):', err);
      set({ loading: false });
    }
  }
}));
