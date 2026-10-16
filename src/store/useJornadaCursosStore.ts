import { create } from 'zustand';

export interface JornadaCurso {
  id: string;
  cursoId: string;
  cursoSnapshot?: any;
  status: 'PRE_MATRICULADO' | 'MATRICULADO' | 'AGUARDANDO_CERTIFICADO' | 'EM_ANALISE' | 'CONCLUIDO' | 'DESISTIU';
  certificadoUrl?: string;
  avaliacao?: {
    notaCurso?: number;
    notaPlataforma?: number;
    notaMaterial?: number;
    comentario?: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

interface JornadaCursosState {
  jornadaCursos: JornadaCurso[];
  loading: boolean;
  hasFetched: boolean;
  updateJornadaCursoLocal: (cursoId: string, newStatus: JornadaCurso['status'], extra?: Partial<JornadaCurso>) => void;
  addJornadaCursoLocal: (jornadaCurso: JornadaCurso) => void;
}

export const useJornadaCursosStore = create<JornadaCursosState>((set) => ({
  jornadaCursos: [],
  loading: false,
  hasFetched: false,
  updateJornadaCursoLocal: (cursoId, newStatus, extra) => {
    set((state) => ({
      jornadaCursos: state.jornadaCursos.map(j => (j.cursoId === cursoId ? { ...j, ...extra, status: newStatus } : j))
    }));
  },
  addJornadaCursoLocal: (jornadaCurso) => {
    set((state) => {

      if (state.jornadaCursos.some(j => j.cursoId === jornadaCurso.cursoId)) {
        return {
          jornadaCursos: state.jornadaCursos.map(j =>
            j.cursoId === jornadaCurso.cursoId ? jornadaCurso : j
          )
        };
      }
      return { jornadaCursos: [...state.jornadaCursos, jornadaCurso] };
    });
  }
}));
