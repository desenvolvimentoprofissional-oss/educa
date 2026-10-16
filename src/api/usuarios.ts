import { Auth } from 'firebase/auth';
import { ProfilePayload } from '../types/schemas';

export const createUsuariosApi = (authInstance: Auth) => ({
  salvarPerfil: async (payload: ProfilePayload) => {
    const user = authInstance.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const token = await user.getIdToken();
    const res = await fetch('/api/usuarios/perfil', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || "Erro ao salvar perfil");
    }
    return res.json();
  },

  atualizarContato: async (emailContato: string, telefone: string) => {
    const user = authInstance.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const token = await user.getIdToken();
    const res = await fetch('/api/usuarios/contato', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ emailContato, telefone })
    });

    if (!res.ok) throw new Error("Erro ao atualizar contato");
    return res.json();
  },

  marcarCarteiraComoObtida: async () => {
    const user = authInstance.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const token = await user.getIdToken();
    const res = await fetch('/api/usuarios/carteira', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Erro ao atualizar status da carteira");
    return res.json();
  }
});
