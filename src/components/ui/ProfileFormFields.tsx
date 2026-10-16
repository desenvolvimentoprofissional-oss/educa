import { UFS, COMO_SOUBE, FORMACOES, AREAS_ATUACAO } from "../../lib/constants";
import { formatCPF, formatPhone } from "../../lib/validators";
import { toTitleCase } from "../../lib/formatters";
import { SearchableSelect } from "./SearchableSelect";

export type ProfileFormFieldsProps = Readonly<{
  nome: string; setNome: (v: string) => void;
  email?: string; setEmail?: (v: string) => void;
  cpf: string; setCpf: (v: string) => void;
  celular: string; setCelular: (v: string) => void;
  uf: string; setUf: (v: string) => void;
  registroCRA: string; setRegistroCRA: (v: string) => void;
  comoSoube: string; setComoSoube: (v: string) => void;
  formacao: string; setFormacao: (v: string) => void;
  areaAtuacao: string; setAreaAtuacao: (v: string) => void;
  ies: string; setIes: (v: string) => void;
  campus: string; setCampus: (v: string) => void;
  curso: string; setCurso: (v: string) => void;
  semestre: string; setSemestre: (v: string) => void;
  iesList: any[]; campusList: any[]; cursoList: any[];
  loadingIes?: boolean; loadingCampus?: boolean; loadingCursos?: boolean;
  isOutraArea: boolean; isEstudanteAdm: boolean; semestresDisponiveis: number;
  cadastroManualIes: boolean; setCadastroManualIes: (v: boolean) => void;
}>;

export function ProfileFormFields({
  nome, setNome, email, setEmail, cpf, setCpf, celular, setCelular,
  uf, setUf, registroCRA, setRegistroCRA, comoSoube, setComoSoube,
  formacao, setFormacao, areaAtuacao, setAreaAtuacao,
  ies, setIes, campus, setCampus, curso, setCurso, semestre, setSemestre,
  iesList, campusList, cursoList, isOutraArea, isEstudanteAdm, semestresDisponiveis,
  loadingIes, loadingCampus, loadingCursos, cadastroManualIes, setCadastroManualIes
}: ProfileFormFieldsProps) {

  const inputClass = "border border-gray-300 text-gray-900 px-3.5 py-2.5 w-full outline-none rounded-lg focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all bg-gray-50 hover:bg-white focus:bg-white font-normal mt-1.5 text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
      <div>
        <label htmlFor="profile-nome" className={labelClass}>Nome Completo</label>
        <input id="profile-nome" name="nome" type="text" value={nome} onChange={e => setNome(toTitleCase(e.target.value))} className={inputClass} required />
      </div>

      <div>
        <label htmlFor="profile-cpf" className={labelClass}>CPF</label>
        <input id="profile-cpf" name="cpf" type="text" value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} maxLength={14} className={inputClass} required />
      </div>

      <div>
        <label htmlFor="profile-email" className={labelClass}>E-mail</label>
        <input id="profile-email" name="email" type="email" value={email || ''} onChange={e => setEmail && setEmail(e.target.value)} className={`${inputClass} ${!setEmail ? 'opacity-70 cursor-not-allowed' : ''}`} readOnly={!setEmail} disabled={!setEmail} required />
      </div>

      <div>
        <label htmlFor="profile-celular" className={labelClass}>Celular</label>
        <input id="profile-celular" name="celular" type="text" value={celular} onChange={e => setCelular(formatPhone(e.target.value))} maxLength={15} className={inputClass} required />
      </div>

      <div>
        <label htmlFor="profile-uf" className={labelClass}>Onde você reside (UF)?</label>
        <select id="profile-uf" value={uf} onChange={e => setUf(e.target.value)} className={inputClass} required>
          <option value="">Selecione...</option>
          {UFS.map(estado => <option key={estado} value={estado}>{estado}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="profile-registro-cra" className={labelClass}>Possui registro do CRA-SP?</label>
        <select id="profile-registro-cra" value={registroCRA} onChange={e => setRegistroCRA(e.target.value)} className={inputClass} required>
          <option value="">Selecione...</option>
          <option value="Sim">Sim</option>
          <option value="Não">Não</option>
        </select>
      </div>

      <div>
        <label htmlFor="profile-como-soube" className={labelClass}>Como soube do CRA-SP Educa?</label>
        <select id="profile-como-soube" value={comoSoube} onChange={e => setComoSoube(e.target.value)} className={inputClass} required>
          <option value="">Selecione...</option>
          {COMO_SOUBE.map(opcao => <option key={opcao} value={opcao}>{opcao}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="profile-formacao" className={labelClass}>Qual é a sua formação?</label>
        <select id="profile-formacao" value={formacao} onChange={e => { setFormacao(e.target.value); setAreaAtuacao(''); setSemestre(''); setIes(''); setCampus(''); setCurso(''); }} className={inputClass} required>
          <option value="">Selecione...</option>
          {FORMACOES.map(opcao => <option key={opcao} value={opcao}>{opcao}</option>)}
        </select>
      </div>

      {isOutraArea && (
        <div className="md:col-span-2">
          <label htmlFor="profile-area-atuacao" className={labelClass}>Qual é a sua área de atuação/estudo?</label>
          <select id="profile-area-atuacao" value={areaAtuacao} onChange={e => setAreaAtuacao(e.target.value)} className={inputClass} required>
            <option value="">Selecione...</option>
            {AREAS_ATUACAO.map(opcao => <option key={opcao} value={opcao}>{opcao}</option>)}
          </select>
        </div>
      )}

      {isEstudanteAdm && (
        <>
          <div className="md:col-span-2">
            {!cadastroManualIes ? (
              <>
                <label htmlFor="profile-ies-select" className={labelClass + " mb-1.5"}>Instituição de Ensino</label>
                <SearchableSelect
                  id="profile-ies-select"
                  ariaLabel="Instituição de Ensino"
                  value={ies}
                  onChange={(val) => {
                    if (val === 'OUTRA_IES') {
                      setCadastroManualIes(true);
                      setIes('');
                      setCampus('');
                      setCurso('');
                    } else {
                      setIes(val);
                    }
                  }}
                  options={[
                    ...iesList.map(inst => ({ value: JSON.stringify(inst), label: inst.nomeIes })),
                    { value: 'OUTRA_IES', label: 'Outra / Não encontrei minha instituição' }
                  ]}
                  placeholder={loadingIes ? 'Aguarde, carregando a lista...' : (iesList.length > 0 ? 'Selecione a IES...' : 'Nenhuma IES encontrada no catálogo')}
                  disabled={loadingIes}
                />
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <span className={labelClass}>Instituição de Ensino</span>
                <div>
                  <label htmlFor="profile-ies-manual" className="block text-xs font-medium text-gray-500 mb-1">Qual o nome completo da Instituição?</label>
                  <input 
                    id="profile-ies-manual"
                    type="text" 
                    value={ies} 
                    onChange={e => setIes(e.target.value)} 
                    placeholder="Ex: Universidade de São Paulo"
                    className={inputClass} 
                    required 
                    minLength={3}
                  />
                </div>
                <div>
                  <label htmlFor="profile-campus-manual" className="block text-xs font-medium text-gray-500 mb-1">Qual o Campus ou Pólo?</label>
                  <input 
                    id="profile-campus-manual"
                    type="text" 
                    value={campus} 
                    onChange={e => setCampus(e.target.value)} 
                    placeholder="Ex: Campus Butantã"
                    className={inputClass} 
                    required 
                    minLength={2}
                  />
                </div>
                <div>
                  <label htmlFor="profile-curso-manual" className="block text-xs font-medium text-gray-500 mb-1">Qual o nome do Curso?</label>
                  <input 
                    id="profile-curso-manual"
                    type="text" 
                    value={curso} 
                    onChange={e => setCurso(e.target.value)} 
                    placeholder="Ex: Bacharelado em Administração"
                    className={inputClass} 
                    required 
                    minLength={3}
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <button 
                    type="button"
                    onClick={() => {
                      setCadastroManualIes(false);
                      setIes('');
                      setCampus('');
                      setCurso('');
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Voltar para a lista do MEC
                  </button>
                </div>
              </div>
            )}
          </div>

          {!cadastroManualIes && ies && (
            <div className="md:col-span-2">
              <label htmlFor="profile-campus-select" className={labelClass + " mb-1.5"}>Campus / Local</label>
              <SearchableSelect
                id="profile-campus-select"
                ariaLabel="Campus / Local"
                value={campus}
                onChange={setCampus}
                options={campusList.map(camp => ({ value: JSON.stringify(camp), label: camp.nomeLocal }))}
                placeholder={loadingCampus ? 'Aguarde, carregando campus...' : (campusList.length > 0 ? 'Selecione o Campus...' : 'Nenhum campus encontrado')}
                disabled={loadingCampus || campusList.length === 0}
              />
            </div>
          )}

          {!cadastroManualIes && campus && (
            <div className="md:col-span-2">
              <label htmlFor="profile-curso-select" className={labelClass + " mb-1.5"}>Curso</label>
              <SearchableSelect
                id="profile-curso-select"
                ariaLabel="Curso"
                value={curso}
                onChange={setCurso}
                options={cursoList.map(curs => ({ value: JSON.stringify(curs), label: curs.nomeCurso }))}
                placeholder={loadingCursos ? 'Aguarde, carregando cursos...' : (cursoList.length > 0 ? 'Selecione o Curso...' : 'Nenhum curso...')}
                disabled={loadingCursos || cursoList.length === 0}
              />
            </div>
          )}

          {(curso || cadastroManualIes) && (
            <div className="md:col-span-2">
              <label htmlFor="profile-semestre" className={labelClass}>Em qual semestre você está?</label>
              <select id="profile-semestre" value={semestre} onChange={e => setSemestre(e.target.value)} className={inputClass} required>
                <option value="">Selecione...</option>
                {Array.from({ length: semestresDisponiveis }, (_, i) => i + 1).map(num => (
                  <option key={num} value={`${num}º Semestre`}>{num}º Semestre</option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
}
