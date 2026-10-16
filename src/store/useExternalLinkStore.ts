import { create } from 'zustand';
import { sanitizeUrlForOpenRedirect } from '../lib/validators';

interface ExternalLinkState {
  isOpen: boolean;
  url: string;
  institutionName: string;
  openLink: (url: string, institutionName?: string) => void;
  closeModal: () => void;
}

export const useExternalLinkStore = create<ExternalLinkState>((set) => ({
  isOpen: false,
  url: '',
  institutionName: '',
  openLink: (url, institutionName = 'instituição participante') => 
    set({ isOpen: true, url: sanitizeUrlForOpenRedirect(url), institutionName }),
  closeModal: () => set({ isOpen: false, url: '', institutionName: '' }),
}));
