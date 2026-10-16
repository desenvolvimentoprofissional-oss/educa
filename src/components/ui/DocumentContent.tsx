import React from 'react';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { DocumentType } from '../../hooks/useDocumentModal';
import { CookiesDoc } from './documents/CookiesDoc';
import { PrivacidadeDoc } from './documents/PrivacidadeDoc';
import { SegurancaDoc } from './documents/SegurancaDoc';
import { TermosDoc } from './documents/TermosDoc';

interface DocumentContentProps {
  currentDoc: DocumentType;
  bodyTextSize: string;
  textColor: string;
  subHeadingColor: string;
  headingColor: string;
  numberBg: string;
  numberText: string;
  boxBg: string;
  linkColor: string;
  markerColor: string;
  onClose?: () => void;
}

export const DocumentContent: React.FC<DocumentContentProps> = ({
  currentDoc, bodyTextSize, textColor, subHeadingColor, headingColor,
  numberBg, numberText, boxBg, linkColor, markerColor, onClose
}) => {
  const { resetAccessibility } = useAccessibilityStore();
  const docProps = { bodyTextSize, textColor, subHeadingColor, headingColor, numberBg, numberText, boxBg, linkColor, markerColor, onClose, resetAccessibility };

  switch (currentDoc) {
    case 'cookies':
      return <CookiesDoc {...docProps} />;
    case 'privacidade':
      return <PrivacidadeDoc {...docProps} />;
    case 'seguranca':
      return <SegurancaDoc {...docProps} />;
    case 'termos':
      return <TermosDoc {...docProps} />;
    default:
      return null;
  }
};