import { auth } from '../lib/firebase';
import { createUsuariosApi } from './usuarios';
import { createCursosApi } from './cursos';
import { createJornadaCursosApi } from './jornadaCursos';
import { createCertificadosApi } from './certificados';
import { createJornadaVagasApi } from './jornadaVagas';
import { createSuporteApi } from './suporte';

export const api = {
  usuarios: createUsuariosApi(auth),
  cursos: createCursosApi(auth),
  jornadaCursos: createJornadaCursosApi(auth),
  certificados: createCertificadosApi(auth),
  jornadaVagas: createJornadaVagasApi(auth),
  suporte: createSuporteApi(auth)
};
