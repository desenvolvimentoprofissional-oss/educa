import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

function computeAssetSha384(outDir: string, assetUrl: string): string | null {
  const cleanRel = assetUrl.replace(/^\//, '').split('?')[0];
  const fullPath = path.resolve(outDir, cleanRel);
  if (!fullPath.startsWith(path.resolve(outDir)) || !fs.existsSync(fullPath)) {
    return null;
  }
  const buffer = fs.readFileSync(fullPath);
  const hash = crypto.createHash('sha384').update(buffer).digest('base64');
  return `sha384-${hash}`;
}

function sriBuildPlugin(): Plugin {
  return {
    name: 'crasp-sri-sha384',
    apply: 'build',
    enforce: 'post',
    writeBundle(options) {
      const outDir = options.dir || path.resolve(__dirname, 'dist/client');
      const indexPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;

      let html = fs.readFileSync(indexPath, 'utf8');
      html = html.replace(
        /<(script|link)\b([^>]*?\b(?:src|href)="(\/assets\/[^"]+)"[^>]*)>/gi,
        (fullMatch, tag: string, attrs: string, assetUrl: string) => {
          if (/\bintegrity=/.test(attrs)) return fullMatch;
          const integrity = computeAssetSha384(outDir, assetUrl);
          if (!integrity) return fullMatch;
          const hasCrossorigin = /\bcrossorigin\b/i.test(attrs);
          const extraAttrs = hasCrossorigin
            ? ` integrity="${integrity}"`
            : ` integrity="${integrity}" crossorigin="anonymous"`;
          return `<${tag}${attrs}${extraAttrs}>`;
        }
      );
      fs.writeFileSync(indexPath, html, 'utf8');
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), sriBuildPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    esbuild: {
      legalComments: 'none',
      drop: ['debugger'],
    },
    build: {
      target: 'es2022',
      minify: 'esbuild',
      cssMinify: true,
      modulePreload: {
        resolveDependencies: (_filename, deps) => {
          return deps.filter((dep) => !dep.includes('firebase'));
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) return 'firebase';
              if (id.includes('react-dom') || id.includes('react/')) return 'vendor';
              if (id.includes('zod')) return 'validation';
            }
          }
        }
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    }
  };
});
