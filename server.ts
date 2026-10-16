import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initCache } from './server/services/cache.ts';

import { catalogoRouter } from './server/routes/catalogo.ts';
import { usuariosRouter } from './server/routes/usuarios.ts';
import { jornadaCursosRouter } from './server/routes/jornadaCursos.ts';
import { jornadaVagasRouter } from './server/routes/jornadaVagas.ts';
import { certificadosRouter } from './server/routes/certificados.ts';
import { imagensRouter } from './server/routes/imagens.ts';
import { mecRouter } from './server/routes/mec.ts';
import { getSafeRouteId } from './server/utils/logSanitizer.ts';

if (!process.env.VAULT_ENCRYPTION_KEY || process.env.VAULT_ENCRYPTION_KEY.length !== 64) {
  console.error("FATAL: VAULT_ENCRYPTION_KEY obrigatória (64 caracteres hexadecimais) não encontrada.");
  process.exit(1);
}

if (!process.env.HMAC_PEPPER_KEY) {
  console.error('FATAL: HMAC_PEPPER_KEY obrigatória não encontrada nas variáveis de ambiente.');
  process.exit(1);
}

if (getApps().length === 0) {
  let credentialsStr = process.env.FIREBASE_ADMIN_CREDENTIALS;
  
  const secretPath = '/secrets/firebase-credentials.json';
  if (fs.existsSync(secretPath)) {
    credentialsStr = fs.readFileSync(secretPath, 'utf8');
    console.log('🔒 Credencial Firebase Admin carregada via Volume seguro (Secret Manager).');
  }

  if (!credentialsStr) {
    console.error('FATAL: Credencial do Firebase Admin não encontrada (nem em /secrets, nem nas variáveis de ambiente).');
    process.exit(1);
  }

  let serviceAccount;
  try {
    if (typeof credentialsStr !== 'string') {
      throw new Error("Credencial ausente ou formato inválido.");
    }

    serviceAccount = JSON.parse(credentialsStr);

    if (typeof serviceAccount?.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    if (!serviceAccount.project_id || !serviceAccount.private_key) {
      throw new Error("Payload da credencial incompleto (chaves obrigatórias ausentes).");
    }

    initializeApp({ 
      credential: cert(serviceAccount),
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET
    });
    console.log('Firebase Admin inicializado com sucesso.');

    const vaultCredentialsStr = process.env.FIREBASE_COFRE_CREDENTIALS;
    if (vaultCredentialsStr) {
      try {
        if (typeof vaultCredentialsStr !== 'string') {
          throw new Error("Credencial do cofre inválida.");
        }
        const vaultServiceAccount = JSON.parse(vaultCredentialsStr);

        if (typeof vaultServiceAccount?.private_key === 'string') {
          vaultServiceAccount.private_key = vaultServiceAccount.private_key.replace(/\\n/g, '\n');
        }
        
        if (!vaultServiceAccount.project_id || !vaultServiceAccount.private_key) {
          throw new Error("Payload da credencial do cofre incompleto.");
        }

        initializeApp({ 
          credential: cert(vaultServiceAccount) 
        }, 'vaultProject');

        console.log('✅ Firebase Admin (Cofre/Vault) inicializado com sucesso.');
      } catch (_vaultError) {
        console.error('🔒 [FALHA DE SEGURANÇA/INFRA] Erro crítico ao carregar credenciais do Cofre. Detalhes omitidos.');
      }
    } else {
      console.warn('⚠️ AVISO: FIREBASE_COFRE_CREDENTIALS não encontrada no ambiente.');
    }

  } catch (_error) {
    console.error("🔒 [FALHA DE SEGURANÇA/INFRA] Erro fatal ao carregar credenciais do Firebase Admin. Abortando inicialização do servidor para evitar estado inseguro.");
    process.exit(1);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(compression() as any);

  app.set('trust proxy', 1);

  app.use((_req, res, next) => {
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), fullscreen=()');
    next();
  });

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
          manifestSrc: ["'self'"],
          objectSrc: ["'none'"],
          scriptSrc: [
            "'self'", "https://apis.google.com", "https://*.gstatic.com", "https://*.firebaseapp.com",
            "https://vlibras.gov.br", "https://*.vlibras.gov.br", "https://cdn.jsdelivr.net",
            "'sha384-SCil2fuOCOLYO4bxpOW27F/feaFLCHDhc5HDDad0feHUHd0Q6+Wye9e/8Lq09Vqj'",
            "'sha256-Jnum4rEBEM3Vv7LWvUrTU5hwfSQiL9Atg8EhUJGC5vc='"
          ],
          scriptSrcElem: [
            "'self'", "https://apis.google.com", "https://*.gstatic.com", "https://*.firebaseapp.com",
            "https://vlibras.gov.br", "https://*.vlibras.gov.br", "https://cdn.jsdelivr.net",
            "'sha384-SCil2fuOCOLYO4bxpOW27F/feaFLCHDhc5HDDad0feHUHd0Q6+Wye9e/8Lq09Vqj'",
            "'sha256-Jnum4rEBEM3Vv7LWvUrTU5hwfSQiL9Atg8EhUJGC5vc='"
          ],
          connectSrc: [
            "'self'", "https://apis.google.com", "https://*.googleapis.com", "https://securetoken.googleapis.com",
            "https://identitytoolkit.googleapis.com", "https://*.firebaseapp.com", "https://vlibras.gov.br",
            "https://*.vlibras.gov.br", "https://dicionario2.vlibras.gov.br", "https://cdn.jsdelivr.net",
            "wss://vlibras.gov.br", "wss://*.vlibras.gov.br"
          ],
          frameSrc: [
            "'self'", "https://*.firebaseapp.com", "https://vlibras.gov.br",
            "https://*.vlibras.gov.br", "https://cdn.jsdelivr.net"
          ],
          imgSrc: [
            "'self'", "data:", "blob:", "https:",
            "https://vlibras.gov.br", "https://*.vlibras.gov.br", "https://cdn.jsdelivr.net"
          ],
          styleSrc: [
            "'self'", ...(process.env.NODE_ENV !== 'production' ? ["'unsafe-inline'"] : []),
            "https://fonts.googleapis.com", "https://vlibras.gov.br", "https://*.vlibras.gov.br", "https://cdn.jsdelivr.net",
            "'sha256-eUb4QNOqGDF5+49sdjTMcZSJwJagVldqY68xFObUKcE='", "'sha256-K1YGCJ9Cg1Y7R6JLOf8v8m/fYMKl7z8n4H6C96EuRE4='",
            "'sha256-qPyzoFroCvx+YazqbYBtm8k5tqyAknsgx7Up/jKAD+Y='", "'sha256-8GWAUrRyaI3gREajBb5ihH3tKcnImvvB7k9KB2GodIg='",
            "'sha256-aONVQQvH1cFuvg38jkGtM/thDaulvTnuyax++NvB8kA='", "'sha256-EFV/fPX1TTTs5IcvHX6CpkZRPNfg8VM3kc6+YzWFva8='",
            "'sha256-J6ivHjodPGzxm9UNPvVzGAajSP08AV3vuTx0c4lDbZA='", "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
            "'sha256-t6oewASd7J1vBg5mQtX4hl8bg8FeegYFM3scKLIhYUc='", "'sha256-6yGv3aB3hfTEfPXLLsjWJS7qLg4GUsRrepEaeQbZIY0='",
            "'sha256-awytb91xnVLWJuWz5AwdV5dAJPERvSsx0KrWWhJuNnM='"
          ],
          styleSrcElem: [
            "'self'", ...(process.env.NODE_ENV !== 'production' ? ["'unsafe-inline'"] : []),
            "https://fonts.googleapis.com", "https://vlibras.gov.br", "https://*.vlibras.gov.br", "https://cdn.jsdelivr.net",
            "'sha256-eUb4QNOqGDF5+49sdjTMcZSJwJagVldqY68xFObUKcE='", "'sha256-K1YGCJ9Cg1Y7R6JLOf8v8m/fYMKl7z8n4H6C96EuRE4='",
            "'sha256-qPyzoFroCvx+YazqbYBtm8k5tqyAknsgx7Up/jKAD+Y='", "'sha256-8GWAUrRyaI3gREajBb5ihH3tKcnImvvB7k9KB2GodIg='",
            "'sha256-aONVQQvH1cFuvg38jkGtM/thDaulvTnuyax++NvB8kA='", "'sha256-EFV/fPX1TTTs5IcvHX6CpkZRPNfg8VM3kc6+YzWFva8='",
            "'sha256-J6ivHjodPGzxm9UNPvVzGAajSP08AV3vuTx0c4lDbZA='", "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
            "'sha256-t6oewASd7J1vBg5mQtX4hl8bg8FeegYFM3scKLIhYUc='", "'sha256-6yGv3aB3hfTEfPXLLsjWJS7qLg4GUsRrepEaeQbZIY0='",
            "'sha256-awytb91xnVLWJuWz5AwdV5dAJPERvSsx0KrWWhJuNnM='"
          ],
          styleSrcAttr: ["'unsafe-inline'"],
          workerSrc: ["'self'", "blob:", "https://vlibras.gov.br", "https://*.vlibras.gov.br", "https://cdn.jsdelivr.net"],
          fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://vlibras.gov.br", "https://*.vlibras.gov.br", "https://cdn.jsdelivr.net"],
          mediaSrc: ["'self'", "blob:", "data:", "https://vlibras.gov.br", "https://*.vlibras.gov.br", "https://cdn.jsdelivr.net"],
          upgradeInsecureRequests: []
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
    })
  );

  app.use((req, res, next) => {
    if (
      (req.method === 'GET' || req.method === 'HEAD') &&
      (req.path.startsWith('/assets/') ||
        /\.(?:webp|svg|png|jpg|jpeg|ico|css|js|woff2?)$/i.test(req.path) ||
        req.path === '/api/home-startup' ||
        req.path === '/api/imagens' ||
        req.path === '/api/metadados/totais')
    ) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
    next();
  });

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Limite de requisições excedido. Tente novamente mais tarde.' }
  });

  app.use('/api/', apiLimiter);
  app.use((req, res, next) => {
    if (req.method === 'POST' && req.path.startsWith('/api/certificados')) {
      next();
    } else {
      express.json({ limit: '100kb' })(req, res, next);
    }
  });

  await initCache();

  app.use('/api', catalogoRouter);
  app.use('/api/usuarios', usuariosRouter);
  app.use('/api/jornada-cursos', jornadaCursosRouter);
  app.use('/api/jornada-vagas', jornadaVagasRouter);
  app.use('/api/certificados', certificadosRouter);
  app.use('/api/imagens', imagensRouter);
  app.use('/api/mec', mecRouter);

  app.use('/.well-known', express.static(path.join(process.cwd(), 'public', '.well-known'), {
    dotfiles: 'allow',
    maxAge: '1d'
  }));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const clientDistPath = path.join(process.cwd(), 'dist', 'client');
    app.use('/.well-known', express.static(path.join(clientDistPath, '.well-known'), {
      dotfiles: 'allow',
      maxAge: '1d'
    }));
    app.use(express.static(clientDistPath, {
      dotfiles: 'allow',
      maxAge: '1y',
      setHeaders: (res, reqPath) => {
        if (reqPath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
      }
    }));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/.well-known/')) {
        return res.status(404).json({ error: 'Manifest not found' });
      }
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const safeRoute = getSafeRouteId(req.path);
    if (err instanceof SyntaxError || err?.type === 'entity.parse.failed' || err?.status === 400) {
      console.warn(`[AppSec CRA-SP] Payload inválido rejeitado (${err?.type || 'syntax_error'}) em ${req.method} ${safeRoute}`);
      return res.status(400).json({
        error: 'Payload malformatado ou inválido.'
      });
    }
    if (err?.type === 'entity.too.large' || err?.status === 413) {
      console.warn(`[AppSec CRA-SP] Payload acima do limite rejeitado em ${req.method} ${safeRoute}`);
      return res.status(413).json({
        error: 'Tamanho da requisição excede o limite permitido.'
      });
    }
    const safeCode = typeof err?.code === 'string' ? err.code : (err?.name || 'InternalError');
    console.error(`[AppSec CRA-SP ERRO]: Falha interna (${safeCode}) em ${req.method} ${safeRoute}`);
    res.status(err?.status || 500).json({
      error: 'Erro interno ao processar a requisição.',
      requestId: req.headers['x-cloud-trace-context'] || undefined
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
