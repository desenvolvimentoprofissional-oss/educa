import { create } from 'zustand';
import type { User, Unsubscribe } from 'firebase/auth';
import { useJornadaCursosStore } from './useJornadaCursosStore';
import { useJornadaVagasStore } from './useJornadaVagasStore';
import { useNavigationStore } from './useNavigationStore';

interface AuthState {
  user: User | null;
  profileComplete: boolean | null;
  userData: any | null;
  loading: boolean;
  isLoginOpen: boolean;
  totalUsuarios: number | null;
  totalMatriculas: number | null;
  totalDeCursos: number | null;
  totalDeVagas: number | null;
  setUser: (user: User | null) => void;
  setProfileComplete: (complete: boolean | null) => void;
  setUserData: (data: any | null) => void;
  setLoading: (loading: boolean) => void;
  setIsLoginOpen: (isOpen: boolean) => void;
  setTotalUsuarios: (total: number | null) => void;
  signOut: () => Promise<void>;
  initializeAuth: () => void;
  cleanupAuth: () => void;
  fetchTotais: () => Promise<void>;
}

let globalUnsubscribe: Unsubscribe | null = null;
let isInitializingAuth = false;
let initGeneration = 0;
let authEpoch = 0;
let activeSessionUid: string | null = null;

export interface AuthSessionSnapshot {
  epoch: number;
  uid: string | null;
}

export function getAuthSessionSnapshot(): AuthSessionSnapshot {
  return { epoch: authEpoch, uid: activeSessionUid };
}

export function isAuthSessionCurrent(snapshot: AuthSessionSnapshot): boolean {
  return Boolean(snapshot.uid) && snapshot.epoch === authEpoch && snapshot.uid === activeSessionUid;
}

function clearUserJourneyStores() {
  try {
    sessionStorage.removeItem('crasp_waitingReturnForCursoId');
    sessionStorage.removeItem('crasp_activeJornadaId');
    sessionStorage.removeItem('crasp_waitingReturnForVagaId');
    sessionStorage.removeItem('crasp_activeJornadaVagaId');
  } catch {}
  useJornadaCursosStore.setState({ jornadaCursos: [], hasFetched: false, loading: false });
  useJornadaVagasStore.setState({ jornadaVagas: [], hasFetched: false, loading: false });
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profileComplete: null,
  userData: null,
  loading: true,
  isLoginOpen: false,
  totalUsuarios: null,
  totalMatriculas: null,
  totalDeCursos: null,
  totalDeVagas: null,

  setUser: (user) => {
    set({ user });
  },
  setProfileComplete: (complete) => set({ profileComplete: complete }),
  setUserData: (data) => set({ userData: data }),
  setLoading: (loading) => set({ loading }),
  setIsLoginOpen: (isOpen) => set({ isLoginOpen: isOpen }),
  setTotalUsuarios: (total) => set({ totalUsuarios: total }),

  signOut: async () => {
    authEpoch += 1;
    activeSessionUid = null;
    try { localStorage.removeItem('crasp_has_session'); } catch {}
    clearUserJourneyStores();
    useNavigationStore.setState({ activeTab: 'vitrine' });
    set({ user: null, profileComplete: null, userData: null, isLoginOpen: false, loading: false });

    const { auth } = await import('../lib/firebase');
    const { signOut: firebaseSignOut } = await import('firebase/auth');
    await firebaseSignOut(auth);
  },

  fetchTotais: async () => {
    try {
      const res = await fetch('/api/metadados/totais');
      if (!res.ok) {
        throw new Error(`[AppSec] Resposta inválida de metadados: ${res.status}`);
      }
      const data = await res.json();
      set({ 
        totalUsuarios: data.totalUsuarios || 0,
        totalMatriculas: data.totalMatriculas || 0,
        totalDeCursos: data.totalDeCursos || 0,
        totalDeVagas: data.totalDeVagas || 0
      });
    } catch (err) {
      console.error("[AppSec] Erro ao buscar totais:", err);
    }
  },

  initializeAuth: () => {
    if (globalUnsubscribe || isInitializingAuth) return;
    isInitializingAuth = true;
    const myInitGen = ++initGeneration;

    import('../lib/firebase').then(({ auth }) => {
      if (myInitGen !== initGeneration || !isInitializingAuth) return;
      import('firebase/auth').then(({ onAuthStateChanged, signOut: firebaseSignOut }) => {
        if (myInitGen !== initGeneration || !isInitializingAuth || globalUnsubscribe) return;
        isInitializingAuth = false;
        globalUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (myInitGen !== initGeneration) return;
          const myEpoch = ++authEpoch;
          const currentUid = currentUser?.uid ?? null;
          activeSessionUid = currentUid;

          clearUserJourneyStores();

          if (!currentUser || !currentUid) {
            try { localStorage.removeItem('crasp_has_session'); } catch {}
            useNavigationStore.setState({ activeTab: 'vitrine' });
            set({ user: null, profileComplete: null, userData: null, loading: false });
            return;
          }

          try { localStorage.setItem('crasp_has_session', '1'); } catch {}
          set({ user: currentUser, profileComplete: null, userData: null, loading: true });

          try {
            const token = await currentUser.getIdToken();
            if (myEpoch !== authEpoch || activeSessionUid !== currentUid) return;

            const res = await fetch('/api/usuarios/check-profile', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-store'
              }
            });
            if (myEpoch !== authEpoch || activeSessionUid !== currentUid) return;

            if (!res.ok) {
              throw new Error(`[AppSec] Resposta de erro do servidor: ${res.status}`);
            }

            const data = await res.json();
            if (myEpoch !== authEpoch || activeSessionUid !== currentUid) return;

            let userData = null;
            if (data.profileComplete) {
              userData = data.data;
              useJornadaCursosStore.setState({ jornadaCursos: userData?.jornadaCursos || [], hasFetched: true, loading: false });
              useJornadaVagasStore.setState({ jornadaVagas: userData?.jornadaVagas || [], hasFetched: true, loading: false });
            } else {
              clearUserJourneyStores();
            }

            set({
              user: currentUser,
              profileComplete: !!data.profileComplete,
              userData,
              loading: false
            });
          } catch (err) {
            if (myEpoch !== authEpoch || activeSessionUid !== currentUid) return;
            console.error("[AppSec] Falha na verificação de perfil:", err instanceof Error ? err.message : 'Erro');
            try { localStorage.removeItem('crasp_has_session'); } catch {}
            clearUserJourneyStores();
            set({
              user: null,
              profileComplete: null,
              userData: null,
              loading: false
            });
            try {
              await firebaseSignOut(auth);
            } catch {}
          }
        });
      });
    });
  },

  cleanupAuth: () => {
    initGeneration += 1;
    authEpoch += 1;
    activeSessionUid = null;
    isInitializingAuth = false;
    if (globalUnsubscribe) {
      globalUnsubscribe();
      globalUnsubscribe = null;
    }
  }
}));
