import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AccessibilityState {
  fontSizeScale: number;
  isHighContrast: boolean;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  toggleHighContrast: () => void;
  resetAccessibility: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      fontSizeScale: 1,
      isHighContrast: false,

      increaseFontSize: () =>
        set((state) => ({
          fontSizeScale: Math.min(state.fontSizeScale + 0.125, 1.5)
        })),

      decreaseFontSize: () =>
        set((state) => ({
          fontSizeScale: Math.max(state.fontSizeScale - 0.125, 1.0)
        })),

      resetFontSize: () =>
        set(() => ({
          fontSizeScale: 1
        })),

      toggleHighContrast: () =>
        set((state) => ({
          isHighContrast: !state.isHighContrast
        })),

      resetAccessibility: () =>
        set({
          fontSizeScale: 1,
          isHighContrast: false,
        }),
    }),
    {
      name: 'accessibility-storage',
    }
  )
);
