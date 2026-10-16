import { useAuthStore } from "../store/useAuthStore";
import { useJornadaCursosStore } from "../store/useJornadaCursosStore";
import { useJornadaVagasStore } from "../store/useJornadaVagasStore";


import { Award, BookOpen, Briefcase, Star, Zap, Shield, Crown, CheckCircle2, Calendar, Clock } from "lucide-react";
const formatDate = (dateObj: any) => {
  if (!dateObj) return "Data Indisponível";
  try {
    const d = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
    return new Intl.DateTimeFormat('pt-BR').format(d);
  } catch {
    return "Data Indisponível";
  }
};
export function MinhasConquistas() {
  const { user, userData } = useAuthStore();
  const jornadaCursos = useJornadaCursosStore((s) => s.jornadaCursos);
  const jornadaVagas = useJornadaVagasStore((s) => s.jornadaVagas);
  const conquistasCursos = jornadaCursos.filter((j) => j.status === "CONCLUIDO");
  const conquistasVagas = jornadaVagas.filter((j) => j.status === "CONTRATADO");
  const totalConquistas = conquistasCursos.length + conquistasVagas.length;
  const firstName = userData?.nome?.split(" ")[0] || user?.displayName?.split(" ")[0] || "Profissional";
  const horasCertificadas = conquistasCursos.reduce((acc, j) => {
    const cargaHoraria = (j as any).cursoSnapshot?.cargaHoraria;
    if (cargaHoraria) {
      const match = String(cargaHoraria).match(/\d+/);
      if (match) return acc + parseInt(match[0], 10);
    }
    return acc;
  }, 0);
  const badges = [
    {
      id: "iniciativa",
      nome: "Selo Iniciativa",
      descricao: "10h em cursos",
      target: 10,
      icon: Zap,
      color: "bg-orange-100 text-orange-600 border-orange-200",
      active: horasCertificadas >= 10,
    },
    {
      id: "dedicacao",
      nome: "Selo Dedicação",
      descricao: "50h em cursos",
      target: 50,
      icon: Shield,
      color: "bg-blue-100 text-blue-600 border-blue-200",
      active: horasCertificadas >= 50,
    },
    {
      id: "destaque",
      nome: "Selo Destaque",
      descricao: "100h em cursos",
      target: 100,
      icon: Star,
      color: "bg-cyan-100 text-cyan-700 border-cyan-200",
      active: horasCertificadas >= 100,
    },
    {
      id: "protagonista",
      nome: "Selo Protagonista",
      descricao: "250+h em cursos",
      target: 250,
      icon: Crown,
      color: "bg-yellow-100 text-yellow-600 border-yellow-300",
      active: horasCertificadas >= 250,
    }
  ];
  return (
    <div className="flex flex-col gap-12 w-full">
      <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-yellow-600 to-yellow-500 p-[24px] sm:p-[32px] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),_0_4px_6px_-4px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center gap-[24px] justify-between lg:h-[200px]">
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10"
          style={{ transform: 'translateY(-50%) translateX(33.333333%)' }}
        />
        <div 
          className="absolute bottom-0 right-32 w-48 h-48 rounded-full bg-white/10"
          style={{ transform: 'translateY(33.333333%) translateX(25%)' }}
        />
        <div className="relative z-10 flex items-center gap-[24px]">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/30">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
              Suas Conquistas, {firstName}!
            </h1>
            <p className="text-[16px] lg:text-lg text-yellow-50 leading-relaxed max-w-2xl">
              Acompanhe seu progresso, celebre os certificados validados e colecione os selos da sua jornada.
            </p>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-[24px] py-[16px] min-w-[140px]">
          <span className="text-[13px] font-semibold text-yellow-50 uppercase tracking-wider mb-1">Horas Certificadas</span>
          <span className="text-3xl font-black text-white">{horasCertificadas}h</span>
        </div>
      </div>
      <div className="flex flex-col gap-[16px]">
        <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2">
          <Award className="w-5 h-5 text-gray-400" />
          Medalhas Desbloqueadas
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div 
                key={badge.id}
                className={`relative overflow-hidden rounded-[16px] border p-[20px] flex flex-col items-center text-center transition-all duration-300 ${
                  badge.active 
                    ? `bg-white shadow-sm border-gray-200` 
                    : 'bg-gray-50 border-gray-200 opacity-60 grayscale'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${badge.active ? badge.color : 'bg-gray-200 text-gray-400 border-gray-300'} border`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className={`font-bold text-[15px] mb-1 ${badge.active ? 'text-gray-900' : 'text-gray-500'}`}>
                  {badge.nome}
                </h3>
                <span className="text-[13px] text-gray-500 font-medium">
                  {badge.descricao}
                </span>
                {badge.active && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {totalConquistas === 0 ? (
        <div className="text-center py-16 px-[16px] bg-white border border-gray-200 rounded-[16px] mt-[16px]">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Nenhuma conquista ainda</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Quando você finalizar seus cursos e for aprovado nos processos seletivos, suas vitórias ficarão registradas aqui.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-[32px] mt-[16px]">
          {conquistasCursos.length > 0 && (
            <div className="flex flex-col gap-[16px]">
              <div className="flex items-center gap-2 border-b border-[#e5e7eb] pb-2">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-bold text-[#111827]">
                  Cursos Concluídos
                </h2>
                <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-[13px] ml-2">
                  {conquistasCursos.length}
                </span>
              </div>
              <div className="relative border-l-2 border-gray-100 ml-4 md:ml-[28px] mt-[8px] flex flex-col gap-[32px] pb-[16px]">
                {conquistasCursos.map((jornada) => {
                  const curso = jornada.cursoSnapshot || {};
                  const inst = curso.instituicao || curso.instituicaoCooperada || curso.nomeDaInstituicao || "Instituição Parceira";
                  return (
                    <div key={jornada.id} className="relative pl-[24px] md:pl-[32px]">
                      <span className="absolute -left-[21px] flex items-center justify-center w-10 h-10 rounded-full bg-green-50 border border-green-200 ring-8 ring-[#f9fafb]">
                        <BookOpen className="w-5 h-5 text-green-600" />
                      </span>
                      <div className="bg-white border border-gray-200 rounded-[16px] p-[20px] shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-[16px]">
                          <div>
                            <h3 className="text-[17px] font-bold text-gray-900 leading-tight mb-1">{curso.titulo || curso.tituloEditado || curso.nome || curso.nomeDoCurso || "Curso não identificado"}</h3>
                            <p className="text-[14px] text-gray-500">{inst}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-[12px] shrink-0">
                            {curso.cargaHoraria && (
                              <div className="flex items-center gap-[6px] bg-gray-50 border border-gray-200 text-gray-700 px-[12px] py-[6px] rounded-full text-[13px] font-medium">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {curso.cargaHoraria}
                              </div>
                            )}
                            <div className="flex items-center gap-[6px] bg-green-50 border border-green-100 text-green-700 px-[12px] py-[6px] rounded-full text-[13px] font-medium">
                              <Calendar className="w-4 h-4 text-green-600" />
                              Concluído em {formatDate(jornada.updatedAt || jornada.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {conquistasVagas.length > 0 && (
            <div className="flex flex-col gap-[16px]">
              <div className="flex items-center gap-2 border-b border-[#e5e7eb] pb-2">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-bold text-[#111827]">
                  Processos Aprovados
                </h2>
                <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-[13px] ml-2">
                  {conquistasVagas.length}
                </span>
              </div>
              <div className="relative border-l-2 border-gray-100 ml-4 md:ml-[28px] mt-[8px] flex flex-col gap-[32px] pb-[16px]">
                {conquistasVagas.map((vagaJornada) => {
                  const vaga = vagaJornada.vagaSnapshot || {};
                  return (
                    <div key={vagaJornada.id} className="relative pl-[24px] md:pl-[32px]">
                      <span className="absolute -left-[21px] flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 border border-blue-200 ring-8 ring-[#f9fafb]">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </span>
                      <div className="bg-white border border-gray-200 rounded-[16px] p-[20px] shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-[16px]">
                          <div>
                            <h3 className="text-[17px] font-bold text-gray-900 leading-tight mb-1">{vaga.tipoDeVaga || vaga.titulo || vaga.nome || "Vaga não identificada"}</h3>
                            <p className="text-[14px] text-gray-500">{vaga.nomeDaEmpresa || vaga.empresa || "Empresa Parceira"}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-[12px] shrink-0">
                            <div className="flex items-center gap-[6px] bg-blue-50 border border-blue-100 text-blue-700 px-[12px] py-[6px] rounded-full text-[13px] font-medium">
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                              Contratado em {formatDate(vagaJornada.updatedAt || vagaJornada.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
