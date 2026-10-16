import { useMemo } from 'react';
import { JornadaCurso } from '../../store/useJornadaCursosStore';
import { Clock, BookOpen, CheckCircle } from 'lucide-react';

interface JornadaCursosKpisProps {
  jornadaCursos: readonly JornadaCurso[];
}

export function JornadaCursosKpis({ jornadaCursos }: JornadaCursosKpisProps) {
  const kpis = useMemo(() => {
    let preMatriculados = 0;
    let matriculados = 0;
    let concluidos = 0;
    let horasCertificadas = 0;

    jornadaCursos.forEach((j) => {
      if (j.status === "PRE_MATRICULADO") preMatriculados++;
      if (j.status === "MATRICULADO" || (j.status as any) === "CURSANDO") matriculados++;
      if (j.status === "CONCLUIDO") {
        concluidos++;
        const cargaHoraria = (j as any).cursoSnapshot?.cargaHoraria;
        if (cargaHoraria) {
          const match = String(cargaHoraria).match(/\d+/);
          if (match) horasCertificadas += parseInt(match[0], 10);
        }
      }
    });

    return { preMatriculados, matriculados, concluidos, horasCertificadas };
  }, [jornadaCursos]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-[#ffffff] border border-[#f3f4f6] rounded-[16px] shadow-sm p-[20px] flex flex-col justify-center gap-[12px]">
          <div className="flex items-center gap-[8px]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#fefce8] text-[#ca8a04]">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-[#6b7280]">
              Cursos em<br />Pré-matrícula
            </span>
          </div>
          <span className="text-3xl font-bold text-[#111827]">
            {kpis.preMatriculados}
          </span>
        </div>

        <div className="bg-[#ffffff] border border-[#f3f4f6] rounded-[16px] shadow-sm p-[20px] flex flex-col justify-center gap-[12px]">
          <div className="flex items-center gap-[8px]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#eff6ff] text-[#2563eb]">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-[#6b7280]">
              Cursos em<br />Andamento
            </span>
          </div>
          <span className="text-3xl font-bold text-[#111827]">
            {kpis.matriculados}
          </span>
        </div>

        <div className="bg-[#ffffff] border border-[#f3f4f6] rounded-[16px] shadow-sm p-[20px] flex flex-col justify-center gap-[12px]">
          <div className="flex items-center gap-[8px]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f0fdf4] text-[#16a34a]">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-[#6b7280]">
              Cursos<br />Concluídos
            </span>
          </div>
          <span className="text-3xl font-bold text-[#111827]">
            {kpis.concluidos}
          </span>
        </div>

        <div className="bg-[#ffffff] border border-[#f3f4f6] rounded-[16px] shadow-sm p-[20px] flex flex-col justify-center gap-[12px]">
          <div className="flex items-center gap-[8px]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ecfeff] text-[#0891b2]">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-[#6b7280]">
              Horas de<br />Estudo
            </span>
          </div>
          <span className="text-3xl font-bold text-[#111827]">
            {kpis.horasCertificadas}h
          </span>
        </div>

      </div>
    </div>
  );
}
