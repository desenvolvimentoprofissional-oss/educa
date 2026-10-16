import { create } from 'zustand';

export type DashboardTab = 'vitrine' | 'inicio' | 'dados' | 'cursos' | 'vagas' | 'conquistas';

interface NavigationState {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: 'inicio',
  setActiveTab: (tab) => set({ activeTab: tab })
}));
