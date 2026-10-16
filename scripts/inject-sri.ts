import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const distDir = fs.existsSync(path.resolve(process.cwd(), 'dist', 'client'))
  ? path.resolve(process.cwd(), 'dist', 'client')
  : path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ [SRI] Arquivo dist/index.html não encontrado. Execute o vite build primeiro.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf-8');

const generateHash = (filePath: string): string => {
  const content = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha384').update(content).digest('base64');
  return `sha384-${hash}`;
};

html = html.replace(
  /<(script|link)\s+([^>]*?(?:src|href)="\/(assets\/[^"]+)"[^>]*)>/gi,
  (match, tag, attributes, relativePath) => {
    if (attributes.includes('integrity=')) return match;
    if (attributes.includes('rel="preload"') || attributes.includes('as="image"')) return match;

    const fullPath = path.join(distDir, relativePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ [SRI] Arquivo referenciado não encontrado para cálculo de hash: ${relativePath}`);
      return match;
    }

    const integrity = generateHash(fullPath);
    const hasCrossorigin = /\bcrossorigin\b/i.test(attributes);
    const extraAttrs = hasCrossorigin
      ? `integrity="${integrity}"`
      : `integrity="${integrity}" crossorigin="anonymous"`;
    console.log(`🔒 [SRI] Hash gerado para /${relativePath}: ${integrity}`);

    if (attributes.trim().endsWith('/')) {
      const cleanAttrs = attributes.trim().slice(0, -1).trim();
      return `<${tag} ${cleanAttrs} ${extraAttrs} />`;
    }

    return `<${tag} ${attributes} ${extraAttrs}>`;
  }
);

fs.writeFileSync(indexPath, html, 'utf-8');
console.log('✅ [SRI] Subresource Integrity injetado com sucesso no index.html de produção!');
