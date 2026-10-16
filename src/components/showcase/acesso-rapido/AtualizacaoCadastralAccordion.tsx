import React, { useState } from 'react';
import { UserCog, Mail, Phone } from 'lucide-react';
import { api } from '../../../api';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

export function AtualizacaoCadastralAccordion(_props: Props) {
  const [contactLoading, setContactLoading] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactFeedback, setContactFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactFeedback(null);

    if (!contactEmail.trim() && !contactPhone.trim()) {
      setContactFeedback({ type: 'error', message: 'Por favor, preencha pelo menos o e-mail ou o telefone.' });
      return;
    }

    setContactLoading(true);
    try {
      await api.usuarios.atualizarContato(contactEmail, contactPhone);
      setContactFeedback({ type: 'success', message: 'Dados de contato atualizados com sucesso!' });
      setContactEmail("");
      setContactPhone("");
    } catch (error: any) {
      console.error(error);
      setContactFeedback({ type: 'error', message: 'Erro ao atualizar contato. Tente novamente.' });
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[16px] shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-4 p-[24px] pb-4 border-b border-gray-100">
        <div className="w-12 h-[48px] rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <UserCog className="w-6 h-[24px]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1f2937]">
            Atualização Cadastral
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Mantenha seus dados em dia
          </p>
        </div>
      </div>
      
      <div className="p-[24px] flex-1 flex flex-col">
        {contactFeedback && (
          <div
            role={contactFeedback.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`mb-4 p-3 rounded-lg text-sm font-medium ${
              contactFeedback.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {contactFeedback.message}
          </div>
        )}
        <form onSubmit={handleUpdateContact} className="flex flex-col gap-4 mt-auto">
          <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <strong>Atenção:</strong> A alteração de e-mail nesta seção atualiza apenas o seu e-mail de contato para notificações. O seu e-mail de acesso (login) permanece o mesmo.
          </p>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input id="contactEmail" name="contactEmail"
              type="email"
              aria-label="Novo E-mail de Contato"
              placeholder="Novo E-mail de Contato"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full pl-11 pr-3 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-gray-50/50 focus:bg-white"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input id="contactPhone" name="contactPhone"
              type="tel"
              aria-label="Telefone ou WhatsApp"
              placeholder="Telefone / WhatsApp"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full pl-11 pr-3 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-gray-50/50 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={contactLoading}
            className="w-full rounded-xl bg-[#1e3a8a] text-white py-3 text-sm font-semibold hover:bg-[#1e40af] transition-colors disabled:opacity-50 mt-2"
          >
            {contactLoading ? "Salvando..." : "Salvar Dados"}
          </button>
        </form>
      </div>
    </div>
  );
}
