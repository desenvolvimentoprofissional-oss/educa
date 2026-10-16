export type VagasFilterBarProps = Readonly<{
  filtroEmpresa: string;
  setFiltroEmpresa: (val: string) => void;
  empresas: readonly string[];
  filtroTipoVaga: string;
  setFiltroTipoVaga: (val: string) => void;
  tiposDeVaga: readonly string[];
  filtroCidade: string;
  setFiltroCidade: (val: string) => void;
  cidades: readonly string[];
  filtroBolsa: string;
  setFiltroBolsa: (val: string) => void;
  bolsasDisponiveis: ReadonlySet<string>;
}>;

const BOLSA_RANGES = [
  { id: "ate_500", label: "ATÉ R$ 500,00" },
  { id: "ate_1000", label: "DE R$ 501,00 A R$ 1.000,00" },
  { id: "ate_1500", label: "DE R$ 1.001,00 A R$ 1.500,00" },
  { id: "ate_2000", label: "DE R$ 1.501,00 A R$ 2.000,00" },
  { id: "acima_2000", label: "ACIMA DE R$ 2.000,00" },
];

export function VagasFilterBar({
  filtroEmpresa,
  setFiltroEmpresa,
  empresas,
  filtroTipoVaga,
  setFiltroTipoVaga,
  tiposDeVaga,
  filtroCidade,
  setFiltroCidade,
  cidades,
  filtroBolsa,
  setFiltroBolsa,
  bolsasDisponiveis,
}: VagasFilterBarProps) {
  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-[24px]">
        <div className="flex flex-col">
          <label htmlFor="filtro-vagas-instituicao" className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-2">
            Instituição
          </label>
          <select
            id="filtro-vagas-instituicao"
            className="border border-[#d1d5db] bg-white text-[#374151] px-[16px] py-[12px] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] uppercase text-sm transition-all shadow-sm hover:border-[#9ca3af]"
            value={filtroEmpresa}
            onChange={(e) => setFiltroEmpresa(e.target.value)}
          >
            <option value="">TODAS AS INSTITUIÇÕES</option>
            {empresas.map((empresa) => (
              <option key={empresa} value={empresa}>
                {empresa}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="filtro-vagas-tipo" className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-2">
            Tipo de Vaga
          </label>
          <select
            id="filtro-vagas-tipo"
            className="border border-[#d1d5db] bg-white text-[#374151] px-[16px] py-[12px] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] uppercase text-sm transition-all shadow-sm hover:border-[#9ca3af]"
            value={filtroTipoVaga}
            onChange={(e) => setFiltroTipoVaga(e.target.value)}
            disabled={!filtroEmpresa && tiposDeVaga.length === 0}
          >
            <option value="">TODOS OS TIPOS</option>
            {tiposDeVaga.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="filtro-vagas-municipio" className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-2">
            Município
          </label>
          <select
            id="filtro-vagas-municipio"
            className="border border-[#d1d5db] bg-white text-[#374151] px-[16px] py-[12px] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] uppercase text-sm transition-all shadow-sm hover:border-[#9ca3af]"
            value={filtroCidade}
            onChange={(e) => setFiltroCidade(e.target.value)}
            disabled={!filtroEmpresa && !filtroTipoVaga && cidades.length === 0}
          >
            <option value="">TODOS OS MUNICÍPIOS</option>
            {cidades.map((cidade) => (
              <option key={cidade} value={cidade}>
                {cidade}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="filtro-vagas-bolsa" className="text-xs uppercase font-bold text-gray-500 tracking-widest mb-2">
            Bolsa / Salário
          </label>
          <select
            id="filtro-vagas-bolsa"
            className="border border-[#d1d5db] bg-white text-[#374151] px-[16px] py-[12px] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] uppercase text-sm transition-all shadow-sm hover:border-[#9ca3af]"
            value={filtroBolsa}
            onChange={(e) => setFiltroBolsa(e.target.value)}
            disabled={
              !filtroCidade && !filtroEmpresa && !filtroTipoVaga && bolsasDisponiveis.size === 0
            }
          >
            <option value="">QUALQUER VALOR</option>
            {BOLSA_RANGES.filter((r) => bolsasDisponiveis.has(r.id)).map(
              (r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ),
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
