import { Auth } from 'firebase/auth';

export const createJornadaVagasApi = (authInstance: Auth) => ({

  criar: async (vagaId: string, vagaSnapshot?: any) => {
    const user = authInstance.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const token = await user.getIdToken();
    const res = await fetch('/api/jornada-vagas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ vagaId, vagaSnapshot })
    });

    if (!res.ok) throw new Error("Erro ao criar jornadaVaga");
    return res.json();
  },

  atualizarStatus: async (vagaId: string, status: string) => {
    const user = authInstance.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const token = await user.getIdToken();
    const res = await fetch(`/api/jornada-vagas/${vagaId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (!res.ok) throw new Error("Erro ao atualizar status");
    return res.json();
  }
});
