export function sanitizeLogText(input: unknown): string {
  const raw =
    input instanceof Error
      ? input.message || input.name
      : typeof input === 'string'
        ? input
        : typeof input === 'object' && input !== null
          ? JSON.stringify(input)
          : String(input ?? 'Erro desconhecido');

  return raw
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [TOKEN_MASCARADO]')
    .replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '[EMAIL_MASCARADO]')
    .replace(/@/g, '[AT]')
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF_MASCARADO]')
    .replace(/\+55\s?\(\d{2}\)\s?\d{4,5}-?\d{4}\b/g, '[TEL_MASCARADO]')
    .replace(/\+55\s?\d{2}\s?\d{4,5}-?\d{4}\b/g, '[TEL_MASCARADO]')
    .replace(/\+55\s?\d{4,5}-?\d{4}\b/g, '[TEL_MASCARADO]')
    .replace(/\b55\s?\(\d{2}\)\s?\d{4,5}-?\d{4}\b/g, '[TEL_MASCARADO]')
    .replace(/\b55\s\d{2}\s?\d{4,5}-?\d{4}\b/g, '[TEL_MASCARADO]')
    .replace(/\b55\s\d{4,5}-?\d{4}\b/g, '[TEL_MASCARADO]')
    .replace(/\(\d{2}\)\s?\d{4,5}-?\d{4}\b/g, '[TEL_MASCARADO]')
    .replace(/\b\d{2}\s\d{4,5}-?\d{4}\b/g, '[TEL_MASCARADO]')
    .replace(/\b\d{4,9}-\d{4}\b/g, '[TEL_MASCARADO]')
    .replace(/\b\d{8,9}\b/g, '[TEL_MASCARADO]')
    .replace(/\b\d{10,14}\b/g, '[NUM_MASCARADO]')
    .slice(0, 300);
}

export function getSafeRouteId(reqPath?: string): string {
  const pathStr = String(reqPath || '');
  if (pathStr.startsWith('/api/usuarios')) return '/api/usuarios';
  if (pathStr.startsWith('/api/jornada-cursos')) return '/api/jornada-cursos';
  if (pathStr.startsWith('/api/jornada-vagas')) return '/api/jornada-vagas';
  if (pathStr.startsWith('/api/certificados')) return '/api/certificados';
  if (pathStr.startsWith('/api/imagens')) return '/api/imagens';
  if (pathStr.startsWith('/api/mec')) return '/api/mec';
  if (pathStr.startsWith('/api/')) return '/api/[endpoint]';
  if (pathStr.startsWith('/.well-known')) return '/.well-known';
  return '/[rota]';
}
