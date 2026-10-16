import { create } from 'zustand';

interface SearchState {
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  globalSearchTerm: '',
  setGlobalSearchTerm: (term) => set({ globalSearchTerm: term }),
}));
