import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { lockScroll, unlockScroll, useModalAccessibility } from '../../lib/modalScroll';

export type ConfirmationModalProps = {
  isOpen: boolean;
  variant?: 'danger' | 'success' | 'info';
  title: string;
  description: string;
  cancelText?: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmationModal({
  isOpen,
  variant = 'danger',
  title,
  description,
  cancelText = 'Cancelar',
  confirmText,
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let locked = false;
    if (isOpen) {
      lockScroll();
      locked = true;
    }
    return () => {
      if (locked) unlockScroll();
    };
  }, [isOpen]);

  useModalAccessibility(modalRef, isOpen, onCancel);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isSuccess = variant === 'success';

  const iconBg = isDanger ? 'bg-red-100' : isSuccess ? 'bg-[#eff6ff]' : 'bg-gray-100';
  const iconColor = isDanger ? 'text-red-600' : isSuccess ? 'text-[#1e3a8a]' : 'text-gray-600';
  const confirmBg = isDanger ? 'bg-[#dc2626] hover:bg-red-700' : isSuccess ? 'bg-[#1e3a8a] hover:bg-[#1e40af] shadow-sm' : 'bg-gray-900 hover:bg-black';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-md bg-white rounded-[16px] shadow-2xl animate-zoom-in-95 overflow-hidden flex flex-col"
      >

        <div className="p-6 pb-8">
          <div className="flex gap-4 items-start">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
              <AlertTriangle className={`w-6 h-6 ${iconColor}`} aria-hidden="true" />
            </div>
            <div className="flex flex-col mt-1">
              <h2 id="confirmation-modal-title" className="text-xl font-bold text-gray-900 leading-tight">
                {title}
              </h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-100 py-[16px] px-6 flex items-center justify-end gap-[12px]">
          <button
            type="button"
            onClick={onCancel}
            className="px-[16px] py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-blue-700 focus:outline-none"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-6 py-2 text-sm font-medium text-white rounded-full transition-all focus-visible:ring-2 focus-visible:ring-blue-700 focus:outline-none ${confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
