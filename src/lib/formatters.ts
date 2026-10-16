export const formatTime = (timeStr?: string) => {
  if (!timeStr) return '';
  const match = timeStr.match(/(?:[01]\d|2[0-3]):[0-5]\d/);
  if (match) {
    return match[0];
  }
  return timeStr.substring(0, 5);
};

export const formatCargaHoraria = (carga?: string | number) => {
  if (carga === undefined || carga === null || carga === '') return '';
  const str = String(carga).trim();
  const match = str.match(/^(\d{1,3}):(\d{2})$/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    
    if (minutes === 0) {
      return `${hours} hora${hours !== 1 ? 's' : ''}`;
    }
    return `${hours}h ${minutes}m`;
  }
  if (/^\d+$/.test(str)) {
    return `${str}h`;
  }
  return str;
};

export const parseMonetaryValue = (raw?: string | number | null): number => {
  if (raw === undefined || raw === null || raw === '') return 0;
  if (typeof raw === 'number') {
    return Number.isFinite(raw) && raw > 0 ? raw : 0;
  }
  const match = String(raw).match(/\d[0-9.,]*\d|\d/);
  if (!match) return 0;
  const token = match[0];
  let normalized = token;
  if (token.includes('.') && token.includes(',')) {
    if (token.lastIndexOf(',') > token.lastIndexOf('.')) {
      normalized = token.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = token.replace(/,/g, '');
    }
  } else if (token.includes(',')) {
    normalized = token.replace(',', '.');
  } else if (token.includes('.')) {
    const parts = token.split('.');
    if (parts.length > 2 || parts[1].length === 3) {
      normalized = token.replace(/\./g, '');
    }
  }
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export const formatCurrency = (valor?: number | string | null) => {
  const valorNum = parseMonetaryValue(valor);
  if (!valorNum || valorNum <= 0) return '';
  return valorNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const getInstitutionLogo = (instituicoes: any[], targetName?: string) => {
  if (!targetName || !instituicoes || !instituicoes.length) return null;
  
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetNorm = normalize(targetName);
  const getInstName = (inst: any) => inst.instituicao || inst.nomeDaInstituicao || inst.sigla || inst.instituicaoCooperada || '';

  let match = instituicoes.find(inst => getInstName(inst) === targetName);

  if (!match) {
    match = instituicoes.find(inst => normalize(getInstName(inst)) === targetNorm);
  }

  if (!match) {
    match = instituicoes.find(inst => {
      const instNorm = normalize(getInstName(inst));
      return instNorm.length > 2 && (targetNorm.includes(instNorm) || instNorm.includes(targetNorm));
    });
  }

  return match?.logoUrl || match?.image || null;
};

export const optimizeImageUrl = (url?: string, _width = 800, _height?: number) => {
  const fallbackSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlbSBuw6NvIGRpc3BvbsOtdmVsPC90ZXh0Pjwvc3ZnPg==';

  if (!url || typeof url !== 'string' || url.trim() === '' || url === 'undefined' || url === 'null') {
    return fallbackSvg;
  }

  if (url.startsWith('data:') || url.endsWith('.svg') || url.startsWith('/')) {
    return url;
  }

  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return fallbackSvg;
    return parsed.href;
  } catch {
    return fallbackSvg;
  }
};

export const toTitleCase = (str: string) => {
  if (!str) return '';
  const lower = str.toLowerCase();
  const prep = ['de', 'da', 'do', 'das', 'dos', 'e'];
  return lower.split(' ').map((word, index) => {
    if (word.length === 0) return word;
    if (index !== 0 && prep.includes(word)) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

export const mapNivelEscolar = (nivel?: string) => {
  if (!nivel) return null;
  const upper = nivel.toUpperCase();
  if (upper === 'SU') return 'Ensino Superior';
  if (upper === 'EM') return 'Ensino Médio';
  if (upper === 'T' || upper === 'TE') return 'Ensino Técnico';
  return nivel;
};
