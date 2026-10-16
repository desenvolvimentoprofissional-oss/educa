import { Router } from 'express';
import { 
  getCursos, 
  getVagas, 
  getHomeStartup,
  getMetadadosTotais
} from '../controllers/catalogoController.ts';

export const catalogoRouter = Router();

catalogoRouter.get('/cursos', async (_req, res) => {
  await getCursos(res);
});

catalogoRouter.get('/vagas', async (_req, res) => {
  await getVagas(res);
});

catalogoRouter.get('/home-startup', async (_req, res) => {
  await getHomeStartup(res);
});

catalogoRouter.get('/metadados/totais', async (_req, res) => {
  await getMetadadosTotais(res);
});
