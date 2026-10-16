import { useState, useEffect } from 'react';

export type DocumentType = 'privacidade' | 'seguranca' | 'termos' | 'cookies';

export const useDocumentModal = (isOpen: boolean, initialDocument: DocumentType = 'privacidade') => {
  const [currentDoc, setCurrentDoc] = useState<DocumentType>(initialDocument);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) setCurrentDoc(initialDocument);
  }, [isOpen, initialDocument]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 1, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 1, 0));
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleHighContrast = () => setIsHighContrast(prev => !prev);
  
  const handleReset = () => {
    setZoomLevel(1);
    setIsDarkMode(false);
    setIsHighContrast(false);
  };

  const nextDocMap: Record<DocumentType, { type: DocumentType; label: string }> = {
    'privacidade': { type: 'seguranca', label: 'SEGURANÇA' },
    'seguranca': { type: 'termos', label: 'TERMOS DE USO' },
    'termos': { type: 'cookies', label: 'PREFERÊNCIAS' },
    'cookies': { type: 'privacidade', label: 'PRIVACIDADE' },
  };

  const handleNextDoc = () => {
    if (currentDoc === 'privacidade') setCurrentDoc('seguranca');
    else if (currentDoc === 'seguranca') setCurrentDoc('termos');
    else if (currentDoc === 'termos') setCurrentDoc('cookies');
    else setCurrentDoc('privacidade');
  };

  const getDocTitle = () => {
    if (currentDoc === 'privacidade') return 'PRIVACIDADE';
    if (currentDoc === 'seguranca') return 'SEGURANÇA';
    if (currentDoc === 'cookies') return 'PREFERÊNCIAS E SESSÃO';
    return 'TERMOS DE USO';
  };

  const getDocName = () => {
    if (currentDoc === 'privacidade') return 'Aviso de Privacidade do Site do Conselho Regional de Administração de São Paulo (CRA-SP)';
    if (currentDoc === 'seguranca') return 'Política de Segurança';
    if (currentDoc === 'cookies') return 'Preferências de Armazenamento Local';
    return 'Termo de Uso do Site do Conselho Regional de Administração de São Paulo (CRA-SP)';
  };

  return {
    currentDoc, zoomLevel, isDarkMode, isHighContrast,
    handleZoomIn, handleZoomOut, toggleDarkMode, toggleHighContrast,
    handleReset, handleNextDoc, getDocTitle, getDocName, nextDocMap,
  };
};
