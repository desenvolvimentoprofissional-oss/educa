import { Auth } from 'firebase/auth';

export const createJornadaCursosApi = (authInstance: Auth) => ({

  criar: async (cursoId: string, cursoSnapshot?: any) => {
    const user = authInstance.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const token = await user.getIdToken();
    const res = await fetch('/api/jornada-cursos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cursoId, cursoSnapshot })
    });

    if (!res.ok) {
      throw new Error('Falha ao criar jornada');
    }

    return res.json();
  },

  atualizarStatus: async (cursoId: string, status: string, options?: { certificadoUrl?: string, avaliacao?: any }) => {
    const user = authInstance.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const token = await user.getIdToken();
    const res = await fetch(`/api/jornada-cursos/${cursoId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, ...options })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (errorData.details) {
        throw new Error(errorData.error + " - Detalhes: " + JSON.stringify(errorData.details));
      }
      throw new Error(errorData.error || 'Falha ao atualizar status');
    }

    return res.json();
  }
});
