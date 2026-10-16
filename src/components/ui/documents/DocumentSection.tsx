import React from 'react';

interface DocumentSectionProps {
  num: number;
  title: string;
  children: React.ReactNode;
  bodyTextSize: string;
  textColor: string;
  subHeadingColor: string;
  numberBg: string;
  numberText: string;
}

export const DocumentSection: React.FC<DocumentSectionProps> = ({
  num, title, children, bodyTextSize, textColor, subHeadingColor, numberBg, numberText
}) => (
  <div className="flex gap-4">
    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${bodyTextSize} mt-1 ${numberBg} ${numberText}`}>
      {num}
    </div>
    <div className="w-full">
      <h4 className={`font-bold text-[11px] md:text-xs tracking-[0.15em] uppercase mb-[12px] mt-1.5 ${subHeadingColor}`}>
        {title}
      </h4>
      <div className={`font-normal leading-relaxed ${bodyTextSize} ${textColor}`}>
        {children}
      </div>
    </div>
  </div>
);
