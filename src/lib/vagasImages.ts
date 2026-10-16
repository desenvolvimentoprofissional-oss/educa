export function getVagaImageFallback(vagaId?: string | number, dynamicList?: string[]): string {
  if (!dynamicList || dynamicList.length === 0) {
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }

  const idStr = String(vagaId || 'default');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }

  hash = Math.abs(hash);
  return dynamicList[hash % dynamicList.length];
}

export const VAGAS_COLORS = [
  '#004e9a',
  '#0369a1',
  '#0f766e',
  '#1d4ed8',
];

export function getVagaColorFallback(vagaId?: string | number): string {
  if (!vagaId) return VAGAS_COLORS[0];

  const idStr = String(vagaId);
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }

  hash = Math.abs(hash);
  return VAGAS_COLORS[hash % VAGAS_COLORS.length];
}
