import { Auth } from 'firebase/auth';

const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const createCertificadosApi = (authInstance: Auth) => ({
  enviar: async (cursoId: string, file: File) => {
    const user = authInstance.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    if (file.size > 1 * 1024 * 1024) {
      throw new Error("Arquivo excede o limite de 1MB");
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Formato inválido. Permitido apenas PDF, PNG ou JPEG.");
    }

    const token = await user.getIdToken();
    const base64File = await toBase64(file);

    const res = await fetch('/api/certificados', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        cursoId, 
        fileName: file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.\.+/g, '.'),
        fileType: file.type,
        fileData: base64File 
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao enviar certificado');
    }

    const data = await res.json();
    return data.url;
  }
});
