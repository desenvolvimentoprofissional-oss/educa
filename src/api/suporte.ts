import { Auth } from "firebase/auth";

export const createSuporteApi = (authInstance: Auth) => ({
  enviarMensagem: async (payload: { assunto: string; mensagem: string }) => {
    const user = authInstance.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const token = await user.getIdToken();
    const response = await fetch('/api/usuarios/suporte', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.details) {
        throw new Error(errorData.error);
      }
      throw new Error(errorData.error || 'Falha ao enviar mensagem de suporte');
    }

    return response.json();
  }
});
