import { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useHomeStore } from '../../store/useHomeStore';
import { useInView } from '../../hooks/useInView';

interface FaqItemProps {
  index: number;
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

function FaqItem({ index, question, answer, isOpen, onClick }: FaqItemProps) {
  const panelId = `faq-panel-${index}`;
  return (
    <div className="border-b border-[#e5e7eb] last:border-b-0">
      <button 
        type="button"
        onClick={onClick}
        className="flex items-center justify-between w-full py-6 group text-left"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="text-base font-semibold text-[#111827] pr-4 group-hover:text-[#2563eb] transition-colors">
          {question}
        </span>
        <div className="w-8 h-8 rounded-full bg-[#f9fafb] group-hover:bg-[#eff6ff] flex items-center justify-center shrink-0 transition-colors">
          <ChevronDown 
            className={`w-5 h-[20px] text-[#6b7280] group-hover:text-[#2563eb] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </div>
      </button>
      
      <div 
        id={panelId}
        aria-hidden={!isOpen}
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-[24rem] opacity-100 pb-6' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-sm text-[#4b5563] leading-[1.625]">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { perguntas, loading } = useHomeStore();
  const ref = useRef(null);
  useInView(ref, { once: true, margin: "300px 0px" });

  if (perguntas.length === 0 && !loading) {
    return null;
  }

  const visibleFaqs = isExpanded ? perguntas : perguntas.slice(0, 3);
  const hasMore = perguntas.length > 3;

  const handleToggleExpand = () => {
    if (isExpanded) setOpenIndex(null);
    setIsExpanded(!isExpanded);
  };

  return (
    <section ref={ref}  className="w-full bg-[#f9fafb] py-16 md:py-24 min-h-[500px]">
      <div 
        className="max-w-[896px] mx-auto px-[16px]"
      >
        <h2 className="text-xl font-bold text-[#111827] text-center mb-12">
          Dúvidas Frequentes
        </h2>
        
        <div className="bg-[#ffffff] border border-[#f3f4f6] rounded-[16px] shadow-sm p-6 md:p-8">
          {visibleFaqs.map((faq, index) => (
            <FaqItem 
              key={index}
              index={index}
              question={faq.pergunta}
              answer={faq.resposta}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
          
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleToggleExpand}
                className="flex items-center justify-center rounded-full bg-[rgba(239,246,255,0.5)] border border-[#dbeafe] py-[10px] px-6 text-sm font-medium text-[#1e40af] transition-colors hover:bg-[#eff6ff] hc-border hc-no-underline"
                aria-expanded={isExpanded}
              >
                {isExpanded ? 'Ver menos perguntas' : 'Ver mais perguntas'}
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
