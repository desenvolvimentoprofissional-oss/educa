import React, { useState } from 'react';
import { Headset, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../../../api';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

export function CentralAjudaAccordion(_props: Props) {
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSent, setSupportSent] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) return;

    setSupportLoading(true);
    setSupportError(null);
    try {
      await api.suporte.enviarMensagem({ assunto: supportSubject, mensagem: supportMessage });
      setSupportSent(true);
      setSupportSubject("");
      setSupportMessage("");
    } catch (error: any) {
      console.error("Erro ao enviar suporte:", error);
      setSupportError(error.message || "Falha de conexão.");
    } finally {
      setSupportLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[16px] shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-4 p-[24px] pb-4 border-b border-gray-100">
        <div className="w-12 h-[48px] rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Headset className="w-6 h-[24px]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1f2937]">
            Central de Ajuda
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Fale com nossa equipe
          </p>
        </div>
      </div>

      <div className="p-[24px] flex-1 flex flex-col">
        {supportSent ? (
          <div role="status" aria-live="polite" className="flex flex-col items-center justify-center text-center flex-1 py-[16px]">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-[16px]">
              <CheckCircle2 className="w-8 h-8 text-green-600" aria-hidden="true" />
            </div>
            <h4 className="text-base font-bold text-gray-900 mb-2">Mensagem enviada</h4>
            <p className="text-sm text-gray-500 max-w-[200px]">
              Nossa equipe de suporte entrará em contato em breve.
            </p>
            <button
              type="button"
              onClick={() => setSupportSent(false)}
              className="mt-6 text-sm font-semibold text-blue-600 hover:underline"
            >
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendSupport} className="flex flex-col gap-4 mt-auto">
            {supportError && (
              <div role="alert" className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                {supportError}
              </div>
            )}
            <select
              id="support-subject"
              aria-label="Assunto do chamado"
              value={supportSubject}
              onChange={(e) => setSupportSubject(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-gray-50/50 focus:bg-white"
            >
              <option value="" disabled>Selecione um assunto...</option>
              <option value="Dúvida sobre cursos">Dúvida sobre cursos</option>
              <option value="Dúvida sobre vagas">Dúvida sobre vagas</option>
              <option value="Problemas com certificado">Problemas com certificado</option>
              <option value="Problemas de acesso">Problemas de acesso</option>
              <option value="Outros">Outros</option>
            </select>
            <textarea
              id="support-message"
              aria-label="Mensagem para a Central de Ajuda"
              placeholder="Como podemos te ajudar?"
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none bg-gray-50/50 focus:bg-white"
            />
            <button
              type="submit"
              disabled={supportLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] text-white py-3 text-sm font-semibold hover:bg-[#1e40af] transition-colors disabled:opacity-50 mt-2"
            >
              {supportLoading ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Mensagem
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
