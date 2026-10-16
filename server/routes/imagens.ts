import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ensurePaginaPublicaLoaded, getPaginaPublicaCache } from '../services/cache.ts';
import { sanitizeLogText } from '../utils/logSanitizer.ts';

export const imagensRouter = Router();

const imagensLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, 
  message: { error: 'Muitas requisições, tente novamente mais tarde.' }
});

imagensRouter.get('/', imagensLimiter, async (_req, res) => {
  try {
    await ensurePaginaPublicaLoaded();
    const cache = getPaginaPublicaCache();
    
    if (!cache) {
      return res.status(500).json({ error: 'Cache indisponível' });
    }

    const imagesArray = cache.imagensPublicas || [];
    const urls = imagesArray.map((img: any) => typeof img === 'string' ? img : (img.url || img.imageUrl || img.src || img.link || ''));
    res.json(urls.filter(Boolean));
  } catch (error) {
    console.error('Erro ao buscar imagens:', sanitizeLogText(error));
    res.status(500).json({ error: 'Erro interno ao buscar imagens' });
  }
});
