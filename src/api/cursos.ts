import { Auth } from 'firebase/auth';

export const createCursosApi = (_authInstance?: Auth) => ({
  listar: async () => {
    const res = await fetch('/api/cursos');
    if (!res.ok) throw new Error("Erro ao listar cursos");
    return res.json();
  }
});
