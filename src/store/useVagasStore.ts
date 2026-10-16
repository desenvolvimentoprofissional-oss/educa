import { create } from 'zustand';
import { VagaCatalogo } from '../types/catalog';

export type Vaga = VagaCatalogo;

interface VagasStore {
  vagas: Vaga[];
  loading: boolean;
  fetchVagas: () => Promise<void>;
  }

export const useVagasStore = create<VagasStore>((set, get) => ({
  vagas: [],
  loading: false,
  fetchVagas: async () => {
    if (get().vagas.length > 0) return;
    set({ loading: true });
    try {
      const response = await fetch('/api/vagas');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const vagasComId = data.map((v: any) => ({ ...v, id: v.codigoDaVaga || Math.random().toString(36).substr(2, 9) }));
          set({ vagas: vagasComId, loading: false });
        } else {
          set({ vagas: [], loading: false });
        }
      } else {
        console.error('Erro ao buscar vagas.');
        set({ loading: false });
      }
    } catch (error) {
      console.error('Erro na requisição de vagas:', error);
      set({ loading: false });
    }
  },
}));
