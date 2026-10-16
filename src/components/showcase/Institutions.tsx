import { useRef, useState } from 'react';
import { useHomeStore } from '../../store/useHomeStore';
import { useInView } from '../../hooks/useInView';
import { optimizeImageUrl } from '../../lib/formatters';

function InstitutionLogo({ name, logoUrl, linkUrl }: { name: string; logoUrl?: string; linkUrl?: string }) {
  const [imgError, setImgError] = useState(false);

  const formatExternalUrl = (url?: string): string | undefined => {
    if (!url || typeof url !== 'string') return undefined;
    try {
      const trimmed = url.trim();
      if (!trimmed.startsWith('https://')) return undefined;
      const parsed = new URL(trimmed);
      return parsed.protocol === 'https:' && parsed.hostname ? parsed.href : undefined;
    } catch {
      return undefined;
    }
  };

  const formattedUrl = formatExternalUrl(linkUrl);

  const logoContent = (
    <>
      {logoUrl && !imgError ? (
        <img
          src={optimizeImageUrl(logoUrl, 260)}
          alt={`Logo ${name}`}
          width="200" height="106" loading="lazy"
          decoding="async"
          className="w-auto max-w-full h-[76px] sm:h-[90px] md:h-[106px] object-contain transition-transform duration-300 group-hover:scale-105 hc-invert"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-lg md:text-xl font-[800] text-[#003865] tracking-tight leading-[1.25] text-center transition-transform duration-300 group-hover:scale-105">
          {name}
        </span>
      )}
    </>
  );

  return (
    <div className="flex items-center justify-center group">
      {formattedUrl ? (
        <a href={formattedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 rounded-lg">
          {logoContent}
        </a>
      ) : (
        <div className="cursor-default flex items-center justify-center outline-none">
          {logoContent}
        </div>
      )}
    </div>
  );
}

export function Institutions() {
  const { instituicoes, loading } = useHomeStore();
  const ref = useRef(null);
  useInView(ref, { once: true, margin: "300px 0px" });

  if (instituicoes.length === 0 && !loading) {
    return null;
  }

  return (
    <section ref={ref}  className="w-full bg-[#ffffff] py-16 md:py-24 min-h-[300px]">
      <div 
        className="max-w-[896px] mx-auto px-[16px]"
      >
        <div className="max-w-[48rem] mx-auto text-center mb-16">
          <h2 className="text-xl font-bold text-[#111827] mb-4">
            Instituições Participantes
          </h2>
          <p className="text-sm text-[#4b5563] leading-[1.625]">
            O CRA-SP Educa é construído em parceria com instituições de excelência, comprometidas com<br className="hidden md:block" /> o desenvolvimento acadêmico, a evolução profissional e a inserção no mercado de trabalho.
          </p>
        </div>
        
        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-center justify-items-center gap-x-12 gap-y-6 sm:gap-x-16 sm:gap-y-8 md:gap-x-20 md:gap-y-10">
            {instituicoes.map((inst, idx) => (
              <div key={idx} className="w-full flex items-center justify-center scale-[0.80] sm:scale-[0.85] md:scale-[0.90]">
                <InstitutionLogo 
                  name={inst.sigla || inst.instituicao || inst.instituicaoCooperada || 'Instituição'} 
                  logoUrl={inst.logoUrl}
                  linkUrl={inst.site}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
