export interface CursoCatalogo {
  id: string;
  titulo?: string;
  tituloEditado?: string;
  nomeCineRotulo?: string;
  area?: string;
  cargaHoraria?: string;
  apresentacao?: string;
  objetivo?: string;
  conteudoProgramatico?: string;
  conteudo?: string;
  tipoDeOferta?: string;
  formato?: string;
  instituicaoCooperada?: string;
  image?: string;
  publicoAlvo?: string;
  preRequisitos?: string;
  linkDoCurso?: string;
  status?: string;
  vitrine?: string | number | boolean | null;
  destaque?: string;
  certificador?: string;
  conteudista?: string;
  prazoConclusao?: string;
  [key: string]: any;
}

export interface VagaCatalogo {
  id?: string;
  image?: string;
  linkDeInscricao?: string;
  status: string;
  codigoDaVaga: string;
  tipoDeVaga: string;
  nomeDaEmpresa: string;
  instituicaoCooperada?: string;
  nivelEscolar: string;
  areaProfissional: string;
  areaDeAtuacao: string;
  tipoValorBolsa: string;
  tipoAuxilioBolsa: string;
  bolsaAuxilioExata: string;
  bolsaAuxilioDe: string;
  bolsaAuxilioAte: string;
  tipoDeSalario: string;
  tipoSalarioValor: string;
  salarioExato: string;
  salarioDe: string;
  salarioAte: string;
  qtdDeBeneficios: string | number;
  beneficios: string;
  tipoDeHorario: string;
  horarioEntrada: string;
  horarioSaida: string;
  semestreInicio: string | number;
  semestreFinal: string | number;
  escolasExigidas: string;
  tipoLogradouro: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
  descricao: string;
  atividades: string;
  destaque?: string;
  [key: string]: any;
}

export interface InstituicaoCatalogo {
  id?: string;
  nomeDaInstituicao: string;
  cnpj?: string;
  image?: string;
  status?: string;
  [key: string]: any;
}
