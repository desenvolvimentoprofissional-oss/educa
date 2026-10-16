import { create } from 'zustand';
import { CursoCatalogo } from '../types/catalog';
import { api } from '../api';

export type Curso = CursoCatalogo;

interface CursosState {
  cursos: Curso[];
  loading: boolean;
  fetchCursos: () => Promise<void>;
}

export const useCursosStore = create<CursosState>((set, get) => ({
  cursos: [],
  loading: false,
  fetchCursos: async () => {
    if (get().cursos.length > 0) return;
    set({ loading: true });
    try {
      const data = await api.cursos.listar();
      set({ cursos: Array.isArray(data) ? data : [], loading: false });
    } catch (err) {
      console.error("Erro ao buscar cursos:", err);
      set({ loading: false });
    }
  },
}));
