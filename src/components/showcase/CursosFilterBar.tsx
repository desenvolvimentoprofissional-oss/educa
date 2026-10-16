
export type CursosFilterBarProps = Readonly<{
  filtroInstituicao: string;
  setFiltroInstituicao: (val: string) => void;
  instituicoes: readonly string[];
  filtroArea: string;
  setFiltroArea: (val: string) => void;
  areas: readonly string[];
  filtroCarga: string;
  setFiltroCarga: (val: string) => void;
  cargasDisponiveis: ReadonlySet<string>;
}>;

const RANGES = [
  { id: "ate_4", label: "ATÉ 4 HORAS" },
  { id: "ate_12", label: "DE 5 A 12 HORAS" },
  { id: "ate_20", label: "DE 13 A 20 HORAS" },
  { id: "ate_40", label: "DE 21 A 40 HORAS" },
  { id: "ate_80", label: "DE 41 A 80 HORAS" },
  { id: "acima_80", label: "ACIMA DE 80 HORAS" },
];

export function CursosFilterBar({
  filtroInstituicao,
  setFiltroInstituicao,
  instituicoes,
  filtroArea,
  setFiltroArea,
  areas,
  filtroCarga,
  setFiltroCarga,
  cargasDisponiveis,
}: CursosFilterBarProps) {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
        <div className="flex flex-col">
          <label htmlFor="filtro-cursos-instituicao" className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-2">
            Instituição
          </label>
          <select
            id="filtro-cursos-instituicao"
            className="border border-[#d1d5db] bg-white text-[#374151] px-[16px] py-[12px] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] uppercase text-sm transition-all shadow-sm hover:border-[#9ca3af]"
            value={filtroInstituicao}
            onChange={(e) => setFiltroInstituicao(e.target.value)}
          >
            <option value="">TODAS AS INSTITUIÇÕES</option>
            {instituicoes.map((inst) => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="filtro-cursos-area" className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-2">
            Área
          </label>
          <select
            id="filtro-cursos-area"
            className="border border-[#d1d5db] bg-white text-[#374151] px-[16px] py-[12px] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] uppercase text-sm transition-all shadow-sm hover:border-[#9ca3af]"
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
            disabled={!filtroInstituicao && areas.length === 0}
          >
            <option value="">TODAS AS ÁREAS</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="filtro-cursos-carga" className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-2">
            Carga Horária
          </label>
          <select
            id="filtro-cursos-carga"
            className="border border-[#d1d5db] bg-white text-[#374151] px-[16px] py-[12px] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] uppercase text-sm transition-all shadow-sm hover:border-[#9ca3af]"
            value={filtroCarga}
            onChange={(e) => setFiltroCarga(e.target.value)}
            disabled={
              !filtroArea &&
              !filtroInstituicao &&
              cargasDisponiveis.size === 0
            }
          >
            <option value="">QUALQUER CARGA HORÁRIA</option>
            {RANGES.filter((r) => cargasDisponiveis.has(r.id)).map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
