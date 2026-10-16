import React, { useState, useEffect } from 'react';
import { useAuthStore, getAuthSessionSnapshot, isAuthSessionCurrent } from '../store/useAuthStore';
import { useMecStore } from '../store/useMecStore';
import { api } from '../api';
import { validateCPF } from '../lib/validators';
import { ProfileFormFields } from '../components/ui/ProfileFormFields';
import { DocumentType } from '../hooks/useDocumentModal';
import { DocumentModal } from '../components/ui/DocumentModal';
import { CompleteProfileHeader } from '../components/ui/profile/CompleteProfileHeader';
import { LgpdAgreement } from '../components/ui/profile/LgpdAgreement';

const safeJsonParse = <T,>(jsonString: string): T | null => {
  try {
    return jsonString ? JSON.parse(jsonString) : null;
  } catch {
    return null;
  }
};

export function CompleteProfilePage() {
  const { user, signOut, setProfileComplete, setUserData } = useAuthStore();
  const { iesList, campusList, cursoList, loadingIes, loadingCampus, loadingCursos, fetchIesList, fetchCampusList, fetchCursoList, clearCampusList, clearCursoList } = useMecStore();

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docType, setDocType] = useState<DocumentType>('privacidade');

  const openDocument = (type: DocumentType) => {
    setDocType(type);
    setIsDocModalOpen(true);
  };

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [celular, setCelular] = useState('');
  const [uf, setUf] = useState('');
  const [registroCRA, setRegistroCRA] = useState('');
  const [comoSoube, setComoSoube] = useState('');
  const [formacao, setFormacao] = useState('');
  const [areaAtuacao, setAreaAtuacao] = useState('');
  const [semestre, setSemestre] = useState('');

  const [ies, setIes] = useState('');
  const [campus, setCampus] = useState('');
  const [curso, setCurso] = useState('');
  const [cadastroManualIes, setCadastroManualIes] = useState(false);

  const [lgpd, setLgpd] = useState<boolean | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const isEstudante = formacao.startsWith('Estudante de Administração');
    if (isEstudante && iesList.length === 0) {
      fetchIesList();
    }
  }, [formacao, iesList.length, fetchIesList]);

  useEffect(() => {
    if (ies) {
      const selectedIes = safeJsonParse<{ codIes: string; nomeIes: string }>(ies);
      if (selectedIes) fetchCampusList(selectedIes.codIes);
    } else {
      clearCampusList();
    }
    setCampus('');
    setCurso('');
  }, [ies, fetchCampusList, clearCampusList]);

  useEffect(() => {
    if (campus && ies) {
      const selectedIes = safeJsonParse<{ codIes: string; nomeIes: string }>(ies);
      const selectedCampus = safeJsonParse<{ codLocal: string; nomeLocal: string }>(campus);

      if (selectedIes && selectedCampus) {
        let filtroGrau = '';
        if (formacao.includes('Bacharelado')) filtroGrau = 'Bacharelado';
        if (formacao.includes('Tecnólogo')) filtroGrau = 'Tecnológico';
        fetchCursoList(selectedIes.codIes, selectedCampus.codLocal, filtroGrau);
      }
    } else {
      clearCursoList();
    }
    setCurso('');
  }, [campus, ies, formacao, fetchCursoList, clearCursoList]);

  const isOutraArea = formacao === 'Profissional de outra área' || formacao === 'Estudante de outra área';
  const isEstudanteAdm = formacao.startsWith('Estudante de Administração');
  const isTecnologo = formacao === 'Estudante de Administração - Curso Tecnólogo';
  const semestresDisponiveis = isTecnologo ? 6 : 10;

  const handleSalvarDados = async (e: React.FormEvent) => {
    e.preventDefault();

    setSalvando(true);
    setMensagemSucesso('');
    setError('');

    if (nome.trim().length < 2) {
      setError('Informe seu nome completo.');
      setSalvando(false);
      return;
    }

    if (!validateCPF(cpf)) {
      setError('CPF inválido. Verifique o número digitado.');
      setSalvando(false);
      return;
    }

    if (isOutraArea && !areaAtuacao) {
      setError('Selecione a sua área de atuação ou estudo.');
      setSalvando(false);
      return;
    }

    let finalIes = ies ? ies.trim() : null;
    let finalCampus = campus ? campus.trim() : null;
    let finalCurso = curso ? curso.trim() : null;

    if (isEstudanteAdm && !cadastroManualIes) {
      const selectedIes = safeJsonParse<{ nomeIes: string }>(ies);
      const selectedCampus = safeJsonParse<{ nomeLocal: string }>(campus);
      const selectedCurso = safeJsonParse<{ nomeCurso: string }>(curso);
      finalIes = selectedIes?.nomeIes?.trim() || null;
      finalCampus = selectedCampus?.nomeLocal?.trim() || null;
      finalCurso = selectedCurso?.nomeCurso?.trim() || null;
    }

    if (isEstudanteAdm) {
      if (!finalIes || finalIes.length < (cadastroManualIes ? 3 : 2)) {
        setError('Selecione ou informe a sua Instituição de Ensino.');
        setSalvando(false);
        return;
      }
      if (!finalCampus || finalCampus.length < 2) {
        setError('Selecione ou informe o seu Campus ou Polo.');
        setSalvando(false);
        return;
      }
      if (!finalCurso || finalCurso.length < (cadastroManualIes ? 3 : 2)) {
        setError('Selecione ou informe o seu Curso.');
        setSalvando(false);
        return;
      }
      if (!semestre) {
        setError('Selecione em qual semestre você está.');
        setSalvando(false);
        return;
      }
    }

    if (lgpd !== true) {
      setError('É obrigatório aceitar os termos da LGPD para concluir o cadastro. O aceite é requisito necessário para acesso aos serviços do CRA-SP Educa.');
      setSalvando(false);
      return;
    }

    const sessionSnap = getAuthSessionSnapshot();
    try {
      const payload = { 
        nome: nome.trim(), cpf, celular, uf, 
        registroCRA: registroCRA as 'Sim' | 'Não', 
        comoSoube, formacao, 
        areaAtuacao: isOutraArea ? (areaAtuacao || null) : null, 
        semestre: isEstudanteAdm ? (semestre || null) : null, 
        ies: isEstudanteAdm ? finalIes : null, 
        campus: isEstudanteAdm ? finalCampus : null, 
        curso: isEstudanteAdm ? finalCurso : null,
        cadastroManualIes: isEstudanteAdm ? cadastroManualIes : false,
        lgpd: true
      };

      await api.usuarios.salvarPerfil(payload as any);
      if (!isAuthSessionCurrent(sessionSnap)) return;

      setMensagemSucesso('Dados salvos com sucesso!');
      setUserData({ ...payload, jornadaCursos: [], jornadaVagas: [] });
      setTimeout(() => {
        if (isAuthSessionCurrent(sessionSnap)) {
          setProfileComplete(true);
        }
      }, 1000);

    } catch (err: any) {
      if (!isAuthSessionCurrent(sessionSnap)) return;
      setError(err.message || 'Erro de conexão ao salvar.');
    } finally {
      if (isAuthSessionCurrent(sessionSnap)) {
        setSalvando(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <CompleteProfileHeader onSignOut={signOut} />

      <main className="flex-1 flex justify-center py-12 px-[16px] md:px-8">
        <div className="w-full max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-[12px]">
              Complete seu cadastro
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Só precisamos de mais alguns dados para personalizar sua experiência.
            </p>
          </div>

          <form onSubmit={handleSalvarDados} className="flex flex-col gap-8 bg-white p-6 md:p-8 rounded-[16px] shadow-sm border border-gray-200">
            <ProfileFormFields
              nome={nome} setNome={setNome}
              email={user?.email || ''}
              cpf={cpf} setCpf={setCpf}
              celular={celular} setCelular={setCelular}
              uf={uf} setUf={setUf}
              registroCRA={registroCRA} setRegistroCRA={setRegistroCRA}
              comoSoube={comoSoube} setComoSoube={setComoSoube}
              formacao={formacao} setFormacao={setFormacao}
              areaAtuacao={areaAtuacao} setAreaAtuacao={setAreaAtuacao}
              ies={ies} setIes={setIes}
              campus={campus} setCampus={setCampus}
              curso={curso} setCurso={setCurso}
              semestre={semestre} setSemestre={setSemestre}
              iesList={iesList} campusList={campusList} cursoList={cursoList}
              loadingIes={loadingIes} loadingCampus={loadingCampus} loadingCursos={loadingCursos}
              isOutraArea={isOutraArea} isEstudanteAdm={isEstudanteAdm}
              semestresDisponiveis={semestresDisponiveis}
              cadastroManualIes={cadastroManualIes} setCadastroManualIes={setCadastroManualIes}
            />

            <LgpdAgreement 
              lgpd={lgpd} 
              setLgpd={setLgpd} 
              onOpenDocument={openDocument} 
            />

            {error && (
              <div role="alert" className="bg-red-50 text-red-700 px-[16px] py-[12px] rounded-xl border border-red-200 text-sm font-semibold mt-2">
                {error}
              </div>
            )}

            {mensagemSucesso && (
              <div role="status" aria-live="polite" className="bg-green-50 text-green-700 px-[16px] py-[12px] rounded-xl border border-green-200 text-sm font-semibold mt-2 flex items-center gap-[8px]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22 11.08V12C21.9988 14.1564 21.3001 16.2547 20.0093 17.9818C18.7185 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.0976 1.98232 16.06 2.85999M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {mensagemSucesso}
              </div>
            )}

            <button 
              type="submit" 
              disabled={salvando}
              aria-label="Salvar dados e acessar a plataforma"
              className="bg-blue-900 text-white px-[16px] py-[16px] w-full mt-4 rounded-full transition-all duration-300 hover:bg-blue-800 focus:ring-4 focus:ring-blue-900/20 font-bold uppercase text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(30,58,138,0.2)] hover:shadow-[0_0_20px_rgba(30,58,138,0.4)]"
            >
              {salvando ? 'Salvando Dados...' : 'Salvar e Acessar Plataforma'}
            </button>
          </form>
        </div>
      </main>

      <DocumentModal 
        isOpen={isDocModalOpen}
        initialDocument={docType}
        onClose={() => setIsDocModalOpen(false)}
      />
    </div>
  );
}
