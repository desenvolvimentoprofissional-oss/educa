import { DocumentType } from '../../../hooks/useDocumentModal';

interface Props {
  lgpd: boolean | null;
  setLgpd: (val: boolean) => void;
  onOpenDocument: (type: DocumentType) => void;
}

export function LgpdAgreement({ lgpd, setLgpd, onOpenDocument }: Props) {
  return (
    <div className="pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Termos de Privacidade (LGPD)</h3>
        <button 
          type="button" 
          onClick={() => onOpenDocument('privacidade')}
          className="text-sm text-[#1e3a8a] hover:underline font-bold"
        >
          Ler Política Completa
        </button>
      </div>
      <div className="bg-gray-50 border border-gray-200 p-[20px] md:p-6 rounded-xl">
        <p className="text-sm text-gray-600 text-justify leading-relaxed">
          Nos termos da Lei Geral de Proteção de Dados - LGPD, autorizo o CRA-SP a utilizar meus dados pessoais para me enviar conteúdos relacionados à Administração, trabalho e negócios.
          Também aceito receber campanhas e/ou informações sobre a profissão de Administrador, possibilitando ações ligadas à sua missão institucional.
          A concordância deste termo não autoriza o compartilhamento de meus dados pessoais com terceiros, tampouco ações comerciais.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            type="button"
            onClick={() => setLgpd(true)}
            aria-label="Aceitar os termos de privacidade"
            className={`flex-1 px-[16px] py-[12px] font-bold rounded-xl transition-all duration-300 ${lgpd === true ? 'bg-green-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:border-green-600 hover:text-green-600'}`}
          >
            Aceito
          </button>
          <button
            type="button"
            onClick={() => setLgpd(false)}
            aria-label="Não aceitar os termos de privacidade"
            className={`flex-1 px-[16px] py-[12px] font-bold rounded-xl transition-all duration-300 ${lgpd === false ? 'bg-red-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600'}`}
          >
            Não aceito
          </button>
        </div>
      </div>
    </div>
  );
}
