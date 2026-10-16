import { create } from 'zustand';

export interface JornadaVaga {
  id: string;
  vagaId: string;
  vagaSnapshot?: any;
  status: 'PRE_CANDIDATADO' | 'CANDIDATADO' | 'NAO_FOI_DESTA_VEZ' | 'CONTRATADO' | 'DESISTIU';
  createdAt?: any;
  updatedAt?: any;
}

interface JornadaVagasState {
  jornadaVagas: JornadaVaga[];
  loading: boolean;
  hasFetched: boolean;
  updateJornadaVagaLocal: (vagaId: string, newStatus: JornadaVaga['status']) => void;
  addJornadaVagaLocal: (jornadaVaga: JornadaVaga) => void;
}

export const useJornadaVagasStore = create<JornadaVagasState>((set) => ({
  jornadaVagas: [],
  loading: false,
  hasFetched: false,
  updateJornadaVagaLocal: (vagaId, newStatus) => {
    set((state) => ({
      jornadaVagas: state.jornadaVagas.map(c => (c.vagaId === vagaId ? { ...c, status: newStatus } : c))
    }));
  },
  addJornadaVagaLocal: (jornadaVaga) => {
    set((state) => {
      if (state.jornadaVagas.some(c => c.vagaId === jornadaVaga.vagaId)) {
        return {
          jornadaVagas: state.jornadaVagas.map(c =>
            c.vagaId === jornadaVaga.vagaId ? jornadaVaga : c
          )
        };
      }
      return { jornadaVagas: [...state.jornadaVagas, jornadaVaga] };
    });
  }
}));
