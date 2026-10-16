import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface CookiesDocProps {
  headingColor: string;
  textColor: string;
  boxBg: string;
  onClose?: () => void;
  resetAccessibility: () => void;
}

export const CookiesDoc: React.FC<CookiesDocProps> = ({ headingColor, textColor, boxBg, onClose, resetAccessibility }) => {
  return (
    <div className="space-y-6">
      <div className={`p-6 border rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${boxBg}`}>
        <div className="flex-1">
          <div className="flex items-center gap-[8px]">
            <h3 className={`text-lg font-bold ${headingColor}`}>Autenticação e Segurança</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">Essencial</span>
          </div>
          <p className={`text-sm mt-2 ${textColor}`}>Garante que você permaneça logado e protege a sua conta contra acessos não autorizados. Sem isso, a plataforma não funciona.</p>
        </div>
        <div className={`flex items-center gap-[8px] border px-4 py-2 rounded-full text-sm font-bold shadow-sm shrink-0 ${boxBg} ${textColor}`}>
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          Sempre Ativo
        </div>
      </div>

      <div className={`p-6 border rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${boxBg}`}>
        <div className="flex-1">
          <div className="flex items-center gap-[8px]">
            <h3 className={`text-lg font-bold ${headingColor}`}>Preferências de Acessibilidade</h3>
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full dark:bg-gray-800 dark:text-gray-300">Funcional</span>
          </div>
          <p className={`text-sm mt-2 ${textColor}`}>Memoriza se você ativou o Alto Contraste ou aumentou a fonte (A+), para que a tela se mantenha constante ao mudar de página.</p>
        </div>
        <div className={`flex items-center gap-[8px] text-sm font-semibold shrink-0 px-4 py-2 ${textColor}`}>
          Opcional
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200/20 flex flex-col sm:flex-row items-center justify-end gap-4">
        <button 
          onClick={() => { resetAccessibility(); if(onClose) onClose(); }}
          className="px-6 py-2.5 rounded-lg border border-gray-300/50 hover:bg-gray-500/10 transition-colors shadow-sm text-sm font-bold"
        >
          Apenas Essenciais (Limpar Acessibilidade)
        </button>
        <button 
          onClick={() => { if(onClose) onClose(); }}
          className="px-6 py-2.5 rounded-lg bg-[#172554] text-white font-bold hover:bg-blue-900 transition-colors shadow-sm text-sm"
        >
          Concordar e Fechar
        </button>
      </div>
    </div>
  );
};
