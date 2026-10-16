import { z } from 'zod';
import { UFS, COMO_SOUBE, FORMACOES, AREAS_ATUACAO } from '../lib/constants';
import { validateCPF } from '../lib/validators';

export const profileSchema = z.object({
  nome: z.string().trim().min(2, "Nome muito curto").max(100),
  cpf: z.string().refine((val) => validateCPF(val), { message: "CPF matematicamente inválido" }),
  celular: z.string().min(14, "Celular inválido").max(20, "Celular inválido").refine((val) => {
    const digits = val.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  }, { message: "Celular inválido" }),
  uf: z.string().refine(val => UFS.includes(val), "UF inválida"),
  registroCRA: z.enum(['Sim', 'Não']),
  comoSoube: z.string().refine(val => COMO_SOUBE.includes(val), "Opção inválida"),
  formacao: z.string().refine(val => FORMACOES.includes(val), "Formação inválida"),
  areaAtuacao: z.string().nullable().optional(),
  semestre: z.string().nullable().optional(),
  ies: z.string().nullable().optional(),
  campus: z.string().nullable().optional(),
  curso: z.string().nullable().optional(),
  cadastroManualIes: z.boolean().optional().default(false),
  lgpd: z.literal(true, {
    message: "É obrigatório aceitar os termos da LGPD para realizar o cadastro."
  })
}).superRefine((data, ctx) => {
  const isOutraArea = data.formacao === 'Profissional de outra área' || data.formacao === 'Estudante de outra área';
  if (isOutraArea) {
    if (!data.areaAtuacao || !AREAS_ATUACAO.includes(data.areaAtuacao)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecione uma área de atuação válida', path: ['areaAtuacao'] });
    }
  }

  if (data.formacao.startsWith('Estudante de Administração')) {
    const minIes = data.cadastroManualIes ? 3 : 2;
    const minCurso = data.cadastroManualIes ? 3 : 2;
    if (!data.ies || data.ies.trim().length < minIes) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe uma Instituição de Ensino válida', path: ['ies'] });
    }
    if (!data.campus || data.campus.trim().length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe um Campus ou Polo válido', path: ['campus'] });
    }
    if (!data.curso || data.curso.trim().length < minCurso) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe um Curso válido', path: ['curso'] });
    }
    const maxSemestres = data.formacao === 'Estudante de Administração - Curso Tecnólogo' ? 6 : 10;
    const semestresValidos = Array.from({ length: maxSemestres }, (_, i) => `${i + 1}º Semestre`);
    if (!data.semestre || !semestresValidos.includes(data.semestre)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecione um semestre válido', path: ['semestre'] });
    }
  }
});

export type ProfilePayload = z.infer<typeof profileSchema>;

export const iesSchema = z.object({
  codIes: z.string(),
  nomeIes: z.string(),
});

export const campusSchema = z.object({
  codLocal: z.string(),
  nomeLocal: z.string(),
});

export const cursoSchema = z.object({
  codCurso: z.string(),
  nomeCurso: z.string(),
});

export type IES = z.infer<typeof iesSchema>;
export type Campus = z.infer<typeof campusSchema>;
export type Curso = z.infer<typeof cursoSchema>;
