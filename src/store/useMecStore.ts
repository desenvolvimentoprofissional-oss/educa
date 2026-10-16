import { create } from 'zustand';
import { IES, Campus, Curso } from '../types/schemas';
import { auth } from '../lib/firebase';

interface MecState {
  iesList: IES[];
  campusList: Campus[];
  cursoList: Curso[];
  loadingIes: boolean;
  loadingCampus: boolean;
  loadingCursos: boolean;
  fetchIesList: () => Promise<void>;
  fetchCampusList: (codIes: string) => Promise<void>;
  fetchCursoList: (codIes: string, codLocal: string, filtroGrau: string) => Promise<void>;
  clearCampusList: () => void;
  clearCursoList: () => void;
}

let iesReqId = 0;
let campusReqId = 0;
let cursoReqId = 0;

export const useMecStore = create<MecState>((set) => ({
  iesList: [],
  campusList: [],
  cursoList: [],
  loadingIes: false,
  loadingCampus: false,
  loadingCursos: false,

  fetchIesList: async () => {
    const reqId = ++iesReqId;
    set({ loadingIes: true });
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : '';
      
      const res = await fetch('/api/mec/ies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`Servidor retornou status: ${res.status}`);
      }
      
      const data = await res.json();
      if (reqId !== iesReqId) return;
      
      if (Array.isArray(data)) {
        set({ iesList: data });
      } else {
        console.error("Payload e-MEC inválido (IES):", data);
        set({ iesList: [] });
      }
    } catch (err) {
      if (reqId !== iesReqId) return;
      console.error("Erro estrutural ao buscar IES:", err);
      set({ iesList: [] });
    } finally {
      if (reqId === iesReqId) {
        set({ loadingIes: false });
      }
    }
  },

  fetchCampusList: async (codIes) => {
    const reqId = ++campusReqId;
    set({ loadingCampus: true });
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : '';

      const res = await fetch(`/api/mec/campus/${encodeURIComponent(codIes)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`Servidor retornou status: ${res.status}`);
      }
      
      const data = await res.json();
      if (reqId !== campusReqId) return;
      
      if (Array.isArray(data)) {
        set({ campusList: data });
      } else {
        console.error("Payload e-MEC inválido (Campus):", data);
        set({ campusList: [] });
      }
    } catch (err) {
      if (reqId !== campusReqId) return;
      console.error("Erro estrutural ao buscar Campus:", err);
      set({ campusList: [] });
    } finally {
      if (reqId === campusReqId) {
        set({ loadingCampus: false });
      }
    }
  },

  fetchCursoList: async (codIes, codLocal, filtroGrau) => {
    const reqId = ++cursoReqId;
    set({ loadingCursos: true });
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : '';

      const res = await fetch(`/api/mec/cursos/${encodeURIComponent(codIes)}/${encodeURIComponent(codLocal)}?filtroGrau=${encodeURIComponent(filtroGrau)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`Servidor retornou status: ${res.status}`);
      }
      
      const data = await res.json();
      if (reqId !== cursoReqId) return;
      
      if (Array.isArray(data)) {
        set({ cursoList: data });
      } else {
        console.error("Payload e-MEC inválido (Cursos):", data);
        set({ cursoList: [] });
      }
    } catch (err) {
      if (reqId !== cursoReqId) return;
      console.error("Erro estrutural ao buscar Cursos:", err);
      set({ cursoList: [] });
    } finally {
      if (reqId === cursoReqId) {
        set({ loadingCursos: false });
      }
    }
  },

  clearCampusList: () => {
    campusReqId++;
    set({ campusList: [], loadingCampus: false });
  },
  clearCursoList: () => {
    cursoReqId++;
    set({ cursoList: [], loadingCursos: false });
  },
}));
