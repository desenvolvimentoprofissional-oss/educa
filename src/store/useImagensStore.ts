import { create } from 'zustand';

interface ImagensState {
  imagensPublicas: string[];
  isLoading: boolean;
  error: string | null;
  fetchImagens: () => Promise<void>;
}

export const useImagensStore = create<ImagensState>((set, get) => ({
  imagensPublicas: [],
  isLoading: false,
  error: null,
  fetchImagens: async () => {
    if (get().imagensPublicas.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/imagens');
      if (!response.ok) {
        throw new Error('Falha ao carregar imagens públicas');
      }
      const data = await response.json();
      set({ imagensPublicas: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Erro desconhecido', isLoading: false });
    }
  }
}));
